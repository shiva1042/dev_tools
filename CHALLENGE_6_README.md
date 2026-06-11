# Challenge 6: Payload Extraction & Decryption

## Executive Summary

Challenge 6 focuses on **extracting and decrypting a sensitive intercepted payload** using cryptographic keys and algorithms discovered in previous challenges. This challenge builds upon the findings from Challenge 1 (Grounded - Recover File) and requires applying reverse-engineering techniques to breach encrypted communications.

---

## Challenge Overview

### Scenario
A critical data payload was intercepted during network reconnaissance. The payload is heavily encrypted using an unknown encryption method, but clues about the encryption algorithm and keys were discovered in previous challenges (specifically **Challenge 1**).

### Objective
Derive the correct decryption key and apply the appropriate decryption method to reveal the sensitive information hidden within the encrypted payload.

---

## Mission Tasks

### Task (a): Review Previous Challenge Findings
**Objective:** Identify the encryption algorithm and key from Challenge 1

**Steps:**
1. Reference Challenge 1 findings:
   - Analyze `dronecorp_flight_001.DAT` encryption parameters
   - Extract the self-referential encryption metadata from the file header
   - Document the encryption algorithm used (XOR, AES, or other)
   - Recover the encryption key/seed value

2. Document findings:
   - **Algorithm Type:** [To be determined from Challenge 1]
   - **Key/Seed:** [To be extracted from Challenge 1 decryption]
   - **Key Length:** [Document bit/byte length]
   - **Encryption Mode:** [ECB, CBC, CTR, etc., if applicable]

**Expected Outcome:**
- Confirmed encryption algorithm
- Extracted encryption key in hexadecimal or base64 format
- Understanding of key derivation method (if applicable)

---

### Task (b): Apply Decryption to Intercepted Payload
**Objective:** Decrypt `intercepted_payload.dat` using the identified key and algorithm

**Available Artifact:**
```
File: intercepted_payload.dat
Current State: Encrypted (contains garbled Unicode characters)
Header: "PAYL拑泿烟杖矍蘩剖诼颓谮庸晦于琢忧内友芩栖琢崖锨萃β幼〗Νィ琢芄犊；到１幌拮』⒊"
```

**Decryption Steps:**
1. **Parse payload header** to identify:
   - Format identifier (`PAYL`)
   - Encrypted data segment
   - Any length or padding indicators

2. **Apply decryption algorithm:**
   - If XOR-based: Apply XOR operation with recovered key across entire payload
   - If AES-based: Use appropriate decryption mode (CBC, ECB, CTR) with recovered key
   - If other: Apply corresponding decryption method

3. **Handle decompression (if applicable):**
   - Check if decrypted data is compressed (gzip, zlib, etc.)
   - Decompress using appropriate algorithm
   - Verify output validity

4. **Validate decryption:**
   - Check for recognizable patterns (ASCII text, structured data, headers)
   - Verify magic bytes or known file signatures
   - Ensure data integrity

**Expected Output:**
- Plaintext decrypted payload
- Confirmation of successful decryption
- Structured data or readable information

---

### Task (c): Extract Sensitive Information
**Objective:** Parse decrypted data and locate embedded flag

**Extraction Steps:**
1. **Analyze decrypted payload structure:**
   - Identify data format (JSON, binary, plaintext, structured)
   - Parse metadata or headers
   - Locate data sections and fields

2. **Search for flag indicators:**
   - Look for strings matching pattern: `FLAG{...}`
   - Scan for suspicious encoded sections
   - Check for secondary encryption or encoding (Base64, ROT13, etc.)

3. **Extract sensitive information:**
   - Locate all embedded flags
   - Document any sensitive data (credentials, locations, IDs, etc.)
   - Verify flag format and completeness

4. **Secondary processing (if needed):**
   - If flag is further encoded, apply appropriate decoding
   - Validate flag syntax and structure
   - Document any additional sensitive findings

---

## Available Artifacts

| Artifact | Description | Status |
|----------|-------------|--------|
| `intercepted_payload.dat` | Encrypted payload intercepted during comms | Encrypted |
| Challenge 1 Findings | Encryption algorithm & key from `dronecorp_flight_001.DAT` | Required |
| Key Material | Decryption key/seed from Challenge 1 | Required |

---

