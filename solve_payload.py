#!/usr/bin/env python3
import hashlib
import itertools
import re
from pathlib import Path

PAYLOAD_FILE = "intercepted_payload.dat"

KNOWN_VALUES = [
    "FLAG{FL16H7_L06_D3CRYPT3D}",
    "FLAG{FLAG_ROGUE_SIGNAL_ABC123}",
    "INT_COMMS_KEY_AE_X789",
]

FLAG_RE = re.compile(rb"FLAG\{[^}]*\}")

def xor_repeat(data, key_bytes):
    return bytes(data[i] ^ key_bytes[i % len(key_bytes)] for i in range(len(data)))

def build_keys():
    keys = set()
    for v in KNOWN_VALUES:
        keys.add(v)

    for r in range(2, len(KNOWN_VALUES) + 1):
        for combo in itertools.permutations(KNOWN_VALUES, r):
            joined = "".join(combo)
            keys.add(joined)
            keys.add(hashlib.md5(joined.encode()).hexdigest())
            keys.add(hashlib.sha1(joined.encode()).hexdigest())
            keys.add(hashlib.sha256(joined.encode()).hexdigest())
    return list(keys)

def save_candidate(name, data):
    Path("candidates").mkdir(exist_ok=True)
    with open(f"candidates/{name}.bin", "wb") as f:
        f.write(data)

def main():
    with open(PAYLOAD_FILE, "rb") as f:
        data = f.read()

    if data.startswith(b"PAYL"):
        data = data[4:]

    found = False

    for key in range(256):
        dec = bytes(b ^ key for b in data)
        if b"FLAG{" in dec:
            print("[+] Single-byte XOR:", hex(key))
            print(dec)
            found = True

    for key in build_keys():
        dec = xor_repeat(data, key.encode())
        if b"FLAG{" in dec:
            print("[+] Candidate key:", key)
            try:
                print(dec.decode())
            except:
                print(dec)
            found = True

    if not found:
        print("No flag recovered. Additional key material may be required.")

if __name__ == "__main__":
    main()
