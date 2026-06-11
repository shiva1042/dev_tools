#!/usr/bin/env python3
"""
Challenge 1 → Challenge 6 Flag Extraction
Using known plaintext attack to derive XOR key and decrypt payload
"""

import zlib

# Challenge 1: Known decrypted data
c1_plaintext = b"FL16H7_L06_D3CRYPT3D"

# Drone file (encrypted) - raw bytes
drone_hex = "3abe3831b3b02622362022b32522242ba5f39219b5b459a20cf774077a033f615a5a7c79b8b8b9e2d97efb88e28595e7e9c858e6e6b9c878f7b6a706282ba87cb544b7c51ba"
drone_bytes = bytes.fromhex(drone_hex)

# Payload (encrypted) - raw bytes
payload_hex = "5041594ce68ba1e9bbe78da8e77a8da28e2989899e9a8a44de8a8bccb6d39dbce88aef4d9e98eabee5ba905e68a2e5bfa983afe8a98dbd40efbc91e5b9a0e68baebbbd342"
payload_bytes = bytes.fromhex(payload_hex)

def xor_decrypt(data, key):
    """XOR decrypt with repeating key"""
    result = bytearray()
    for i, byte in enumerate(data):
        result.append(byte ^ key[i % len(key)])
    return bytes(result)

print("="*80)
print("CHALLENGE 1 → CHALLENGE 6 DECRYPTION")
print("="*80)

print("\n[STEP 1] Extract XOR Key using Known Plaintext Attack")
print("-" * 80)
print(f"Known Plaintext (Challenge 1): {c1_plaintext.decode()}")
print(f"Plaintext Length: {len(c1_plaintext)} bytes")

# Try all offsets in drone file to find key
keys_found = []

for offset in range(len(drone_bytes) - len(c1_plaintext) + 1):
    derived_key = bytearray()
    for i in range(len(c1_plaintext)):
        key_byte = drone_bytes[offset + i] ^ c1_plaintext[i]
        derived_key.append(key_byte)
    
    derived_key = bytes(derived_key)
    keys_found.append((offset, derived_key))

# Print candidates with low entropy (likely candidates)
print(f"\nTesting {len(keys_found)} possible keys...")
print("\nTop Key Candidates:")

for offset, key in keys_found[:10]:
    # Count unique bytes (entropy)
    unique = len(set(key[:min(16, len(key))]))
    print(f"  Offset {offset:2d}: {key[:16].hex()} (unique: {unique}/16)")

# Use first key as primary candidate
xor_key = keys_found[0][1]
print(f"\n✓ Primary Key: {xor_key.hex()}")

print("\n[STEP 2] Verify Key - Decrypt Drone File")
print("-" * 80)

decrypted_drone = xor_decrypt(drone_bytes, xor_key)
print(f"Decrypted Drone (first 30 bytes): {decrypted_drone[:30]}")

# Check for plaintext
if c1_plaintext in decrypted_drone:
    idx = decrypted_drone.find(c1_plaintext)
    print(f"✓ Plaintext found at position {idx}")
    print(f"  Context: {decrypted_drone[max(0,idx-10):idx+len(c1_plaintext)+10]}")

print("\n[STEP 3] Decrypt Challenge 6 Payload")
print("-" * 80)

payload_header = payload_bytes[:4]
payload_data = payload_bytes[4:]

print(f"Payload Header: {payload_header}")
print(f"Payload Data Size: {len(payload_data)} bytes")

decrypted_payload = xor_decrypt(payload_data, xor_key)
print(f"\nDecrypted Payload (raw): {decrypted_payload}")
print(f"Decrypted Payload (hex): {decrypted_payload.hex()}")

# Try decompression
try:
    decompressed = zlib.decompress(decrypted_payload)
    print(f"\n✓ Decompression successful!")
    print(f"Decompressed: {decompressed}")
    final_data = decompressed
except:
    print(f"\n✗ No zlib compression detected")
    final_data = decrypted_payload

print("\n[STEP 4] Extract Flag from Challenge 6")
print("-" * 80)

# Search for FLAG pattern
if b"FLAG" in final_data:
    flag_start = final_data.find(b"FLAG")
    flag_end = final_data.find(b"}", flag_start) + 1
    flag_c6 = final_data[flag_start:flag_end]
    print(f"✓✓✓ CHALLENGE 6 FLAG FOUND:")
    print(f"\n    {flag_c6.decode()}\n")
elif b"flag" in final_data.lower():
    print(f"! Flag pattern (lowercase) detected")
    print(f"Full data: {final_data}")
else:
    print(f"✗ No FLAG pattern found")
    print(f"Full decrypted data: {final_data}")
    print(f"\nSearching for readable patterns...")
    
    # Try to find ASCII sequences
    ascii_chars = []
    for byte in final_data:
        if 32 <= byte <= 126:
            ascii_chars.append(chr(byte))
        else:
            if ascii_chars:
                word = "".join(ascii_chars)
                if len(word) > 3:
                    print(f"  Found: {word}")
                ascii_chars = []

print("\n[STEP 5] Brute Force Single-Byte Keys (Fallback)")
print("-" * 80)

for key_val in range(256):
    key_single = bytes([key_val])
    dec = xor_decrypt(payload_data, key_single)
    
    if b"FLAG" in dec:
        print(f"✓ Single-byte key 0x{key_val:02x} works!")
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        print(f"  FLAG: {flag.decode()}\n")

print("="*80)
print("ANALYSIS COMPLETE")
print("="*80)
