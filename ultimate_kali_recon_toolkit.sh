#!/bin/bash
# ULTIMATE KALI RECON TOOLKIT
# Firmware, PCAP, Binary, Crypto, CSV Recon
# Results printed to screen and saved to reports

TARGET="$1"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target>"
    exit 1
fi

OUTDIR="ultimate_recon_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR"

banner() {
    echo
    echo "===================================================="
    echo "$1"
    echo "===================================================="
}

banner "FILE INFORMATION"
file "$TARGET" | tee "$OUTDIR/file.txt"
sha256sum "$TARGET" | tee "$OUTDIR/sha256.txt"

banner "STRINGS ANALYSIS"
strings -a "$TARGET" | tee "$OUTDIR/strings.txt" > /dev/null
grep -iE "password|passwd|secret|token|apikey|key|flag|aes|rsa|sha|credential" \
"$OUTDIR/strings.txt" | tee "$OUTDIR/interesting.txt"

banner "HEX PREVIEW"
xxd "$TARGET" | head -100 | tee "$OUTDIR/hexdump_preview.txt"

if command -v binwalk >/dev/null 2>&1; then
    banner "BINWALK"
    binwalk "$TARGET" | tee "$OUTDIR/binwalk.txt"

    banner "BINWALK EXTRACTION"
    binwalk -Me "$TARGET" --directory "$OUTDIR/extracted" 2>/dev/null
fi

EXT="${TARGET##*.}"

if [[ "$EXT" == "pcap" || "$EXT" == "pcapng" ]]; then
    banner "PCAP ANALYSIS"

    tshark -r "$TARGET" | head -50 | tee "$OUTDIR/tshark_summary.txt"

    tshark -r "$TARGET" -T fields -e data \
      > "$OUTDIR/payloads.txt" 2>/dev/null

    echo "[+] Payloads extracted to payloads.txt"
fi

if [[ "$EXT" == "csv" ]]; then
    banner "CSV CRYPTO ANALYSIS"

python3 - "$TARGET" << 'EOF'
import csv,sys,base64

f=sys.argv[1]

def ishex(x):
    try:
        bytes.fromhex(x)
        return True
    except:
        return False

rows=0
with open(f,newline='') as fh:
    r=csv.reader(fh)
    for row in r:
        rows+=1
        for c in row:
            c=c.strip()

            if ishex(c):
                b=bytes.fromhex(c)

                if len(b)%16==0:
                    print("[AES Candidate] length =",len(b))

                if len(b)==16:
                    print("[128-bit candidate block]")

                if len(b)==32:
                    print("[256-bit candidate block]")

print("Rows:",rows)
EOF
fi

if file "$TARGET" | grep -qi ELF; then
    banner "ELF ANALYSIS"

    readelf -h "$TARGET" | tee "$OUTDIR/readelf.txt"

    strings "$TARGET" | grep -i main | head
fi

banner "COMMON SECRET HUNT"

grep -RniE "password|passwd|secret|token|apikey|credential|flag" \
"$OUTDIR" 2>/dev/null | tee "$OUTDIR/found_secrets.txt"

banner "COMPLETE"
echo "Results stored in: $OUTDIR"
