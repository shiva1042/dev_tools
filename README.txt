       Challenge: Grounded - Recover File
Scenario: Field analysts recovered an encrypted file (dronecorp_flight_001.DAT) from a grounded BigCorp drone. The file uses a lightweight, self-referential encryption scheme applied to compressed telemetry logs. Standard parsers fail to read it.
Mission Objective: Decrypt and parse the flight log to extract flight metrics and locate the embedded flag.
Available Artifacts: dronecorp_flight_001.DAT
Tasks:
    (a) Analyse the file header to determine the encryption parameters (which are self-referential)
    (b) Decrypt the file and parse the telemetry data
    (c) Extract the flight time, coordinates, altitude, and distance
    (d) Locate the flag embedded within the recovered data structure
Flags:
    (a) Flag 1: The flag embedded within the decrypted flight data (FLAG{...})

