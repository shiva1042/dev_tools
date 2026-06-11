#!/usr/bin/env python3
"""
Advanced Crypto CSV Analyzer
Usage:
    python3 advanced_crypto_csv_analyzer.py samples.csv

Performs:
- Encoding detection (Hex/Base64)
- Length analysis
- Entropy analysis
- ECB pattern detection
- XOR relationship analysis
- Hash fingerprinting
- Block-size detection
- Frequency analysis
- Repeated ciphertext detection
- Report generation
"""

import csv
import sys
import base64
import math
from collections import Counter

def is_hex(s):
    try:
        bytes.fromhex(s)
        return True
    except:
        return False

def is_b64(s):
    try:
        base64.b64decode(s, validate=True)
        return True
    except:
        return False

def entropy(data):
    if not data:
        return 0
    freq = Counter(data)
    total = len(data)
    return -sum((c/total)*math.log2(c/total) for c in freq.values())

if len(sys.argv) != 2:
    print("Usage: python3 advanced_crypto_csv_analyzer.py file.csv")
    sys.exit(1)

csvfile = sys.argv[1]

rows = []

with open(csvfile, newline='') as fh:
    reader = csv.reader(fh)
    header = next(reader, None)

    for row in reader:
        if len(row) >= 2:
            rows.append(row)

print("="*70)
print("ADVANCED CRYPTO CSV ANALYZER")
print("="*70)

print("Rows:", len(rows))

hex_ct = 0
b64_ct = 0

lengths = []

for row in rows:
    ct = row[1].strip()

    if is_hex(ct):
        hex_ct += 1

    if is_b64(ct):
        b64_ct += 1

    lengths.append(len(ct))

print("\nEncoding Analysis")
print("------------------")
print("Hex ciphertexts:", hex_ct)
print("Base64 ciphertexts:", b64_ct)

print("\nLength Analysis")
print("------------------")
print("Unique lengths:", sorted(set(lengths)))

print("\nEntropy Analysis")
print("------------------")

ents = []

for row in rows:
    ct = row[1].strip()

    if is_hex(ct):
        ents.append(entropy(bytes.fromhex(ct)))

if ents:
    avg = sum(ents)/len(ents)
    print("Average entropy:", round(avg,2))

print("\nAES Indicators")
print("------------------")

for row in rows[:20]:
    ct = row[1].strip()

    if is_hex(ct):
        raw = bytes.fromhex(ct)

        if len(raw) % 16 == 0:
            print("AES candidate length:", len(raw))

print("\nECB Detection")
print("------------------")

hits = 0

for row in rows:
    ct = row[1].strip()

    if not is_hex(ct):
        continue

    raw = bytes.fromhex(ct)

    blocks = [
        raw[i:i+16]
        for i in range(0,len(raw),16)
    ]

    if len(blocks) != len(set(blocks)):
        hits += 1

print("Repeated block rows:", hits)

print("\nHash Fingerprinting")
print("------------------")

for row in rows[:10]:
    ct = row[1].strip()

    if len(ct) == 32:
        print("MD5 candidate:", ct[:16], "...")

    elif len(ct) == 40:
        print("SHA1 candidate:", ct[:16], "...")

    elif len(ct) == 64:
        print("SHA256 candidate:", ct[:16], "...")

    elif len(ct) == 128:
        print("SHA512 candidate:", ct[:16], "...")

print("\nXOR Relationship Samples")
print("------------------")

for row in rows[:5]:
    pt = row[0].strip()
    ct = row[1].strip()

    if is_hex(pt) and is_hex(ct):

        p = bytes.fromhex(pt)
        c = bytes.fromhex(ct)

        if len(p) == len(c):
            x = bytes(a ^ b for a,b in zip(p,c))
            print(x.hex())

print("\nRepeated Ciphertexts")
print("------------------")

cts = [r[1] for r in rows]
freq = Counter(cts)

for k,v in freq.items():
    if v > 1:
        print("Repeated", v, "times")

print("\nAnalysis Complete")
