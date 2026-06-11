#!/usr/bin/env python3
"""
Challenge 6: Using Challenge 1 FLAG directly
Challenge 1 Flag: FL16H7_L06_D3CRYPT3D
This IS the key or contains the key information
"""

import base64

# Challenge 1 FLAG (this is important!)
c1_flag = b"FL16H7_L06_D3CRYPT3D"

# Challenge 6 payload
payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)
payload_data = payload_bytes[4:]  # Remove PAYL header

print("="*80)
print("CHALLENGE 6: Using Challenge 1 FLAG as XOR KEY")
print("="*80)

print(f"\nChallenge 1 FLAG: {c1_flag.decode()}")
print(f"Payload size: {len(payload_data)} bytes")
print(f"C1 Flag size: {len(c1_flag)} bytes")

# XOR with repeating key
def xor_decrypt(data, key):
    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

print(f"\n[Decrypting with C1 FLAG as XOR key]")
print("-" * 80)

decrypted = xor_decrypt(payload_data, c1_flag)
print(f"Decrypted (hex): {decrypted.hex()}")
print(f"Decrypted (bytes): {decrypted}")

# Try to decode as UTF-8
print(f"\n[Attempting UTF-8 decode]")
try:
    decoded_utf8 = decrypted.decode('utf-8')
    print(f"✓ Successfully decoded as UTF-8!")
    print(f"\nContent: {decoded_utf8}")
    
    # Check for FLAG
    if "FLAG" in decoded_utf8:
        print(f"\n✓✓✓ FLAG FOUND:")
        # Extract flag
        flag_start = decoded_utf8.find("FLAG")
        flag_end = decoded_utf8.find("}", flag_start) + 1
        if flag_end > flag_start:
            flag = decoded_utf8[flag_start:flag_end]
            print(f"\n    {flag}\n")
except Exception as e:
    print(f"✗ UTF-8 decode failed: {e}")

# Also try as ASCII/Latin1
print(f"\n[Attempting ASCII/Latin1 decode]")
try:
    decoded_ascii = decrypted.decode('ascii', errors='replace')
    print(f"ASCII: {decoded_ascii}")
except:
    pass

# Character by character
print(f"\n[First 50 characters analysis]")
for i in range(min(50, len(decrypted))):
    byte = decrypted[i]
    if 32 <= byte <= 126:
        print(f"[{i:2d}] 0x{byte:02x} = '{chr(byte)}'")
    else:
        print(f"[{i:2d}] 0x{byte:02x} = (non-ASCII)")

# Try searching for FLAG pattern in different ways
print(f"\n[Searching for FLAG patterns]")
if b"FLAG" in decrypted:
    print(f"✓ Found b'FLAG'")
    flag_start = decrypted.find(b"FLAG")
    flag_end = decrypted.find(b"}", flag_start) + 1
    if flag_end > flag_start:
        print(f"  Flag bytes: {decrypted[flag_start:flag_end]}")

if b"flag" in decrypted:
    print(f"✓ Found b'flag'")

# Try different character encodings
print(f"\n[Trying different encodings]")
encodings = ['utf-8', 'utf-16', 'utf-32', 'latin1', 'cp1252', 'ascii']
for encoding in encodings:
    try:
        decoded = decrypted.decode(encoding)
        if "FLAG" in decoded or "flag" in decoded.lower():
            print(f"✓ {encoding}: {decoded[:100]}")
    except:
        pass

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
