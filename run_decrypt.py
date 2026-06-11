#!/usr/bin/env python3
import hashlib
import itertools

# Encrypted payload (provided hex string)
encrypted_hex = "92839b8ed1ccd5c8dbc7dec0c6cadac2cdc7dadad3b9bbded3dad7c1d3c7c4dad3d1dccbc6dcd7c1d1c2cfc7ddcda6c2d3d7a1bda6adabb6a5a3d7c1dcb9b6bfa3bbb5bda3b1bbcfded7a1bba2b3"
encrypted = bytes.fromhex(encrypted_hex.replace(" ", ""))

KNOWN_VALUES = [
    "FLAG{FL16H7_L06_D3CRYPT3D}",
    "FLAG{FLAG_ROGUE_SIGNAL_ABC123}",
    "INT_COMMS_KEY_AE_X789",
]

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

print("[*] Testing single-byte XOR keys (0-255)...")
found = False
for key in range(256):
    dec = bytes(b ^ key for b in encrypted)
    if b"FLAG{" in dec:
        print(f"[+] Single-byte XOR key: {hex(key)}")
        print(f"[+] Decrypted:\n{dec.decode()}\n")
        found = True

if not found:
    print("[-] No single-byte XOR key found\n")

print("[*] Building compound keys from known values...")
keys = build_keys()
print(f"[*] Testing {len(keys)} candidate keys...\n")

found = False
for i, key in enumerate(keys):
    dec = xor_repeat(encrypted, key.encode())
    if b"FLAG{" in dec:
        print(f"[+] KEY FOUND!")
        print(f"[+] Candidate key: {key}")
        print(f"[+] Decrypted content:\n{dec.decode()}\n")
        found = True

if not found:
    print("[-] No flag found with any key combination")
