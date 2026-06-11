#!/usr/bin/env python3
"""
Challenge 6: Find the correct XOR key
Testing all possibilities systematically
"""

import base64

payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)
payload_data = payload_bytes[4:]  # Remove "PAYL" header

print("="*80)
print("CHALLENGE 6: FINDING CORRECT XOR KEY")
print("="*80)
print(f"\nPayload Size: {len(payload_data)} bytes")
print(f"Payload (hex): {payload_data.hex()}")

# Test all single-byte keys
print("\n[Testing all single-byte keys 0x00-0xFF]")
print("-" * 80)

found_flags = []

for key_byte in range(256):
    xor_key = bytes([key_byte])
    
    # Decrypt
    decrypted = bytes([payload_data[i] ^ key_byte for i in range(len(payload_data))])
    
    # Check for FLAG
    if b"FLAG{" in decrypted or b"FLAG" in decrypted:
        flag_start = decrypted.find(b"FLAG")
        flag_end = decrypted.find(b"}", flag_start) + 1 if b"}" in decrypted[flag_start:] else len(decrypted)
        flag_found = decrypted[flag_start:flag_end]
        
        print(f"\n✓ Key 0x{key_byte:02x}: {flag_found}")
        print(f"  Full decrypted: {decrypted}")
        found_flags.append((key_byte, decrypted))

if found_flags:
    print(f"\n{'='*80}")
    print(f"FOUND {len(found_flags)} POSSIBLE FLAG(S)")
    print(f"{'='*80}")
    for key_byte, dec in found_flags:
        print(f"\nKey 0x{key_byte:02x}:")
        print(f"  {dec}")
else:
    print(f"\n✗ No FLAG pattern found with any single-byte key")
    print(f"\nTrying 2-byte keys...")
    
    # Try 2-byte keys
    for b1 in range(256):
        for b2 in range(256):
            xor_key = bytes([b1, b2])
            decrypted = bytes([payload_data[i] ^ xor_key[i % 2] for i in range(len(payload_data))])
            
            if b"FLAG{" in decrypted or b"FLAG" in decrypted:
                print(f"\n✓ Key {xor_key.hex()}: {decrypted}")
                found_flags.append((xor_key, decrypted))
                if len(found_flags) >= 5:
                    break
        if len(found_flags) >= 5:
            break

print(f"\n{'='*80}")
print(f"All decrypted data samples:")
print(f"{'='*80}")

for i in range(min(10, 256)):
    xor_key = bytes([i])
    decrypted = bytes([payload_data[i] ^ i for i in range(len(payload_data))])
    print(f"\nKey 0x{i:02x}: {decrypted[:50]}")
