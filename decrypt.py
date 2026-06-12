def decrypt_permutation(ciphertext, order):
    out = ""
    block_size = 5
    for i in range(int(len(ciphertext) / block_size)):
        for j in order:
            out += ciphertext[i * block_size + j]
    return out


cipher = "QMNJVSA NV WEWC FLCT VPRJ TJ TVVPLVL FV XJA VQILDHC XMLNVC NACYCLPA FC GYT VFVW FV WGQYP PQQ PQCS Y WSQ RX QMNJVAFY CGV TLVHF CW TYL AEUQ FV XJA TKBV CQNSQS LHF AVAWNC CV EAS FUQB QVQ TC YLLRQR XXWA CFY PSDC UQF AVRQC GEFQ PYAT TRAC XWV TAA WWD DV EAS FLCBQ VD TRAWM VUPQ QUW X DECGQCWT YQ YAFL VLQS YQKLHQ SNAFQ VML LHVQPAWR NQG VFUSR EC WAWY QP FN WGAFDWG"

key = {
    'a': 'q',
    'b': 'j',
    'c': 'e',
    'd': 'p',
    'e': 'v',
    'f': 's',
    'g': 'g',
    'h': 'f',
    'i': 'c',
    'j': 'k',
    'k': 'm',
    'l': 't',
    'm': 'u',
    'n': 'y',
    'o': 'w',
    'p': 'h',
    'q': 'i',
    'r': 'n',
    's': 'l',
    't': 'a',
    'u': 'd',
    'v': 'b',
    'w': 'r',
    'x': 'o',
    'y': 'x',
    'z': 'z'
}

inv_key = {v: k for k, v in key.items()}

clean_cipher = "".join([c for c in cipher if c.isalpha()])
print("Clean Cipher: ", clean_cipher)
substituted = ""
permuted = decrypt_permutation(clean_cipher, [3, 2, 4, 0, 1])
# print(clean_plain[3])

print("Permuted Cipher: ", permuted)

for ch in permuted.lower():
    substituted += inv_key[ch]

print("Substituted Text: ", substituted.upper())

BREAKER OF THIS CODE WILL BE BLESSED BY THE SQUEAKY SPIRIT RESIDING IN THE HOLE GO AHEAD AND FIND A WAY OF BREAKING THE SPELL ON HIM CAST BY THE EVIL JAFFAR THE SPIRIT OF THE CAVE MAN IS ALWAYS WITH YOU FIND THE MAGIC WAND THAT WILL LET YOU OUT OF THE CAVES IT WOULD MAKE YOU A MAGICIAN NO LESS THAN JAFFAR SPEAK THE PASSWORD THE MAGIC OF WAND TO GO THROUGH






