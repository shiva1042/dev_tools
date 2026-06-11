#!/usr/bin/env python3
"""
Challenge 6: Different Approach
Maybe the payload IS UTF-8 text, not encrypted
Or the key is derived differently from Challenge 1
"""

import base64

# Challenge 1 flag found
c1_flag = "FL16H7_L06_D3CRYPT3D"

# Challenge 6 payload
payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)

print("="*80)
print("CHALLENGE 6: ALTERNATIVE APPROACH")
print("="*80)

# Remove PAYL header
payload_data = payload_bytes[4:]

print(f"\nPayload Hex: {payload_data.hex()}")
print(f"Payload Size: {len(payload_data)} bytes")

# APPROACH 1: Try to decode as UTF-8 directly
print("\n[APPROACH 1] Decode payload as UTF-8")
print("-" * 80)
try:
    decoded = payload_data.decode('utf-8')
    print(f"✓ Successfully decoded as UTF-8:")
    print(f"  {decoded}")
    print(f"  Repr: {repr(decoded)}")
except Exception as e:
    print(f"✗ Failed: {e}")

# APPROACH 2: The Challenge 1 flag parts as keys
print("\n[APPROACH 2] Try Challenge 1 flag components as XOR keys")
print("-" * 80)

# Extract parts from C1 flag
parts = [
    ("Full flag", c1_flag.encode()),
    ("FL16H7", b"FL16H7"),
    ("L06", b"L06"),
    ("D3CRYPT3D", b"D3CRYPT3D"),
    ("First 5 chars", c1_flag[:5].encode()),
    ("Last 9 chars", c1_flag[-9:].encode()),
]

def xor_decrypt(data, key):
    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

for name, key in parts:
    dec = xor_decrypt(payload_data, key)
    print(f"\nKey '{name}' ({key.hex()}):")
    
    # Try UTF-8
    try:
        utf8_decode = dec.decode('utf-8', errors='ignore')
        print(f"  UTF-8: {utf8_decode}")
    except:
        pass
    
    # Check for FLAG
    if b"FLAG" in dec:
        print(f"  ✓ Contains FLAG: {dec}")
    
    # Show first 50 bytes
    print(f"  Hex (first 50): {dec[:50].hex()}")

# APPROACH 3: Extract numbers from Challenge 1 flag as key
print("\n[APPROACH 3] Numbers from Challenge 1 flag as key")
print("-" * 80)

# Extract: 1, 6, 1, 6, 0, 6, 3, 3
numbers = "".join(c for c in c1_flag if c.isdigit())
print(f"Numbers found in C1 flag: {numbers}")

# Try as bytes
key_from_numbers = numbers.encode()
dec = xor_decrypt(payload_data, key_from_numbers)
print(f"Key: {key_from_numbers}")
print(f"Decrypted: {dec}")

# Check for FLAG
if b"FLAG" in dec:
    print(f"✓ FLAG FOUND: {dec}")

# APPROACH 4: Look at payload structure more carefully
print("\n[APPROACH 4] Payload structure analysis")
print("-" * 80)

# The hex starts with e68b91...
# e6 8b 91 - these are UTF-8 multibyte sequences
print(f"Payload starts with: {payload_data[:10].hex()}")
print(f"As bytes: {payload_data[:10]}")

# Try to interpret as UTF-8 Chinese
try:
    utf8_text = payload_data.decode('utf-8')
    print(f"✓ UTF-8 decoded: {utf8_text}")
    print(f"  Length: {len(utf8_text)} characters")
    
    # Look for patterns
    print(f"\n  Character breakdown:")
    for i, char in enumerate(utf8_text):
        print(f"    [{i}] {char} (U+{ord(char):04X})")
        if i > 20:
            print(f"    ... ({len(utf8_text) - 21} more characters)")
            break
            
except Exception as e:
    print(f"✗ UTF-8 decode failed: {e}")

# APPROACH 5: Maybe the KEY is hidden in Challenge 1 decrypt residue
print("\n[APPROACH 5] Use residual data from Challenge 1")
print("-" * 80)

# We know Challenge 1 drone file decrypts with key: 7c87ad078a849dfc161469641181e07c7476f1fe
# Let's try using parts of that
c1_key = bytes.fromhex("7c87ad078a849dfc161469641181e07c7476f1fe")

# But the payload might use a SHORTER key
for key_len in [1, 2, 4, 8, 10, 16]:
    partial_key = c1_key[:key_len]
    dec = xor_decrypt(payload_data, partial_key)
    
    print(f"\nKey (first {key_len} bytes): {partial_key.hex()}")
    
    # Check for FLAG
    if b"FLAG" in dec:
        print(f"  ✓ FLAG FOUND: {dec}")
    
    # Try UTF-8
    try:
        utf8 = dec.decode('utf-8', errors='ignore')
        if "FLAG" in utf8:
            print(f"  ✓ UTF-8 with FLAG: {utf8}")
    except:
        pass

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
