#!/usr/bin/env python3
"""
Decrypt intercepted_payload.dat using XOR key from Challenge 1
"""

def xor_decrypt(data, key_bytes):
    """Decrypt data using XOR with repeating key"""
    return bytes(data[i] ^ key_bytes[i % len(key_bytes)] for i in range(len(data)))

def main():
    # Key from Challenge 1
    key = b"FL16H7_L06_D3CRYPT3D"
    
    # Read the encrypted payload
    with open("intercepted_payload.dat", "rb") as f:
        encrypted_data = f.read()
    
    print(f"[*] Encrypted data length: {len(encrypted_data)} bytes")
    print(f"[*] First 20 bytes (hex): {encrypted_data[:20].hex()}")
    
    # Check and skip PAYL header if present
    if encrypted_data.startswith(b"PAYL"):
        print("[+] Found PAYL header, skipping...")
        encrypted_data = encrypted_data[4:]
    
    # Decrypt using XOR
    decrypted = xor_decrypt(encrypted_data, key)
    
    print(f"\n[+] Decryption complete!")
    print(f"[+] Decrypted data length: {len(decrypted)} bytes")
    print(f"\n[+] Decrypted content:")
    print("=" * 80)
    try:
        print(decrypted.decode('utf-8', errors='replace'))
    except:
        print(decrypted)
    print("=" * 80)
    
    # Save decrypted output
    with open("decrypted_payload.txt", "wb") as f:
        f.write(decrypted)
    print("\n[+] Decrypted content saved to: decrypted_payload.txt")

if __name__ == "__main__":
    main()
