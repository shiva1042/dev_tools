#!/usr/bin/env python3
import hashlib
import itertools

# Encrypted payload
encrypted_hex = "92839b8ed1ccd5c8dbc7dec0c6cadac2cdc7dadad3b9bbded3dad7c1d3c7c4dad3d1dccbc6dcd7c1d1c2cfc7ddcda6c2d3d7a1bda6adabb6a5a3d7c1dcb9b6bfa3bbb5bda3b1bbcfded7a1bba2b3"
encrypted = bytes.fromhex(encrypted_hex.replace(" ", ""))

KNOWN_VALUES = [
    "FLAG{FL16H7_L06_D3CRYPT3D}",
    "FLAG{FLAG_ROGUE_SIGNAL_ABC123}",
    "INT_COMMS_KEY_AE_X789",
]

def xor_repeat(data, key_bytes):
    return bytes(data[i] ^ key_bytes[i % len(key_bytes)] for i in range(len(data)))

print(f"[*] Encrypted payload length: {len(encrypted)} bytes")
print(f"[*] Testing all key combinations...\n")

# Test all combinations with different hash functions
all_results = []

# Test just the strings
print("[*] Testing plain strings...")
for kv in KNOWN_VALUES:
    dec = xor_repeat(encrypted, kv.encode())
    if b"FLAG{" in dec:
        result = dec.decode(errors='replace')
        print(f"[+] Plain string: {kv}")
        print(f"    Result: {result}\n")
        all_results.append((kv, result))

# Test hashes of individual values
print("[*] Testing hashes of individual values...")
for kv in KNOWN_VALUES:
    for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256)]:
        hash_key = hash_func(kv.encode()).hexdigest()
        dec = xor_repeat(encrypted, hash_key.encode())
        if b"FLAG{" in dec:
            result = dec.decode(errors='replace')
            print(f"[+] {hash_name}({kv})")
            print(f"    Key: {hash_key}")
            print(f"    Result: {result}\n")
            all_results.append((hash_key, result))

# Test permutations (2 values)
print("[*] Testing 2-value permutations...")
for r in range(2, 3):
    for combo in itertools.permutations(KNOWN_VALUES, r):
        joined = "".join(combo)
        # Test plain concatenation
        dec = xor_repeat(encrypted, joined.encode())
        if b"FLAG{" in dec:
            result = dec.decode(errors='replace')
            print(f"[+] Concatenated: {joined}")
            print(f"    Result: {result}\n")
            all_results.append((joined, result))
        
        # Test hash of concatenation
        for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256)]:
            hash_key = hash_func(joined.encode()).hexdigest()
            dec = xor_repeat(encrypted, hash_key.encode())
            if b"FLAG{" in dec:
                result = dec.decode(errors='replace')
                print(f"[+] {hash_name}(concat): {joined}")
                print(f"    Key: {hash_key}")
                print(f"    Result: {result}\n")
                all_results.append((hash_key, result))

# Test 3-value permutations
print("[*] Testing 3-value permutations...")
for combo in itertools.permutations(KNOWN_VALUES, 3):
    joined = "".join(combo)
    # Test hash of concatenation
    for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256)]:
        hash_key = hash_func(joined.encode()).hexdigest()
        dec = xor_repeat(encrypted, hash_key.encode())
        if b"FLAG{" in dec:
            result = dec.decode(errors='replace')
            print(f"[+] {hash_name}(3-combo): {joined[:50]}...")
            print(f"    Key: {hash_key}")
            print(f"    Result: {result}\n")
            all_results.append((hash_key, result))

print(f"\n[*] Total matches found: {len(all_results)}")
if all_results:
    print("\n[=== SUMMARY ===]")
    for key, result in all_results:
        print(f"Key: {key}")
        print(f"Result: {result}\n")
else:
    print("[-] No matches found with tested keys")
