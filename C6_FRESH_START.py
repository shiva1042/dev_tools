#!/usr/bin/env python3
"""
Challenge 6: Complete Fresh Start
Extract key from Challenge 1, decrypt Challenge 6 payload
"""

import base64
import zlib

# Challenge 1: Drone file
drone_b64 = "OsucMcKzwrAmIjYgIsKyJSQiwrpfOSHigJ0YWwxF4oCdw7R3Ox3DsWFfWlp8ecKPy5x5wo/igJTCj+KApuKAnMO/y5zCj+KApuKAmcW9woF+xZPigKbigJpuxZPigKHFoXtqcGLigKDFocOnVEIdfFHFoA=="
drone_bytes = base64.b64decode(drone_b64)

print("="*80)
print("CHALLENGE 1 → CHALLENGE 6: FRESH START")
print("="*80)

print("\n[STEP 1] Challenge 1 Drone File")
print("-" * 80)
print(f"Hex: {drone_bytes.hex()}")
print(f"Size: {len(drone_bytes)} bytes")

# The Challenge 1 plaintext (confirmed correct)
c1_flag = b"FL16H7_L06_D3CRYPT3D"
print(f"Known Plaintext: {c1_flag.decode()}")

# Extract XOR key by XORing ciphertext with known plaintext
xor_key = bytes([drone_bytes[i] ^ c1_flag[i] for i in range(len(c1_flag))])
print(f"\n✓ Extracted XOR Key: {xor_key.hex()}")
print(f"  Key (bytes): {repr(xor_key)}")
print(f"  Key length: {len(xor_key)} bytes")

# Decrypt drone file with this key
def xor_decrypt(data, key):
    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

decrypted_drone = xor_decrypt(drone_bytes, xor_key)
print(f"\n✓ Decrypted Drone (first 50 bytes): {decrypted_drone[:50]}")

# Check for zlib compression
print(f"\nAttempting zlib decompression...")
try:
    decompressed = zlib.decompress(decrypted_drone)
    print(f"✓ Decompressed: {decompressed}")
except Exception as e:
    print(f"✗ Decompression failed: {e}")
    print(f"  Raw decrypted data: {decrypted_drone}")

print("\n" + "="*80)
print("[STEP 2] Challenge 6 Payload")
print("-" * 80)

# Challenge 6: Payload
payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)

print(f"Full Payload Hex: {payload_bytes.hex()}")
print(f"Full Payload Size: {len(payload_bytes)} bytes")

# Extract header and data
payload_header = payload_bytes[:4]
payload_data = payload_bytes[4:]

print(f"\nHeader: {payload_header} = {repr(payload_header)}")
print(f"Data size: {len(payload_data)} bytes")
print(f"Data hex: {payload_data.hex()}")

print("\n[STEP 3] Try Decryption with Challenge 1 XOR Key")
print("-" * 80)

# Try decrypting with Challenge 1 key
decrypted_payload = xor_decrypt(payload_data, xor_key)
print(f"Decrypted: {decrypted_payload}")
print(f"Hex: {decrypted_payload.hex()}")

# Try decompressing
print(f"\nAttempting zlib decompression...")
try:
    decompressed_payload = zlib.decompress(decrypted_payload)
    print(f"✓ Decompressed: {decompressed_payload}")
    if b"FLAG" in decompressed_payload:
        print(f"\n✓✓✓ FLAG FOUND IN DECOMPRESSED DATA:")
        print(f"    {decompressed_payload}")
except Exception as e:
    print(f"✗ Decompression failed: {e}")

# Search for FLAG in raw decrypted data
print(f"\nSearching for FLAG pattern in raw decrypted data...")
if b"FLAG" in decrypted_payload:
    print(f"✓✓✓ FLAG FOUND IN RAW DECRYPTED DATA:")
    flag_start = decrypted_payload.find(b"FLAG")
    flag_end = decrypted_payload.find(b"}", flag_start) + 1
    print(f"    {decrypted_payload[flag_start:flag_end]}")
else:
    print(f"✗ No FLAG found")
    print(f"\nTrying to find ASCII sequences...")
    ascii_sequences = []
    current = []
    for byte in decrypted_payload:
        if 32 <= byte <= 126:
            current.append(chr(byte))
        else:
            if current and len(current) > 3:
                ascii_sequences.append(''.join(current))
            current = []
    if current and len(current) > 3:
        ascii_sequences.append(''.join(current))
    
    for seq in ascii_sequences:
        print(f"  Found: {seq}")

print("\n" + "="*80)
print("[STEP 4] Brute Force All Keys (if needed)")
print("-" * 80)

found = False
for key_byte in range(256):
    dec = xor_decrypt(payload_data, bytes([key_byte]))
    if b"FLAG" in dec:
        print(f"✓ Key 0x{key_byte:02x}: {dec}")
        found = True
        break

if not found:
    print("✗ No FLAG found with any single-byte key")
    print("\nTrying 2-byte key combinations...")
    for b1 in range(256):
        for b2 in range(256):
            dec = xor_decrypt(payload_data, bytes([b1, b2]))
            if b"FLAG" in dec:
                print(f"✓ Key {b1:02x}{b2:02x}: {dec}")
                found = True
                break
        if found:
            break

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
