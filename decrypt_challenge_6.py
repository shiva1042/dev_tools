#!/usr/bin/env python3
"""
Challenge 1 → Challenge 6 Flag Extraction
Using known plaintext attack to derive XOR key and decrypt payload
"""

import base64
import zlib

# Challenge 1: Known decrypted data
c1_plaintext = b"FL16H7_L06_D3CRYPT3D"

# Drone file (encrypted) - BASE64 encoded
drone_b64 = "OsucMcKzwrAmIjYgIsKyJSQiwrpfOSHigJ0YWwxF4oCdw7R3Ox3DsWFfWlp8ecKPy5x5wo/igJTCj+KApuKAnMO/y5zCj+KApuKAmcW9woF+xZPigKbigJpuxZPigKHFoXtqcGLigKDFocOnVEIdfFHFoA=="
drone_bytes = base64.b64decode(drone_b64)

# Payload (encrypted) - BASE64 encoded
payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)

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
print(f"\nDrone File Size: {len(drone_bytes)} bytes")
print(f"Drone File (hex): {drone_bytes.hex()}")

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
print(f"\n✓ Primary Key (offset 0): {xor_key.hex()}")
print(f"  Key bytes: {repr(xor_key)}")

print("\n[STEP 2] Verify Key - Decrypt Drone File")
print("-" * 80)

decrypted_drone = xor_decrypt(drone_bytes, xor_key)
print(f"Decrypted Drone (first 50 bytes): {decrypted_drone[:50]}")
print(f"Decrypted Drone (hex): {decrypted_drone.hex()}")

# Check for plaintext
if c1_plaintext in decrypted_drone:
    idx = decrypted_drone.find(c1_plaintext)
    print(f"✓ Plaintext found at position {idx}")
    print(f"  Context: {decrypted_drone[max(0,idx-10):idx+len(c1_plaintext)+10]}")

# Try decompression on drone file
print("\nAttempting zlib decompression on drone file...")
try:
    decompressed_drone = zlib.decompress(decrypted_drone)
    print(f"✓ Drone file decompressed successfully!")
    print(f"  Decompressed: {decompressed_drone[:100]}")
except Exception as e:
    print(f"✗ Drone decompression failed: {e}")

print("\n[STEP 3] Decrypt Challenge 6 Payload")
print("-" * 80)

payload_header = payload_bytes[:4]
payload_data = payload_bytes[4:]

print(f"Payload Header: {payload_header} = {repr(payload_header)}")
print(f"Payload Data Size: {len(payload_data)} bytes")
print(f"Payload Data (hex): {payload_data.hex()}")

decrypted_payload = xor_decrypt(payload_data, xor_key)
print(f"\nDecrypted Payload: {decrypted_payload}")
print(f"Decrypted Payload (hex): {decrypted_payload.hex()}")

# Try decompression
final_data = decrypted_payload
try:
    decompressed = zlib.decompress(decrypted_payload)
    print(f"\n✓ Payload decompression successful!")
    print(f"  Decompressed: {decompressed}")
    final_data = decompressed
except Exception as e:
    print(f"\n✗ No zlib compression: {e}")
    print(f"  Using raw decrypted data")

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
    print(f"✗ No FLAG pattern found in decrypted data")
    print(f"\nFull decrypted payload: {final_data}")
    print(f"Full (repr): {repr(final_data)}")
    
    # Try to find ASCII sequences
    print(f"\nSearching for readable ASCII patterns...")
    ascii_chars = []
    for byte in final_data:
        if 32 <= byte <= 126:
            ascii_chars.append(chr(byte))
        else:
            if ascii_chars:
                word = "".join(ascii_chars)
                if len(word) > 2:
                    print(f"  Found: {word}")
                ascii_chars = []

print("\n[STEP 5] Brute Force Single-Byte Keys (Fallback)")
print("-" * 80)

found_flags = []
for key_val in range(256):
    key_single = bytes([key_val])
    dec = xor_decrypt(payload_data, key_single)
    
    if b"FLAG" in dec:
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        found_flags.append((key_val, flag.decode()))
        print(f"✓ Single-byte key 0x{key_val:02x}:")
        print(f"  {flag.decode()}")

if not found_flags:
    print("✗ No single-byte keys produced FLAG pattern")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
