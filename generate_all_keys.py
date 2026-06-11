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

# Also test without FLAG{} wrapper
SIMPLE_VALUES = [
    "FL16H7_L06_D3CRYPT3D",
    "FLAG_ROGUE_SIGNAL_ABC123",
    "INT_COMMS_KEY_AE_X789",
]

def xor_repeat(data, key_bytes):
    return bytes(data[i] ^ key_bytes[i % len(key_bytes)] for i in range(len(data)))

def build_all_keys():
    """Generate all possible keys from known values"""
    keys = []
    
    # 1. Plain strings
    for v in KNOWN_VALUES:
        keys.append(("plain", v, v))
    for v in SIMPLE_VALUES:
        keys.append(("plain", v, v))
    
    # 2. Individual hashes
    for v in KNOWN_VALUES + SIMPLE_VALUES:
        for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256), ("SHA512", hashlib.sha512)]:
            h = hash_func(v.encode()).hexdigest()
            keys.append((hash_name, v, h))
    
    # 3. 2-value combinations
    for r in [2]:
        for combo in itertools.permutations(KNOWN_VALUES, r):
            joined = "".join(combo)
            keys.append(("concat", f"{combo[0][:20]}...+{combo[1][:20]}...", joined))
            for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256), ("SHA512", hashlib.sha512)]:
                h = hash_func(joined.encode()).hexdigest()
                keys.append((f"{hash_name}(2-combo)", f"{combo[0][:15]}+{combo[1][:15]}", h))
    
    # 4. 3-value combination
    joined = "".join(KNOWN_VALUES)
    keys.append(("concat-all", "all-3-values", joined))
    for hash_name, hash_func in [("MD5", hashlib.md5), ("SHA1", hashlib.sha1), ("SHA256", hashlib.sha256), ("SHA512", hashlib.sha512)]:
        h = hash_func(joined.encode()).hexdigest()
        keys.append((f"{hash_name}(all)", "all-3-values", h))
    
    return keys

print(f"[*] Encrypted payload length: {len(encrypted)} bytes\n")
print("[*] Generating all possible keys...\n")

all_keys = build_all_keys()
print(f"[*] Total keys to test: {len(all_keys)}\n")

matches = []

# Test all keys
for i, (key_type, key_desc, key_value) in enumerate(all_keys):
    if i % 50 == 0:
        print(f"[*] Testing key {i}/{len(all_keys)}...")
    
    try:
        dec = xor_repeat(encrypted, key_value.encode())
        
        # Check for FLAG{ pattern
        if b"FLAG{" in dec:
            try:
                result_text = dec.decode('utf-8')
            except:
                result_text = dec.decode('utf-8', errors='replace')
            
            matches.append({
                'type': key_type,
                'description': key_desc,
                'key': key_value,
                'result': result_text
            })
            
            print(f"\n[+] MATCH FOUND!")
            print(f"    Type: {key_type}")
            print(f"    Description: {key_desc}")
            print(f"    Key: {key_value}")
            print(f"    Result: {result_text}\n")
    except Exception as e:
        pass

print(f"\n[=== FINAL RESULTS ===]")
print(f"Total matches found: {len(matches)}\n")

if matches:
    for i, match in enumerate(matches, 1):
        print(f"Match #{i}:")
        print(f"  Type: {match['type']}")
        print(f"  Description: {match['description']}")
        print(f"  Key: {match['key']}")
        print(f"  Result: {match['result']}")
        print()
    
    # Save results
    with open("decryption_results.txt", "w") as f:
        for i, match in enumerate(matches, 1):
            f.write(f"Match #{i}:\n")
            f.write(f"  Type: {match['type']}\n")
            f.write(f"  Description: {match['description']}\n")
            f.write(f"  Key: {match['key']}\n")
            f.write(f"  Result: {match['result']}\n\n")
    print("[+] Results saved to decryption_results.txt")
else:
    print("[-] No matches found!")
