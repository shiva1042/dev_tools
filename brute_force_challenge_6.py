#!/usr/bin/env python3
"""
Challenge 6: Brute Force All Possible XOR Keys
Since payload uses different key, we'll try all possible key lengths and values
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
print("CHALLENGE 6: BRUTE FORCE ALL POSSIBLE XOR KEYS")
print("="*80)

# Extract key from Challenge 1
print("\n[STEP 1] Extract Challenge 1 XOR Key")
print("-" * 80)

xor_key_c1 = bytearray()
for i in range(len(c1_plaintext)):
    key_byte = drone_bytes[i] ^ c1_plaintext[i]
    xor_key_c1.append(key_byte)
xor_key_c1 = bytes(xor_key_c1)
print(f"Challenge 1 Key: {xor_key_c1.hex()}")

# Parse payload
payload_header = payload_bytes[:4]
payload_data = payload_bytes[4:]

print(f"\n[STEP 2] Brute Force Challenge 6 Payload")
print("-" * 80)
print(f"Payload Header: {payload_header}")
print(f"Payload Size: {len(payload_data)} bytes")

# Strategy 1: Try all single-byte keys
print("\n>>> Strategy 1: Single-byte keys (0-255)")
found = False
for key_val in range(256):
    key_single = bytes([key_val])
    dec = xor_decrypt(payload_data, key_single)
    
    if b"FLAG" in dec:
        found = True
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        print(f"\n✓✓✓ FOUND with single-byte key 0x{key_val:02x}:")
        print(f"    {flag.decode()}")
        print(f"\nDecrypted payload: {dec}")
        break

if not found:
    print("✗ No single-byte keys found FLAG")

# Strategy 2: Try different key lengths with brute force
print("\n>>> Strategy 2: Multi-byte keys with length 2-5")
found = False

for key_length in range(2, 6):
    print(f"\nTrying key length {key_length}...")
    
    # Generate all possible keys of this length
    for key_combo in range(256 ** key_length):
        key_bytes = bytearray()
        temp = key_combo
        for _ in range(key_length):
            key_bytes.append(temp % 256)
            temp //= 256
        
        key = bytes(key_bytes)
        dec = xor_decrypt(payload_data, key)
        
        if b"FLAG" in dec:
            found = True
            flag_start = dec.find(b"FLAG")
            flag_end = dec.find(b"}", flag_start) + 1
            flag = dec[flag_start:flag_end]
            print(f"\n✓✓✓ FOUND with key {key.hex()} (length {key_length}):")
            print(f"    {flag.decode()}")
            print(f"\nDecrypted payload: {dec}")
            break
    
    if found:
        break

if not found:
    print("\n✗ No multi-byte keys found FLAG")

# Strategy 3: Try all permutations of Challenge 1 key
print("\n>>> Strategy 3: Variations of Challenge 1 key")
found = False

# Try the full Challenge 1 key
dec = xor_decrypt(payload_data, xor_key_c1)
if b"FLAG" in dec:
    flag_start = dec.find(b"FLAG")
    flag_end = dec.find(b"}", flag_start) + 1
    flag = dec[flag_start:flag_end]
    print(f"\n✓✓✓ FOUND with full Challenge 1 key:")
    print(f"    {flag.decode()}")
    found = True

# Try reversed key
if not found:
    reversed_key = xor_key_c1[::-1]
    dec = xor_decrypt(payload_data, reversed_key)
    if b"FLAG" in dec:
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        print(f"\n✓✓✓ FOUND with reversed Challenge 1 key:")
        print(f"    {flag.decode()}")
        found = True

# Try first N bytes of Challenge 1 key
if not found:
    for n in range(1, len(xor_key_c1)):
        partial_key = xor_key_c1[:n]
        dec = xor_decrypt(payload_data, partial_key)
        if b"FLAG" in dec:
            flag_start = dec.find(b"FLAG")
            flag_end = dec.find(b"}", flag_start) + 1
            flag = dec[flag_start:flag_end]
            print(f"\n✓✓✓ FOUND with first {n} bytes of Challenge 1 key:")
            print(f"    {flag.decode()}")
            found = True
            break

if not found:
    print("✗ No Challenge 1 key variations found FLAG")

# Strategy 4: Try common patterns
print("\n>>> Strategy 4: Common key patterns")
found = False

common_keys = [
    b"KEY",
    b"FLAG",
    b"PAYLOAD",
    b"BIGCORP",
    b"DRONE",
    b"\x00",
    b"\xff",
    b"\x01",
]

for key in common_keys:
    dec = xor_decrypt(payload_data, key)
    if b"FLAG" in dec:
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        print(f"\n✓✓✓ FOUND with key '{key.decode(errors='ignore')}':")
        print(f"    {flag.decode()}")
        found = True
        break

if not found:
    print("✗ No common key patterns found FLAG")

# Strategy 5: Dictionary attack with Challenge 1 flag components
print("\n>>> Strategy 5: Challenge 1 flag components as keys")
found = False

components = [
    b"FL16H7",
    b"L06",
    b"D3CRYPT3D",
    b"FL",
    b"16",
    b"H7",
]

for component in components:
    dec = xor_decrypt(payload_data, component)
    if b"FLAG" in dec:
        flag_start = dec.find(b"FLAG")
        flag_end = dec.find(b"}", flag_start) + 1
        flag = dec[flag_start:flag_end]
        print(f"\n✓✓✓ FOUND with key '{component.decode()}':")
        print(f"    {flag.decode()}")
        found = True
        break

if not found:
    print("✗ Challenge 1 components didn't work")

print("\n" + "="*80)
print("BRUTE FORCE COMPLETE")
print("="*80)
