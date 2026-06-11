       Challenge: Payload Extraction
Scenario: A data payload was intercepted, but it is heavily encrypted. Clues regarding the encryption method and keys were discovered in previous challenges (specifically Challenge 1 and Challenge 6).
Mission Objective: Derive the correct key and apply the appropriate decryption method to reveal the sensitive information.
Available Artifacts:
    • intercepted_payload.enc
    • Keys/Algorithms discovered in previous flags
Tasks:
    (a) Review findings from previous challenges to identify the encryption algorithm (likely XOR or AES) and the specific key
    (b) Apply the derived key to decrypt the payload
    (c) Extract the sensitive information hidden within the decrypted data
Flags:
    (a) Flag 1: The decrypted sensitive data (FLAG{decrypted_data})

