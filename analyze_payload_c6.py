#!/usr/bin/env python3
"""
Challenge 6: Analyze payload structure
The payload contains UTF-8 encoded Chinese characters
"""

import base64

payload_b64 = "UEFZTOaLkeazv+eDn+adluefjeiYqeWJluivvOmik+iwruW6uOaZpuS6jueQouW/p+WGheWPi+iKqeaglueQouW0lumUqOiQg86y5bm844CXzp3ugbPjgqPnkKLoioTniorvvJvliLDvvJHluYzmi67jgI/ikoo="
payload_bytes = base64.b64decode(payload_b64)

print("="*80)
print("CHALLENGE 6: PAYLOAD ANALYSIS")
print("="*80)

# Full payload with header
print(f"\nFull Payload (with PAYL header):")
print(f"Hex: {payload_bytes.hex()}")
print(f"Bytes: {payload_bytes}")
print(f"Repr: {repr(payload_bytes)}")

# Try to decode as UTF-8
print(f"\n[Attempting UTF-8 decode]")
try:
    decoded_utf8 = payload_bytes.decode('utf-8')
    print(f"✓ Successfully decoded as UTF-8!")
    print(f"Content: {decoded_utf8}")
except Exception as e:
    print(f"✗ Failed to decode as UTF-8: {e}")

# Extract just the payload (skip PAYL header)
payload_data = payload_bytes[4:]

print(f"\n[Payload Data Only (no PAYL header)]")
print(f"Hex: {payload_data.hex()}")
print(f"Bytes: {payload_data}")

# Try to decode payload data as UTF-8
print(f"\n[UTF-8 decode of payload data]")
try:
    decoded_payload = payload_data.decode('utf-8')
    print(f"✓ Decoded: {decoded_payload}")
except Exception as e:
    print(f"✗ Error: {e}")

# Check if it's compressed
import zlib
print(f"\n[Checking for compression]")
try:
    decompressed = zlib.decompress(payload_data)
    print(f"✓ Decompressed (zlib):")
    print(f"  {decompressed}")
    print(f"  Decoded: {decompressed.decode('utf-8', errors='ignore')}")
except Exception as e:
    print(f"✗ Not zlib compressed: {e}")

# Try Base64 decode
print(f"\n[Attempting Base64 decode]")
try:
    decoded_b64 = base64.b64decode(payload_data)
    print(f"✓ Base64 decoded:")
    print(f"  {decoded_b64}")
    print(f"  Decoded UTF-8: {decoded_b64.decode('utf-8', errors='ignore')}")
except Exception as e:
    print(f"✗ Not valid Base64: {e}")

# Analyze byte patterns
print(f"\n[Byte Pattern Analysis]")
print(f"First 10 bytes: {payload_data[:10].hex()}")
print(f"Last 10 bytes: {payload_data[-10:].hex()}")

# Look for ASCII/FLAG patterns
print(f"\n[Search for ASCII patterns in payload]")
ascii_parts = []
for byte in payload_data:
    if 32 <= byte <= 126:
        ascii_parts.append(chr(byte))
    elif byte == 0:
        if ascii_parts:
            word = ''.join(ascii_parts)
            if len(word) > 2:
                print(f"  Found ASCII: {word}")
            ascii_parts = []

# The payload IS UTF-8 Chinese text - try to extract meaning
print(f"\n[Full Payload as UTF-8]")
try:
    full_text = payload_bytes[4:].decode('utf-8')
    print(f"Content: {full_text}")
    print(f"Length: {len(full_text)} characters")
    
    # Check if it contains FLAG
    if "FLAG" in full_text:
        print(f"✓ Contains FLAG!")
    
    # Look for curly braces indicating structure
    if "{" in full_text:
        print(f"✓ Contains curly braces - possible structured data")
        brace_start = full_text.find("{")
        brace_end = full_text.find("}", brace_start)
        if brace_end != -1:
            print(f"  Content in braces: {full_text[brace_start:brace_end+1]}")
            
except Exception as e:
    print(f"Error: {e}")
