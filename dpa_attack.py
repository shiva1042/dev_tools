#!/usr/bin/env python3
"""
Differential Power Analysis (DPA) attack on a hardware AES-128 implementation
-- Paul Kocher's original difference-of-means method (1999).

Recovers the 128-bit master key from power traces by partitioning traces on a
predicted bit and looking for a difference-of-means spike, then inverts the AES
key schedule.

Usage:
    python3 dpa_attack.py traces_AES_2026.csv

CSV format:
    col 0  : plaintext  (32 hex chars)
    col 1  : ciphertext (32 hex chars)
    col 2+ : power-trace sample points (integers)
"""
import sys
import csv
import numpy as np

# ---------------------------------------------------------------- AES tables
SBOX = bytes.fromhex(
    "637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0"
    "b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b275"
    "09832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cf"
    "d0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2"
    "cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdb"
    "e0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08"
    "ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9e"
    "e1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16")
INV_SBOX = bytearray(256)
for _i, _v in enumerate(SBOX):
    INV_SBOX[_v] = _i
INV_SBOX = np.frombuffer(bytes(INV_SBOX), dtype=np.uint8)
RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

# Last-round leak window (samples where the final register update is visible).
# Set to None to search the whole trace.
LEAK_WINDOW = slice(58, 64)


def shiftrows_partner(i):
    """Ciphertext byte that shares the same register cell as byte i across the
    last-round transition.  g(i) = row + 4*((col + row) mod 4)."""
    r, c = i % 4, i // 4
    return r + 4 * ((c + r) % 4)


def load(path):
    pt, ct, tr = [], [], []
    with open(path) as f:
        rdr = csv.reader(f)
        next(rdr)
        for row in rdr:
            pt.append(int(row[0], 16).to_bytes(16, "big"))
            ct.append(int(row[1], 16).to_bytes(16, "big"))
            tr.append([float(x) for x in row[2:] if x != ""])
    pt = np.array([list(b) for b in pt], dtype=np.uint8)
    ct = np.array([list(b) for b in ct], dtype=np.uint8)
    tr = np.array(tr, dtype=np.float64)
    return pt, ct, tr


# ---------------------------------------------------------------- DPA core
def recover_round10_key(ct, traces, verbose=True):
    """Kocher difference-of-means DPA on the last round.

    Selection function: the bits of the register transition value
        D(C, k) = InvSbox(C[i] XOR k) XOR C[g(i)]
    For each key guess and each bit, partition traces into D-bit = 0 / 1, take
    the difference of the group means (DoM).  The correct key yields a tall DoM
    spike; wrong keys give a flat DoM.  We sum |DoM| over the 8 bits at each
    sample (multi-bit DPA) and score by the tallest spike in the leak window.
    """
    N = traces.shape[0]
    Tsum = traces.sum(axis=0)
    guesses = np.arange(256, dtype=np.uint8)
    win = LEAK_WINDOW if LEAK_WINDOW is not None else slice(0, traces.shape[1])
    k10 = []
    if verbose:
        print("Recovering round-10 key (Kocher DPA, difference of means):")
    for b in range(16):
        c_i = ct[:, b][:, None]
        c_p = ct[:, shiftrows_partner(b)][:, None]
        D = INV_SBOX[c_i ^ guesses[None, :]] ^ c_p          # (N, 256) transition value
        agg = np.zeros((256, traces.shape[1]))
        for bit in range(8):
            sel = ((D >> bit) & 1).astype(np.float64)        # (N, 256) selection bit
            n1 = sel.sum(axis=0)
            s1 = sel.T @ traces                              # sum of "bit=1" traces
            s0 = Tsum[None, :] - s1
            n0 = N - n1
            dom = s1 / n1[:, None] - s0 / n0[:, None]        # difference of means
            agg += np.abs(dom)
        score = agg[:, win].max(axis=1)
        k = int(score.argmax())
        sample = win.start + int(agg[k, win].argmax())
        runner = np.sort(score)[-2]
        k10.append(k)
        if verbose:
            print(f"  byte {b:2d}: 0x{k:02x}  peak\u03A3|DoM|={score[k]:.3f}  "
                  f"@sample {sample:3d}  (margin {score[k]-runner:+.3f})")
    return bytes(k10)


# ---------------------------------------------------------------- key schedule
def invert_key_schedule(rk_last):
    """Run the AES-128 key schedule backwards: round-10 key -> master key."""
    w = [None] * 44
    for i in range(4):
        w[40 + i] = list(rk_last[4 * i:4 * i + 4])
    for i in range(43, 3, -1):
        t = list(w[i - 1])
        if i % 4 == 0:
            t = t[1:] + t[:1]                 # RotWord
            t = [SBOX[x] for x in t]          # SubWord
            t[0] ^= RCON[i // 4 - 1]          # Rcon
        w[i - 4] = [w[i][j] ^ t[j] for j in range(4)]
    return b"".join(bytes(w[i]) for i in range(4))


# ---------------------------------------------------------------- AES (verify)
def _xt(a):
    a <<= 1
    return (a ^ 0x11b) & 0xff if a & 0x100 else a & 0xff


def aes_encrypt(pt, key):
    def expand(k):
        w = [list(k[i:i + 4]) for i in range(0, 16, 4)]
        for i in range(4, 44):
            t = list(w[i - 1])
            if i % 4 == 0:
                t = [SBOX[x] for x in (t[1:] + t[:1])]
                t[0] ^= RCON[i // 4 - 1]
            w.append([w[i - 4][j] ^ t[j] for j in range(4)])
        return w
    w = expand(key)
    s = [[pt[r + 4 * c] for c in range(4)] for r in range(4)]

    def ark(rnd):
        for c in range(4):
            for r in range(4):
                s[r][c] ^= w[rnd * 4 + c][r]
    ark(0)
    for rnd in range(1, 10):
        for r in range(4):
            for c in range(4):
                s[r][c] = SBOX[s[r][c]]
        for r in range(1, 4):
            s[r] = s[r][r:] + s[r][:r]
        for c in range(4):
            col = [s[r][c] for r in range(4)]
            s[0][c] = _xt(col[0]) ^ (_xt(col[1]) ^ col[1]) ^ col[2] ^ col[3]
            s[1][c] = col[0] ^ _xt(col[1]) ^ (_xt(col[2]) ^ col[2]) ^ col[3]
            s[2][c] = col[0] ^ col[1] ^ _xt(col[2]) ^ (_xt(col[3]) ^ col[3])
            s[3][c] = (_xt(col[0]) ^ col[0]) ^ col[1] ^ col[2] ^ _xt(col[3])
        ark(rnd)
    for r in range(4):
        for c in range(4):
            s[r][c] = SBOX[s[r][c]]
    for r in range(1, 4):
        s[r] = s[r][r:] + s[r][:r]
    ark(10)
    return bytes(s[r][c] for c in range(4) for r in range(4))


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "traces_AES_2026.csv"
    pt, ct, traces = load(path)
    print(f"Loaded {traces.shape[0]} traces x {traces.shape[1]} samples\n")

    k10 = recover_round10_key(ct, traces)
    print("\nRound-10 key :", k10.hex())

    master = invert_key_schedule(k10)
    print("Master key K :", master.hex())

    tot = min(2000, len(pt))
    ok = sum(aes_encrypt(bytes(pt[i]), master) == bytes(ct[i]) for i in range(tot))
    print(f"Verification : {ok}/{tot} plaintext->ciphertext pairs match")
    print("\nFLAG: Flag{%s}" % master.hex())


if __name__ == "__main__":
    main()
