#!/bin/bash
# ultimate_multi_bin_analysis.sh
# Usage: ./ultimate_multi_bin_analysis.sh file1.bin file2.bin firmware.img ...

if [ $# -lt 1 ]; then
  echo "Usage: $0 <file1> [file2 ...]"
  exit 1
fi

run_if_exists() {
  tool="$1"
  shift
  if command -v "$tool" >/dev/null 2>&1; then
    "$tool" "$@" || true
  fi
}

for FILE in "$@"; do
  [ -f "$FILE" ] || { echo "[!] Skipping $FILE"; continue; }

  BASE=$(basename "$FILE")
  OUT="analysis_${BASE}_$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$OUT"

  echo "[+] Analyzing $FILE"

  file "$FILE" > "$OUT/file.txt" 2>&1 || true
  stat "$FILE" > "$OUT/stat.txt" 2>&1 || true

  md5sum "$FILE" > "$OUT/hashes.txt" 2>/dev/null || true
  sha1sum "$FILE" >> "$OUT/hashes.txt" 2>/dev/null || true
  sha256sum "$FILE" >> "$OUT/hashes.txt" 2>/dev/null || true
  sha512sum "$FILE" >> "$OUT/hashes.txt" 2>/dev/null || true

  strings -a -n 4 "$FILE" > "$OUT/strings.txt" 2>/dev/null || true
  strings -a -e l "$FILE" > "$OUT/unicode_strings.txt" 2>/dev/null || true

  xxd "$FILE" > "$OUT/hex.txt" 2>/dev/null || true
  hexdump -C "$FILE" > "$OUT/hexdump.txt" 2>/dev/null || true

  if command -v binwalk >/dev/null 2>&1; then
    mkdir -p "$OUT/binwalk"
    binwalk "$FILE" > "$OUT/binwalk_scan.txt" 2>&1 || true
    binwalk -eM "$FILE" --directory "$OUT/binwalk" > "$OUT/binwalk_extract.txt" 2>&1 || true
  fi

  if command -v foremost >/dev/null 2>&1; then
    foremost -i "$FILE" -o "$OUT/foremost" > "$OUT/foremost.txt" 2>&1 || true
  fi

  if command -v bulk_extractor >/dev/null 2>&1; then
    bulk_extractor "$FILE" -o "$OUT/bulk_extractor" > "$OUT/bulk_extractor.txt" 2>&1 || true
  fi

  run_if_exists exiftool "$FILE" > "$OUT/exiftool.txt" 2>&1
  run_if_exists floss "$FILE" > "$OUT/floss.txt" 2>&1
  run_if_exists capa "$FILE" > "$OUT/capa.txt" 2>&1
  run_if_exists diec "$FILE" > "$OUT/diec.txt" 2>&1

  if command -v rabin2 >/dev/null 2>&1; then
    rabin2 -I "$FILE" > "$OUT/rabin2_info.txt" 2>&1 || true
    rabin2 -zz "$FILE" > "$OUT/rabin2_strings.txt" 2>&1 || true
  fi

  run_if_exists objdump -x "$FILE" > "$OUT/objdump_headers.txt" 2>&1
  run_if_exists readelf -a "$FILE" > "$OUT/readelf.txt" 2>&1
  run_if_exists nm "$FILE" > "$OUT/nm.txt" 2>&1

  grep -aE "RSA|AES|DES|SHA1|SHA256|SHA512|PGP|PRIVATE KEY|PUBLIC KEY|ssh-rsa|flag\{|ctf\{" \
      "$FILE" > "$OUT/crypto_hits.txt" 2>/dev/null || true

  grep -Eo '[A-Za-z0-9+/]{20,}={0,2}' "$OUT/strings.txt" \
      > "$OUT/base64_candidates.txt" 2>/dev/null || true

  if command -v ent >/dev/null 2>&1; then
      ent "$FILE" > "$OUT/entropy.txt" 2>&1 || true
  fi

  echo "[+] Completed: $FILE -> $OUT"
done

echo "[+] All files processed."
