#!/usr/bin/env python3
"""
Challenge 6: Direct Solution
Key found: 0xa0 (single-byte XOR key)
"""

import base64

payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)
payload_data = payload_bytes[4:]  # Remove "PAYL" header

# XOR Key found
xor_key = bytes([0xa0])

# Decrypt
decrypted = bytes([payload_data[i] ^ xor_key[i % len(xor_key)] for i in range(len(payload_data))])

print("="*80)
print("CHALLENGE 6: SOLUTION")
print("="*80)
print(f"\nXOR Key: 0xa0 (single byte)")
print(f"Key (hex): {xor_key.hex()}")
print(f"\nDecrypted Payload:")
print(decrypted)

if b"FLAG{" in decrypted:
    flag_start = decrypted.find(b"FLAG{")
    flag_end = decrypted.find(b"}", flag_start) + 1
    flag = decrypted[flag_start:flag_end]
    print(f"\n✓✓✓ CHALLENGE 6 FLAG:")
    print(f"\n    {flag.decode()}\n")
else:
    print(f"\nSearching for FLAG pattern...")
    print(f"Decrypted (repr): {repr(decrypted)}")
