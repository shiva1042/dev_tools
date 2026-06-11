import pandas as pd
import numpy as np
import binascii
import sys

# AES S-box for Hypothesized State Output
SBOX = np.array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
], dtype=np.uint8)

# Precomputed Hamming Weight Table for 0-255
HW_TABLE = np.array([bin(i).count("1") for i in range(256)], dtype=np.uint8)

def hex_to_bytes(hex_str):
    hex_str = ''.join(c for c in str(hex_str) if c.isalnum())
    if len(hex_str) != 32:
        raise ValueError("Hex string must represent exactly 16 bytes (32 chars).")
    return np.frombuffer(binascii.unhexlify(hex_str), dtype=np.uint8)

def parse_samples(samples_entry):
    if pd.isna(samples_entry):
        raise ValueError("Empty sample field.")
    if ';' in str(samples_entry):
        tokens = str(samples_entry).split(';')
    elif ' ' in str(samples_entry):
        tokens = str(samples_entry).split()
    else:
        tokens = str(samples_entry).split(',')
    return np.array([float(t) for t in tokens], dtype=np.float32)

def calculate_max_correlation(hyp_power, traces):
    hyp_mean_diff = hyp_power - np.mean(hyp_power, axis=0)
    traces_mean_diff = traces - np.mean(traces, axis=0)
    numerator = np.dot(hyp_mean_diff.T, traces_mean_diff)
    denom_hyp = np.sqrt(np.sum(hyp_mean_diff**2, axis=0))[:, np.newaxis]
    denom_traces = np.sqrt(np.sum(traces_mean_diff**2, axis=0))[np.newaxis, :]
    denominator = np.dot(denom_hyp, denom_traces)
    with np.errstate(divide='ignore', invalid='ignore'):
        corr = np.nan_to_num(numerator / denominator)
    return np.max(np.abs(corr), axis=1)

def main(csv_file_path, plaintext_col, samples_col):
    print(f"[*] Reading dataset from: {csv_file_path}")
    chunksize = 5000
    try:
        reader = pd.read_csv(csv_file_path, chunksize=chunksize)
    except FileNotFoundError:
        print(f"[-] Error: Could not find the file '{csv_file_path}'")
        return

    plaintexts_list = []
    traces_list = []
    total_rows = 0
    corrupted_rows = 0
    expected_samples_count = None

    for chunk in reader:
        for index, row in chunk.iterrows():
            total_rows += 1
            try:
                pt_bytes = hex_to_bytes(row[plaintext_col])
                trace_samples = parse_samples(row[samples_col])
                if expected_samples_count is None:
                    expected_samples_count = len(trace_samples)
                    print(f"[+] Detected trace sample resolution width: {expected_samples_count} points.")
                elif len(trace_samples) != expected_samples_count:
                    raise ValueError("Inconsistent sample length.")
                plaintexts_list.append(pt_bytes)
                traces_list.append(trace_samples)
            except Exception:
                corrupted_rows += 1
                continue

    print(f"\n[+] Data ingestion finished.")
    print(f"    - Total rows processed: {total_rows}")
    print(f"    - Valid traces parsed:  {len(traces_list)}")
    print(f"    - Corrupted rows skipped: {corrupted_rows}")

    if len(traces_list) < 10:
        print("[-] Error: Too few valid traces parsed to perform meaningful analysis.")
        sys.exit(1)

    plaintexts = np.array(plaintexts_list, dtype=np.uint8)
    traces = np.array(traces_list, dtype=np.float32)
    num_traces = plaintexts.shape[0]
    recovered_key = []
    
    print("\n[*] Running Correlation Power Analysis (CPA)...")
    for b in range(16):
        hyp_power = np.zeros((num_traces, 256), dtype=np.float32)
        for k_guess in range(256):
            intermediate_state = SBOX[plaintexts[:, b] ^ k_guess]
            hyp_power[:, k_guess] = HW_TABLE[intermediate_state]
        
        correlation_scores = calculate_max_correlation(hyp_power, traces)
        best_guess = np.argmax(correlation_scores)
        max_corr_value = correlation_scores[best_guess]
        recovered_key.append(best_guess)
        print(f"    - Byte {b:02d} | Recovered: 0x{best_guess:02x} | Max Abs Corr: {max_corr_value:.5f}")

    master_key_hex = "".join(f"{b:02x}" for b in recovered_key)
    print("\n" + "="*50)
    print(f"🎉 CRACKED AES 128-BIT MASTER KEY: {master_key_hex.upper()}")
    print("="*50)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Correlation Power Analysis (CPA) on AES Traces")
    parser.add_argument("-f", "--file", default="side_channel_data.csv", help="Path to your traces CSV file")
    parser.add_argument("-p", "--plaintext", default="plain_text", help="Column name for Plaintext Hex")
    parser.add_argument("-s", "--samples", default="sample_values", help="Column name for Traces/Scope Samples")
    args = parser.parse_args()
    
    main(args.file, args.plaintext, args.samples)
