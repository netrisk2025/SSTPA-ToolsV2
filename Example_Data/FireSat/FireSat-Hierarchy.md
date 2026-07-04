# FireSat Example Project — Hierarchical Description

FireSat is the SSTPA Tools Example Data project (SRS §3.6.1): a capability
that detects forest fires early and directs their rapid suppression. It is
**structurally comprehensive but intentionally not a viable technical
design** — behaviors of decomposed elements are typical of their type. Use
it as a tutorial exemplar of how a project is put together: structure,
communications (Connections/Interfaces), high-level Functions, and
Requirements flow-down.

Every System in the model carries a Purpose, an Environment, States with
transitions, Functions, Interfaces, Requirements, and Elements — including
at least one Element that is itself a System (except terminal systems at
the bottom of each branch) and at least one leaf Element that is not.

## The four Tier-1 segments

| Segment | HID | Role | Typical communications |
|---|---|---|---|
| Space Segment | `SYS_1_0` | LEO satellites detecting forest fires | Ka-band IPSec downlink, S-band TT&C, SpaceWire/LVDS on board |
| Command Segment | `SYS_2_0` | National command center directing response | Ground station RF, SATCOM tasking, P25 LMR, HTTPS logistics |
| Aviation Segment | `SYS_3_0` | Air tankers (water drops) and smokejumpers | SATCOM tasking, VHF-FM air-ground tactical voice, ARINC 429 |
| Ground Segment | `SYS_4_0` | Forest watch stations and vehicle fleet | P25 LMR, microwave IP backhaul, LTE logistics data |

## Hierarchy (Systems and leaf Elements by tier)

Tier numbering: T0 is the Project (Capability) root; a System's tier is
the number of segments in its SoI index (`SYS_1.1.2_0` → T3). The deep
decomposition spine runs through the Space Segment payload to **Tier 8**
(`Signal Processing Chain`, `SYS_1.1.2.1.2.1.1.1_0`), with its leaf
Elements at T9. A Component that parents a child System appears once,
as the System line (same name, `EL_… -[:PARENTS]-> SYS_…`).

This tree is regenerated on every build as `dist/hierarchy-tree.txt`
(or on demand: `python3 build_firesat.py --tree`).