## Technical Specifications

### Payload Structure
```
[Header: PAYL]
[Encrypted Data Segment]
[Possible Compression]
[Embedded Flag]
```

### Expected Decryption Algorithm
- **Primary Candidate:** XOR encryption with key derived from Challenge 1
- **Secondary Candidate:** AES encryption (likely ECB mode)
- **Validation:** Decrypted output should contain readable ASCII/Unicode text

### Flag Format
```
FLAG{...}
```
or
```
FLAG{sensitive_information}
```

---

## Solution Approach

### Phase 1: Key Recovery
1. Execute Challenge 1 solution to extract encryption key
2. Document key in hexadecimal format
3. Verify key length and format consistency

### Phase 2: Payload Decryption
```pseudocode
function DecryptPayload(payload, key, algorithm):
    header = payload[0:4]      // "PAYL"
    ciphertext = payload[4:]   // Encrypted data
    
    if algorithm == "XOR":
        plaintext = XOR_Decrypt(ciphertext, key)
    elif algorithm == "AES":
        plaintext = AES_Decrypt(ciphertext, key, mode)
    
    // Check for compression
    if is_compressed(plaintext):
        plaintext = decompress(plaintext)
    
    return plaintext
```

### Phase 3: Flag Extraction
1. Parse decrypted plaintext
2. Search for flag pattern
3. Extract and validate flag

---

## Success Criteria

✅ **Task (a) Complete:**
- Encryption algorithm identified from Challenge 1
- Decryption key successfully extracted
- Algorithm parameters documented

✅ **Task (b) Complete:**
- Payload successfully decrypted
- Plaintext output verified and readable
- All decryption steps documented

✅ **Task (c) Complete:**
- Flag located within decrypted payload
- Flag extracted in correct format
- All sensitive information identified

---

## Flag Submission

### Flag 1: Decrypted Sensitive Data
```
FLAG{decrypted_data}
```

**Format:** Submit the complete flag string including the `FLAG{}` wrapper with the decrypted sensitive information inside.

---

## Notes & Hints

- **Hint 1:** The encryption method used in Challenge 6 matches the algorithm discovered in Challenge 1
- **Hint 2:** Key derivation may involve data from the drone flight file header (self-referential encryption)
- **Hint 3:** After decryption, look for embedded metadata or structured data containing the flag
- **Hint 4:** The intercepted payload header begins with "PAYL" - use this as a validation anchor during decryption
- **Hint 5:** If initial decryption attempts fail, verify key byte order (endianness) and try alternative XOR key derivations

---

## Related Challenges

- **Challenge 1:** Grounded - Recover File (prerequisite - provides encryption key/algorithm)
- **Challenges 2-5:** May provide additional context or supporting decryption techniques
- **Challenge 7+:** May build upon this payload extraction for further analysis

---

## Resources & Tools

### Recommended Tools
- **Python:** `pycryptodome`, `zlib`, `base64` modules
- **Decryption Libraries:** OpenSSL, GPG, libsodium
- **Hex Viewers:** hexdump, xxd, HxD
- **Analysis:** Wireshark, Burp Suite, custom Python scripts

### Python Template
```python
import zlib
from Crypto.Cipher import AES

def decrypt_payload(payload_file, key, algorithm='XOR'):
    with open(payload_file, 'rb') as f:
        data = f.read()
    
    # Validate header
    header = data[:4]
    assert header == b'PAYL', "Invalid header"
    
    ciphertext = data[4:]
    
    if algorithm == 'XOR':
        key_bytes = bytes.fromhex(key)
        plaintext = bytes([c ^ key_bytes[i % len(key_bytes)] for i, c in enumerate(ciphertext)])
    
    # Try decompression
    try:
        plaintext = zlib.decompress(plaintext)
    except:
        pass
    
    return plaintext

# Extract flag
plaintext = decrypt_payload('intercepted_payload.dat', 'YOUR_KEY_HERE')
print(plaintext.decode('utf-8', errors='ignore'))
```

---

## Document Version
- **Version:** 1.0
- **Last Updated:** Challenge 6 Analysis
- **Status:** Ready for Exploitation
- **Difficulty Level:** Intermediate (requires Challenge 1 solution)

---

**Challenge 6 Complete: Payload Extraction & Decryption**