```
- [T0] FireSat (CAP__1, Project root)
  - [T1] Space Segment (SYS_1_0)
    - [T2] Launch Dispenser (EL_1_2, leaf Element)
    - [T2] On-Orbit Spare Pool (EL_1_3, leaf Element)
    - [T2] FireSat Satellite (SYS_1.1_0)
      - [T3] Solar Array Wings (EL_1.1_3, leaf Element)
      - [T3] Structure And Harness (EL_1.1_4, leaf Element)
      - [T3] Spacecraft Bus (SYS_1.1.1_0)
        - [T4] Electrical Power Subsystem (EL_1.1.1_2, leaf Element)
        - [T4] Command And Data Handling Computer (EL_1.1.1_3, leaf Element)
        - [T4] S-Band Transponder (EL_1.1.1_4, leaf Element)
        - [T4] Attitude Determination And Control System (SYS_1.1.1.1_0)
          - [T5] Star Tracker (EL_1.1.1.1_2, leaf Element)
          - [T5] Inertial Measurement Unit (EL_1.1.1.1_3, leaf Element)
          - [T5] Reaction Wheel Assembly (SYS_1.1.1.1.1_0)
            - [T6] Wheel Modules (EL_1.1.1.1.1_1, leaf Element)
            - [T6] Wheel Drive Electronics (EL_1.1.1.1.1_2, leaf Element)
      - [T3] Fire Detection Payload (SYS_1.1.2_0)
        - [T4] Payload Processor (EL_1.1.2_3, leaf Element)
        - [T4] IR Sensor Assembly (SYS_1.1.2.1_0)
          - [T5] Telescope Optics (EL_1.1.2.1_1, leaf Element)
          - [T5] Cryocooler (EL_1.1.2.1_3, leaf Element)
          - [T5] Focal Plane Unit (SYS_1.1.2.1.2_0)
            - [T6] FPA Thermal Strap (EL_1.1.2.1.2_2, leaf Element)
            - [T6] FPA Control Board (EL_1.1.2.1.2_3, leaf Element)
            - [T6] Detector Array (SYS_1.1.2.1.2.1_0)
              - [T7] Detector Substrate (EL_1.1.2.1.2.1_2, leaf Element)
              - [T7] Readout Electronics (SYS_1.1.2.1.2.1.1_0)
                - [T8] Bias Regulator (EL_1.1.2.1.2.1.1_2, leaf Element)
                - [T8] Signal Processing Chain (SYS_1.1.2.1.2.1.1.1_0)
                  - [T9] Preamplifier (EL_1.1.2.1.2.1.1.1_1, leaf Element)
                  - [T9] Video ADC (EL_1.1.2.1.2.1.1.1_2, leaf Element)
                  - [T9] Output Serializer (EL_1.1.2.1.2.1.1.1_3, leaf Element)
        - [T4] Payload Communications Unit (SYS_1.1.2.2_0)
          - [T5] Ka-Band Transmitter (EL_1.1.2.2_1, leaf Element)
          - [T5] Crypto Module (EL_1.1.2.2_2, leaf Element)
          - [T5] Antenna Gimbal (EL_1.1.2.2_3, leaf Element)
  - [T1] Command Segment (SYS_2_0)
    - [T2] Backup Power Plant (EL_2_3, leaf Element)
    - [T2] Ground Station (SYS_2.1_0)
      - [T3] Uplink Exciter (EL_2.1_2, leaf Element)
      - [T3] Station Network (EL_2.1_3, leaf Element)
      - [T3] Satellite Receiver (SYS_2.1.1_0)
        - [T4] Tracking Antenna (EL_2.1.1_2, leaf Element)
        - [T4] Demodulator And Crypto Gateway (EL_2.1.1_3, leaf Element)
        - [T4] RF Front End (SYS_2.1.1.1_0)
          - [T5] Low-Noise Amplifier (EL_2.1.1.1_1, leaf Element)
          - [T5] Block Downconverter (EL_2.1.1.1_2, leaf Element)
    - [T2] Operations Center (SYS_2.2_0)
      - [T3] Watch Floor Consoles (EL_2.2_3, leaf Element)
      - [T3] Mission Data Processing (SYS_2.2.1_0)
        - [T4] Fusion Server (EL_2.2.1_1, leaf Element)
        - [T4] Detection Database (EL_2.2.1_2, leaf Element)
      - [T3] Communications Suite (SYS_2.2.2_0)
        - [T4] SATCOM Terminal (EL_2.2.2_1, leaf Element)
        - [T4] LMR Gateway (EL_2.2.2_2, leaf Element)
        - [T4] VoIP Switch (EL_2.2.2_3, leaf Element)
  - [T1] Aviation Segment (SYS_3_0)
    - [T2] Air Tanker Fleet (SYS_3.1_0)
      - [T3] Lead Plane (EL_3.1_2, leaf Element)
      - [T3] Air Tanker (SYS_3.1.1_0)
        - [T4] Tanker Airframe (EL_3.1.1_3, leaf Element)
        - [T4] Water Drop System (SYS_3.1.1.1_0)
          - [T5] Water Tank (EL_3.1.1.1_1, leaf Element)
          - [T5] Drop Doors (EL_3.1.1.1_2, leaf Element)
          - [T5] Transfer Pump (EL_3.1.1.1_3, leaf Element)
        - [T4] Tanker Avionics (SYS_3.1.1.2_0)
          - [T5] VHF Tactical Radio (EL_3.1.1.2_1, leaf Element)
          - [T5] SATCOM Transceiver (EL_3.1.1.2_2, leaf Element)
          - [T5] GPS Navigator (EL_3.1.1.2_3, leaf Element)
          - [T5] Surveillance Transponder (EL_3.1.1.2_4, leaf Element)
    - [T2] Smokejumper Wing (SYS_3.2_0)
      - [T3] Smokejumper Teams (EL_3.2_2, leaf Element)
      - [T3] Jump Aircraft (SYS_3.2.1_0)
        - [T4] Jump Platform (EL_3.2.1_1, leaf Element)
        - [T4] Crew Radio (EL_3.2.1_2, leaf Element)
    - [T2] Air Operations Base (SYS_3.3_0)
      - [T3] Retardant Plant (EL_3.3_1, leaf Element)
      - [T3] Flight Line Services (EL_3.3_2, leaf Element)
      - [T3] Base Communications (EL_3.3_3, leaf Element)
  - [T1] Ground Segment (SYS_4_0)
    - [T2] Hand Crew Equipment Cache (EL_4_3, leaf Element)
    - [T2] Watch Station Network (SYS_4.1_0)
      - [T3] Backhaul Relay (EL_4.1_2, leaf Element)
      - [T3] Watch Station (SYS_4.1.1_0)
        - [T4] Observation Tower (EL_4.1.1_2, leaf Element)
        - [T4] Station Radio (EL_4.1.1_3, leaf Element)
        - [T4] Optical Spotting System (SYS_4.1.1.1_0)
          - [T5] Spotting Camera (EL_4.1.1.1_1, leaf Element)
          - [T5] Calibrated Pan-Tilt Head (EL_4.1.1.1_2, leaf Element)
    - [T2] Vehicle Fleet (SYS_4.2_0)
      - [T3] Logistics Truck (EL_4.2_2, leaf Element)
      - [T3] Fuel Tender (EL_4.2_3, leaf Element)
      - [T3] Fire Engine (SYS_4.2.1_0)
        - [T4] Pump Module (EL_4.2.1_1, leaf Element)
        - [T4] Water Tank (EL_4.2.1_2, leaf Element)
        - [T4] Vehicle Radio (EL_4.2.1_3, leaf Element)
```

## Communications (Connections and their participating Interfaces)

Connections are owned by the System where they logically originate;
Interfaces join them via `[:PARTICIPATES_IN]`, which is allowed to cross
SoI boundaries (SRS §3.3.5). Cross-segment links deliberately have
participants at several tiers to illustrate segment-level and deep
equipment-level views of the same link.

| Connection (owner) | HID | Type / protocol | Participants |
|---|---|---|---|
| Detection Downlink (Space Segment) | `CNN_1_1` | Ka-band RF, CCSDS AOS + ESP/IPSec | Space Ka-Band Downlink IF, **Payload Comms IPSec Downlink IF** (`SYS_1.1.2.2`), Command Satellite Downlink Receive IF, **Satellite Receiver IPSec Ground IF** (`SYS_2.1.1`) |
| TT&C Link (Space Segment) | `CNN_1_2` | S-band RF, CCSDS TC/TM | Space S-Band TT&C IF, Bus TT&C RF IF, Ground Station TT&C Ground IF |
| Payload-Bus Data Bus (FireSat Satellite) | `CNN_1.1_1` | SpaceWire | Payload Data IF, Bus Payload Data IF |
| Sensor Video Link (Fire Detection Payload) | `CNN_1.1.2_1` | LVDS pixel video | Signal Processing Chain Video Output IF (T8), Payload Sensor Video Input IF |
| Aviation Tasking Link (Command Segment) | `CNN_2_1` | SATCOM IP, encrypted tasking | Command Aviation Tasking IF, SATCOM Terminal IF, Aviation Segment Tasking IF, Tanker SATCOM IF, Base SATCOM IF |
| Ground Coordination Network (Command Segment) | `CNN_2_2` | APCO P25 LMR, AES voice | Command Ground Coordination IF, LMR Gateway IF, Ground Tactical Radio IF, Watch Station Radio IF, Fire Engine Radio IF |
| Logistics Coordination Link (Command Segment) | `CNN_2_3` | HTTPS over LTE + satellite backup | Command Logistics IF, Ground Fleet Logistics IF, Fleet Data IF |
| Operations LAN (Operations Center) | `CNN_2.2_1` | IP over switched Ethernet | Operations LAN IF, Mission Data Feed IF |
| Air-To-Ground Tactical Net (Aviation Segment) | `CNN_3_1` | VHF-FM simplex voice | Aviation Air-Ground IF, Fleet Common Frequency IF, Tanker VHF IF, Wing Air-Ground IF, Ground Air-Net IF, Engine Air-Net IF |
| Tanker Avionics Bus (Air Tanker) | `CNN_3.1.1_1` | ARINC 429 | Drop Command IF, Drop System Bus IF |
| Watch Station Backhaul (Ground Segment) | `CNN_4_1` | IP over licensed microwave | Command Watch Backhaul IF, Network Backhaul IF, Station Backhaul IF |

The worked example from the tutorial brief is in the model end-to-end:
the Space Segment satellite **Payload sensor detects forest fires**
(`Collect Infrared Radiance` → `Classify Fire Detections` → `Format And
Queue Detection Reports`), the **Payload Communications Unit** carries an
**IPSec Downlink Interface** that joins the **Detection Downlink**
connection, whose ground peer is the Command Segment **Ground Station
Satellite Receiver** `IPSec Ground Interface`.

## Requirements flow-down

55 Requirements are distributed across the Project, System Purposes, and
entities (Functions, Interfaces, Elements, Connections). Flow-down uses
`(:Requirement)-[:PARENTS]->(:Requirement)`. The deepest chain follows
the detection spine from capability to Tier 8:

1. `REQ__1` Capability Fire Detection (FireSat)
2. `REQ_1_3` Space Segment Detection Performance
3. `REQ_1.1_x` Satellite Detection
4. `REQ_1.1.2_x` Payload Detection Chain
5. `REQ_1.1.2.1_x` Sensor Radiance Measurement
6. `REQ_1.1.2.1.2_x` Focal Plane Sensitivity
7. `REQ_1.1.2.1.2.1_x` Array Responsivity
8. `REQ_1.1.2.1.2.1.1_x` Lossless Digitization
9. `REQ_1.1.2.1.2.1.1.1_x` Chain Encoding Fidelity

## Node inventory

467 nodes, 842 relationships: 1 Project, 33 Systems, 33 Purposes,
33 Environments, 74 States, 85 Functions, 50 Interfaces, 92 Elements
(Components), 11 Connections, 55 Requirements.

Deliberately **left out as tutorial exercises**: Assets and trace
relationships (`HOLDS`/`TRANSPORTS`/`USES`), Use Cases, Losses, Attack
Trees, Control Structures, Countermeasures, and Verifications. The
structural model gives a tutorial everything it needs to walk users
through adding each of those with the Add-on Tools.
