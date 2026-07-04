// SSTPA Example Data Load Script — FireSat (SRS §3.6.1)
// Generated 2026-07-04 v1 by Example_Data/FireSat/build_firesat.py
// Owner/Creator: SSTPA Tools <tools@sstpa.example> (SRS §2: Example Data
// ownership cannot change). Idempotent: MERGE on HID.
// Tier-1 SoI indexes: 1 2 3 4
// Project root HID: CAP__1
// Expected example node count: 467

MERGE (n:SSTPA:Project {HID: 'CAP__1'})
SET n += {Name: 'FireSat', uuid: '22c4cbb6-02cd-503e-8b5d-b8f67332a476', TypeName: 'Project', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Integrated forest-fire detection and suppression capability.', LongDescription: 'FireSat is the SSTPA Tools tutorial example project. It combines a low-earth-orbit satellite constellation that detects forest fires, a national command center that directs firefighting activities, an aviation component that drops water and deploys fire jumpers, and a ground component of forest watch stations and support vehicles. The example is structurally comprehensive but intentionally not a viable technical design.', MissionAction: 'detect forest fires early and direct their rapid suppression', MissionMeans: 'an integrated capability of low-earth-orbit detection satellites, a national fire command center, firefighting aviation, and forest ground assets', MissionContribution: 'the protection of life, property, and national forest resources'};
MERGE (n:SSTPA:Requirement {HID: 'REQ__1'})
SET n += {Name: 'Capability Fire Detection', Baseline: 'None', Orphan: false, Barren: false, uuid: '36565021-c333-56f3-9da7-75d1ac83ec70', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'FireSat SHALL detect active forest fires within protected national forests and report each detection to the Command Segment within 15 minutes of ignition.', VMethod: 'Demonstration', VStatement: 'End-to-end detection exercise against controlled test burns observed by at least one satellite pass.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ__2'})
SET n += {Name: 'Capability Suppression Direction', Baseline: 'None', Orphan: false, Barren: false, uuid: '6168d0d6-01dd-57e1-a059-ac68cf3e6091', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'FireSat SHALL direct aerial and ground suppression assets onto a reported fire within 60 minutes of detection confirmation.', VMethod: 'Demonstration', VStatement: 'Command post exercise timing tasking messages from detection confirmation to asset on-scene report.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ__3'})
SET n += {Name: 'Capability Sustained Watch', Baseline: 'None', Orphan: false, Barren: false, uuid: 'ae950cda-0000-5621-9b36-f262039f60f2', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'FireSat SHALL sustain continuous fire-watch operations over all protected national forests for the duration of each fire season.', VMethod: 'Analysis', VStatement: 'Availability analysis across the space, command, aviation, and ground segments over a modeled 180-day fire season.'};
MERGE (n:SSTPA:System {HID: 'SYS_1_0'})
SET n += {Name: 'Space Segment', uuid: '9e7b52ea-91a4-516e-8bdd-31b172e28fc4', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Low-earth-orbit satellite constellation that detects forest fires.', LongDescription: 'A constellation of low-earth-orbit FireSat satellites that persistently scans protected forests for thermal signatures of active fires and downlinks detection reports to the Command Segment ground station.', MissionAction: 'detect forest fires from low earth orbit', MissionMeans: 'a constellation of infrared-sensing FireSat satellites', MissionContribution: 'early warning that drives the FireSat suppression timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1_1'})
SET n += {Name: 'Orbital Fire Detection', uuid: 'a25a75ff-13e1-5189-aa27-065d4713b1fa', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Provide persistent orbital detection of forest fires.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1_1'})
SET n += {Name: 'Low Earth Orbit', uuid: '3166d427-61cf-5d8f-9c7f-e506df99ea4f', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'LEO orbital and space-ground RF environment.', Context: 'Sun-synchronous low earth orbit; space radiation and thermal-vacuum environment; Ka-band and S-band space-to-ground RF environment.'};
MERGE (n:SSTPA:State {HID: 'ST_1_1'})
SET n += {Name: 'Pre-Launch', TransitionKind: 'FUNCTIONAL', uuid: '41864171-ceb0-5661-9f4f-74a9fb822c46', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Constellation assets integrated and awaiting launch.', StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1_2'})
SET n += {Name: 'Commissioning', TransitionKind: 'FUNCTIONAL', uuid: 'cc138d93-4e26-5d92-8d23-2ffa77d7d5a3', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'On-orbit checkout of newly launched satellites.', StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_1_3'})
SET n += {Name: 'Operational', TransitionKind: 'FUNCTIONAL', uuid: '4a8349a1-38c0-507a-a25c-9e84b5682b00', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Constellation performing fire-watch operations.', StateSequence: 2};
MERGE (n:SSTPA:State {HID: 'ST_1_4'})
SET n += {Name: 'Safe Hold', TransitionKind: 'FUNCTIONAL', uuid: 'd59f29db-15e7-5480-bc11-be45a089f712', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sun-safe attitude with payload off.', StateSequence: 3};
MERGE (n:SSTPA:Component {HID: 'EL_1_1'})
SET n += {Name: 'FireSat Satellite', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1b69e992-2b83-5ff3-8f57-57252a264af5', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Low-earth-orbit fire detection satellite (constellation member).', TechnologyType: 'Small-satellite bus with infrared sensing payload', DeploymentContext: 'Sun-synchronous low earth orbit'};
MERGE (n:SSTPA:Component {HID: 'EL_1_2'})
SET n += {Name: 'Launch Dispenser', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2102a7eb-d06d-54f9-905c-d825a3068953', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Multi-satellite dispenser mating the constellation to the launcher.', TechnologyType: 'Multi-payload launch dispenser'};
MERGE (n:SSTPA:Component {HID: 'EL_1_3'})
SET n += {Name: 'On-Orbit Spare Pool', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'acc1abe7-5bb3-51fd-9506-197bc5395891', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Stored spare satellites phased for constellation replenishment.', TechnologyType: 'Dormant spare satellites'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1_1'})
SET n += {Name: 'Detect Forest Fires From Orbit', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'af6004e0-2018-552c-a14e-b8b2d6fcb064', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Scan protected forests for thermal fire signatures each pass.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1_2'})
SET n += {Name: 'Downlink Fire Detections', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4403feb3-903c-599d-9482-f4bf9af80866', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver detection reports to the Command Segment ground station.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1_3'})
SET n += {Name: 'Receive Commands And Report Health', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '431b7a2f-3505-52c3-8b6b-858622d42a84', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Execute ground commands and return spacecraft telemetry.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1_4'})
SET n += {Name: 'Maintain Constellation Coverage', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3c0e3693-f149-58b5-829b-994b44f3b16c', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Keep constellation phasing that meets the revisit requirement.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_1_1'})
SET n += {Name: 'Detection Downlink', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f9b5a3bc-d533-5cc4-b862-d8a11490dc62', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ka-band space-to-ground link carrying fire detection reports.', Connection_Description: 'Primary mission data path: fire detection reports from the payload to the Command Segment ground station.', ConnectionType: 'RF space-to-ground link', OSILayer: 3, Protocol: 'CCSDS AOS over Ka-band, ESP/IPSec', Directionality: 'Unidirectional', TimingClass: 'Near-real-time', SecurityClass: 'Encrypted', PayloadDescription: 'Geolocated fire detection messages and payload housekeeping.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1_1'})
SET n += {Name: 'Downlink Latency', Baseline: 'None', Orphan: false, Barren: true, uuid: 'c9ba4053-6b79-5524-bf14-81d56eef3440', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Detection Downlink SHALL deliver a detection message from satellite transmission to ground station reception in less than 60 seconds while a ground station is in view.', VMethod: 'Test', VStatement: 'Timestamp comparison across a live pass.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_1_2'})
SET n += {Name: 'TT&C Link', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'cce2788a-f19f-506c-b06c-ee02ae28a86c', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'S-band command uplink and telemetry downlink.', Connection_Description: 'Spacecraft commanding and health monitoring.', ConnectionType: 'RF space-to-ground link', OSILayer: 2, Protocol: 'CCSDS TC/TM over S-band', Directionality: 'Bidirectional', TimingClass: 'Pass-scheduled', SecurityClass: 'Authenticated commands', PayloadDescription: 'Telecommands, spacecraft telemetry, orbit ephemerides.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1_1'})
SET n += {Name: 'Ka-Band Downlink Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'da41c822-3d01-5e9a-bfc5-4c4cc95b086c', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level Ka-band space-to-ground detection downlink.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1_2'})
SET n += {Name: 'Downlink Encryption', Baseline: 'None', Orphan: false, Barren: false, uuid: '0893f7ea-cbb4-5ed0-9d49-98e5cdcfc23e', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Ka-Band Downlink Interface SHALL protect all detection traffic in transit using IPSec.', VMethod: 'Test', VStatement: 'Protocol capture shows only ESP-protected frames.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1_2'})
SET n += {Name: 'S-Band TT&C Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2c4c177f-6ca6-5bbf-8850-cb98e8202863', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level S-band telemetry, tracking and command interface.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1_3'})
SET n += {Name: 'Space Segment Revisit', Baseline: 'None', Orphan: true, Barren: true, uuid: '26a9a307-eb6e-55e4-8e71-0bba029322ba', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Space Segment SHALL revisit every protected forest area at least once every 30 minutes during fire season.', VMethod: 'Analysis', VStatement: 'Constellation coverage analysis over the mission orbit set.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1_4'})
SET n += {Name: 'Space Segment Detection Performance', Baseline: 'None', Orphan: true, Barren: false, uuid: '2ab78107-e408-5556-a414-e1f1d54f6312', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Space Segment SHALL detect an active fire of 4 hectares or larger with at least 90 percent probability on each satellite pass.', VMethod: 'Demonstration', VStatement: 'Controlled burn campaign scored against pass detections.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1_5'})
SET n += {Name: 'Space Segment Reporting', Baseline: 'None', Orphan: true, Barren: false, uuid: '6b55e545-fbba-5d35-8232-d11652de09d3', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1', Sequence: 5, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Space Segment SHALL deliver each detection report to the Command Segment ground station within 5 minutes of on-board detection.', VMethod: 'Test', VStatement: 'End-to-end latency measurement over ten live passes.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1_0'})
SET n += {Name: 'FireSat Satellite', uuid: '3f296df8-7a16-5e31-acc9-2d47f783f4ac', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'One constellation member combining bus and fire detection payload.', MissionAction: 'detect and report forest fires along its ground track', MissionMeans: 'an infrared fire detection payload carried on a small-satellite bus', MissionContribution: 'Space Segment revisit and detection performance'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1_1'})
SET n += {Name: 'Satellite Fire Watch', uuid: '42bdbc69-0462-50c9-9d00-3222c6e64d70', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Detect and report fires along the orbital ground track.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1_1'})
SET n += {Name: 'On-Orbit Environment', uuid: 'add68856-9726-59e2-969f-16f4eb0827db', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Orbital thermal-vacuum, radiation, and micrometeoroid environment.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1_1'})
SET n += {Name: 'Off', TransitionKind: 'FUNCTIONAL', uuid: '08db661b-2246-568e-a92e-913ede4f0fad', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1_2'})
SET n += {Name: 'Sun-Safe', TransitionKind: 'FUNCTIONAL', uuid: '6309acf8-c32e-5029-813d-cd94b7859e06', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Power-positive attitude with payload off.', StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_1.1_3'})
SET n += {Name: 'Nominal Operations', TransitionKind: 'FUNCTIONAL', uuid: '31587f18-1e98-5f28-8ddd-1a118352b408', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Payload scanning and downlinking detections.', StateSequence: 2};
MERGE (n:SSTPA:Component {HID: 'EL_1.1_1'})
SET n += {Name: 'Spacecraft Bus', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9d0b0de6-86a7-5b7f-b4af-0ac763a17b8c', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Provides power, attitude, data handling, and TT&C services.', TechnologyType: 'Small-satellite bus'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1_2'})
SET n += {Name: 'Fire Detection Payload', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '165c1d52-2c05-5a99-8e3a-c2a0aa2cedac', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Infrared sensing and detection processing package.', TechnologyType: 'Mid-wave infrared scanning sensor payload'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1_3'})
SET n += {Name: 'Solar Array Wings', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'b04165aa-a51e-5dff-9c3a-d42b54b082cf', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deployable photovoltaic wings generating primary power.', TechnologyType: 'Triple-junction photovoltaic panels'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1_4'})
SET n += {Name: 'Structure And Harness', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ea2e323c-4b6e-5ac8-8050-39bc6b760637', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Primary structure, thermal control surfaces, and wiring.', TechnologyType: 'Aluminum honeycomb structure'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1_1'})
SET n += {Name: 'Generate And Store Power', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '43cba77f-094a-53b7-995b-26abb4dfb472', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Produce and store electrical power for bus and payload.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1_2'})
SET n += {Name: 'Point Sensor At Ground Track', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3e57dc75-765f-5c70-96a6-7817fffc8bb7', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hold payload boresight on the commanded ground track.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1_3'})
SET n += {Name: 'Sense And Classify Fires', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '26b15ba5-fc38-5c5a-afda-d116a452cc61', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Run the payload detection chain over the imaged swath.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1_4'})
SET n += {Name: 'Route Payload Data', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2ddde11b-384b-5b19-bbe2-6d7293641cbc', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Move detection reports from payload to the downlink chain.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_1.1_1'})
SET n += {Name: 'Payload-Bus Data Bus', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd755b1ce-c7f3-5124-9a65-233406f133ba', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'SpaceWire bus linking payload and bus data handling.', Connection_Description: 'Transfers detection reports and payload commands on board.', ConnectionType: 'On-board data bus', OSILayer: 2, Protocol: 'SpaceWire', Directionality: 'Bidirectional', TimingClass: 'Real-time', PayloadDescription: 'Detection reports, payload commands, payload housekeeping.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1_1'})
SET n += {Name: 'Payload Data Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2d06897e-f342-52b3-87d9-a750512e200c', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'SpaceWire interface between payload and bus data handling.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1_2'})
SET n += {Name: 'Bus Telemetry Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3bcfa4fd-9bfc-562f-891c-fb67b7601876', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Telemetry collection points across bus subsystems.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1_1'})
SET n += {Name: 'Satellite Detection', Baseline: 'None', Orphan: true, Barren: false, uuid: '2ebb73b3-45db-501b-9e51-1fc25a40588f', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The FireSat Satellite SHALL detect and geolocate thermal anomalies within its imaged swath on every pass.', VMethod: 'Demonstration', VStatement: 'On-orbit detection of calibrated ground thermal targets.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1_2'})
SET n += {Name: 'Satellite Power Margin', Baseline: 'None', Orphan: true, Barren: false, uuid: '11097631-ae7f-5f73-afe6-23a63f6ae5b9', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The FireSat Satellite SHALL maintain a positive power margin through the eclipse portion of every orbit.', VMethod: 'Analysis', VStatement: 'Energy balance analysis over worst-case orbit.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1_3'})
SET n += {Name: 'Satellite Pointing', Baseline: 'None', Orphan: true, Barren: false, uuid: '2afa683f-6655-5ba4-856e-8408a277d6ac', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The FireSat Satellite SHALL hold the payload boresight within 0.1 degrees of the commanded ground track.', VMethod: 'Test', VStatement: 'Attitude telemetry statistics over ten passes.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.1_0'})
SET n += {Name: 'Spacecraft Bus', uuid: '39726995-4a78-51fe-8c62-fe610d64dadf', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Service module hosting the fire detection payload.', MissionAction: 'sustain and point the fire detection payload', MissionMeans: 'power, attitude control, data handling, and TT&C subsystems', MissionContribution: 'satellite availability and pointing performance'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.1_1'})
SET n += {Name: 'Payload Support Services', uuid: 'd02e8e09-bb33-535a-b145-31d9289bcafb', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sustain and point the payload; move its data to ground.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.1_1'})
SET n += {Name: 'Bus Internal Environment', uuid: 'b2ced9a2-85ce-50c0-a8a8-b0d512641b22', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Spacecraft internal thermal, power, and data-bus environment.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1_1'})
SET n += {Name: 'Idle', TransitionKind: 'FUNCTIONAL', uuid: '47737d08-c269-50a6-a1c7-5d79decccc96', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1_2'})
SET n += {Name: 'Service', TransitionKind: 'FUNCTIONAL', uuid: 'ba0c2d17-0bf6-538e-bda7-c49338e5c1d0', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'All bus services available to the payload.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1_1'})
SET n += {Name: 'Attitude Determination And Control System', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3e71a1a6-d97d-5d51-a4b6-de5b9d06a118', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sensors and actuators that point the spacecraft.', TechnologyType: 'Star tracker, IMU, reaction wheel attitude control'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1_2'})
SET n += {Name: 'Electrical Power Subsystem', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd7465841-581a-5fce-8312-38891a3528f0', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Battery, regulators, and power distribution.', TechnologyType: 'Lithium-ion battery with regulated 28 V bus'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1_3'})
SET n += {Name: 'Command And Data Handling Computer', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2d22271d-ba7a-542f-ab1c-b5fba3800ea7', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'On-board computer executing bus flight software.', TechnologyType: 'Radiation-tolerant flight computer'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1_4'})
SET n += {Name: 'S-Band Transponder', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '72901d15-628b-505b-8510-1f215bbb7bc6', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'TT&C radio for command uplink and telemetry downlink.', TechnologyType: 'S-band transponder'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1_1'})
SET n += {Name: 'Distribute Regulated Power', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e89d801e-dc20-5775-9505-73af38d37a82', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Distribute regulated power to bus and payload loads.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1_2'})
SET n += {Name: 'Determine And Control Attitude', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '35415e6d-2548-5e2a-bb35-c08a92a01a3e', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Estimate attitude and command actuators to hold pointing.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1_3'})
SET n += {Name: 'Handle Commands And Data', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '91674a1e-c913-5b18-89d5-aa569b55aae1', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Execute commands, collect telemetry, route payload data.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1_4'})
SET n += {Name: 'Transmit Telemetry', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'cd9a1470-54e5-5c50-aaee-6deb9a066311', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Exchange TT&C traffic with the ground station.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.1_1'})
SET n += {Name: 'Bus TT&C RF Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '76d7a3a7-112e-5209-a62c-b31fb721ee21', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'S-band transponder interface to the TT&C link.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.1_2'})
SET n += {Name: 'Bus Payload Data Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '0e38a410-0479-5dbd-83cb-1840210f6ec0', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bus-side endpoint of the payload data bus.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.1_1'})
SET n += {Name: 'Bus Power Delivery', Baseline: 'None', Orphan: true, Barren: true, uuid: '19450c4f-2d11-5f2a-85fc-b1e6fba8e05e', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Spacecraft Bus SHALL deliver 28 V regulated power to the payload at up to 300 W.', VMethod: 'Test', VStatement: 'Power quality test at the payload interface.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.1_2'})
SET n += {Name: 'Bus Pointing Control', Baseline: 'None', Orphan: true, Barren: false, uuid: 'ad60260f-a7e0-5f7e-b953-88083dca47d6', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Spacecraft Bus SHALL control spacecraft attitude to within 0.05 degrees per axis during payload operations.', VMethod: 'Test', VStatement: 'Closed-loop pointing test on the flatsat.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.1.1_0'})
SET n += {Name: 'Attitude Determination And Control System', uuid: '4a892a72-1047-57c4-b444-38fd5484f155', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Determines attitude and drives actuators to hold pointing.', MissionAction: 'hold the commanded spacecraft attitude', MissionMeans: 'star tracker and IMU sensing driving reaction wheels', MissionContribution: 'bus pointing control performance'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.1.1_1'})
SET n += {Name: 'Precision Pointing', uuid: 'eba4f623-e925-567b-85fe-f3888d39730c', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Keep the payload boresight on the commanded target.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.1.1_1'})
SET n += {Name: 'ADCS Operating Environment', uuid: '35155cdc-b452-54eb-9166-97016b410989', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Spacecraft dynamics, sensor fields of view, wheel momentum limits.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1.1_1'})
SET n += {Name: 'Coarse Pointing', TransitionKind: 'FUNCTIONAL', uuid: 'f95aaf7f-58fb-50d7-aed7-c2822211e505', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1.1_2'})
SET n += {Name: 'Fine Pointing', TransitionKind: 'FUNCTIONAL', uuid: 'f0bd3b1e-7df9-549d-bc34-df4ba64a6688', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Star-tracker-referenced fine attitude control.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1.1_1'})
SET n += {Name: 'Reaction Wheel Assembly', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ad3c3e93-b293-5bd3-b3a7-de5ce40379f6', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Four-wheel momentum exchange actuator set.', TechnologyType: 'Brushless DC momentum wheels'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1.1_2'})
SET n += {Name: 'Star Tracker', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '99399fd9-89dd-5d09-83aa-2cd0a288f2b8', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Celestial attitude reference camera.', TechnologyType: 'CMOS star camera'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1.1_3'})
SET n += {Name: 'Inertial Measurement Unit', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2c47fa6c-83f5-598b-ba51-79dbe786115c', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Angular rate and acceleration sensing.', TechnologyType: 'MEMS gyro and accelerometer triad'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1.1_1'})
SET n += {Name: 'Estimate Attitude', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2ea84770-783a-5aa4-8dfb-917c3b4b5831', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fuse star tracker and IMU data into an attitude estimate.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1.1_2'})
SET n += {Name: 'Command Reaction Wheels', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2f7c8de6-bd49-5233-b7dc-aeadcbaaa330', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Convert attitude error into wheel torque commands.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.1.1_1'})
SET n += {Name: 'Wheel Command Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd9df6c57-4026-5719-95a6-ac71f6f20e21', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Torque command and wheel-speed telemetry interface.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.1.1_1'})
SET n += {Name: 'Attitude Knowledge', Baseline: 'None', Orphan: true, Barren: false, uuid: 'c209bfb9-7b65-5368-b67d-370be9d6bcc7', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The ADCS SHALL determine spacecraft attitude to within 0.01 degrees per axis.', VMethod: 'Analysis', VStatement: 'Sensor fusion error budget analysis.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.1.1.1_0'})
SET n += {Name: 'Reaction Wheel Assembly', uuid: '024f248b-39bd-5e59-973d-390564551f48', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Generates control torque by exchanging momentum.', MissionAction: 'generate commanded control torque', MissionMeans: 'four skewed brushless momentum wheels', MissionContribution: 'ADCS fine pointing authority'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.1.1.1_1'})
SET n += {Name: 'Torque Generation', uuid: 'd56b4d59-85d8-5d37-b499-f9a43c0bf7e7', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver smooth commanded torque to the spacecraft.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.1.1.1_1'})
SET n += {Name: 'Wheel Operating Environment', uuid: '2873c4f5-1e3e-5fe5-b042-c53c408d0d13', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Vacuum bearing operation across wheel speed range.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1.1.1_1'})
SET n += {Name: 'Spun Down', TransitionKind: 'FUNCTIONAL', uuid: '7c09ae15-72dd-5677-bbad-fbd8f12da230', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.1.1.1_2'})
SET n += {Name: 'Spinning', TransitionKind: 'FUNCTIONAL', uuid: '585280d2-c401-51e6-8045-5669f65fc681', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1.1.1_1'})
SET n += {Name: 'Wheel Modules', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '78203d63-6eee-5b2e-a4a0-a21bed46c537', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Four skewed momentum wheel units.', TechnologyType: 'Brushless DC wheel with vacuum bearings'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.1.1.1_2'})
SET n += {Name: 'Wheel Drive Electronics', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4731544d-721c-551a-a575-fc8f027b51a5', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Motor drive and wheel-speed telemetry board.', TechnologyType: 'Motor controller electronics'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.1.1.1_1'})
SET n += {Name: 'Exchange Momentum', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a40e35f1-dd6a-53be-a36d-c2ed241f20c4', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Accelerate wheels to torque the spacecraft body.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.1.1.1_1'})
SET n += {Name: 'Wheel Drive Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '143ac0a5-2207-5393-9132-983de93d4da6', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Drive electronics command and telemetry port.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.1.1.1_1'})
SET n += {Name: 'Wheel Torque Authority', Baseline: 'None', Orphan: true, Barren: true, uuid: 'c2976890-b3a3-5192-98c2-047e110b0316', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Reaction Wheel Assembly SHALL deliver at least 20 mNm of torque per axis.', VMethod: 'Test', VStatement: 'Dynamometer torque measurement per wheel.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2_0'})
SET n += {Name: 'Fire Detection Payload', uuid: 'a995a7f6-12a8-56e3-be8c-a1c918a1904d', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Senses, classifies, and reports forest fires.', MissionAction: 'detect and classify forest fires in the imaged swath', MissionMeans: 'a mid-wave infrared sensor, detection processor, and downlink', MissionContribution: 'satellite detection performance'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2_1'})
SET n += {Name: 'Fire Sensing And Reporting', uuid: 'a3b3bd2c-9604-5fe8-86c8-655563abd27f', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Turn infrared radiance into geolocated fire reports.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2_1'})
SET n += {Name: 'Payload Operating Environment', uuid: 'a7a3e41c-51e9-5ffe-af44-87f99f5dbdc3', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Cryogenic sensor operation on a thermally stable platform.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2_1'})
SET n += {Name: 'Standby', TransitionKind: 'FUNCTIONAL', uuid: 'c3e95f7f-0d93-5364-a8d8-9793cca55d77', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2_2'})
SET n += {Name: 'Imaging', TransitionKind: 'FUNCTIONAL', uuid: 'a7d63fc2-8d1d-5233-9457-6744a5c824ad', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sensor scanning with detection processing active.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2_1'})
SET n += {Name: 'IR Sensor Assembly', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '53d5446c-1a50-515f-bef6-34b471e4f8e7', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Optics, focal plane, and cooling for infrared sensing.', TechnologyType: 'Cryocooled mid-wave infrared scanner'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2_2'})
SET n += {Name: 'Payload Communications Unit', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a0af3f3d-ec27-50e4-a07c-13cc1b6d66d0', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Encrypts and transmits detection reports to ground.', TechnologyType: 'Ka-band transmitter with IPSec crypto module'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2_3'})
SET n += {Name: 'Payload Processor', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9a4bcf4f-0c53-5bf5-9de0-caf7b6992905', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'On-board fire classification and report generation computer.', TechnologyType: 'Radiation-tolerant payload computer'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2_1'})
SET n += {Name: 'Collect Infrared Radiance', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6476efa3-d174-50cb-9004-81d5e9152411', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Gather scene radiance through the sensor chain.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2_2'})
SET n += {Name: 'Classify Fire Detections', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '179ef93c-0bf9-5a3d-a4d9-f1d5a7e0a984', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Score thermal anomalies as fire or non-fire on board.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2_3'})
SET n += {Name: 'Format And Queue Detection Reports', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c5f57b27-d98e-5b65-8e92-3b14a657218b', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Build geolocated detection messages for downlink.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_1.1.2_1'})
SET n += {Name: 'Sensor Video Link', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '7d4b9012-2420-5d7b-b3eb-cee3954290ed', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'LVDS pixel video from signal chain to payload processor.', Connection_Description: 'Moves digitized sensor video into detection processing.', ConnectionType: 'On-board sensor link', OSILayer: 1, Protocol: 'LVDS pixel video', Directionality: 'Unidirectional', TimingClass: 'Real-time', PayloadDescription: 'Digitized infrared pixel video stream.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2_1'})
SET n += {Name: 'Sensor Video Input Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '44a800a3-6022-57c9-af46-8859b82a836e', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Digital video input from the IR sensor assembly.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2_2'})
SET n += {Name: 'Payload Downlink Feed Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a4277db6-d1bb-52ba-a0af-ffb71e4a552a', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Detection report hand-off into the payload comms unit.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2_1'})
SET n += {Name: 'Payload Detection Chain', Baseline: 'None', Orphan: true, Barren: false, uuid: 'fdcd4fef-221e-5243-9129-d07c7ec4353e', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Fire Detection Payload SHALL classify thermal anomalies as fire or non-fire before downlink.', VMethod: 'Demonstration', VStatement: 'Replay of recorded scenes through the flight chain.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2_2'})
SET n += {Name: 'Payload Geolocation', Baseline: 'None', Orphan: true, Barren: true, uuid: 'dfb3e3f4-e05e-5044-8f93-7ad610f10e15', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Fire Detection Payload SHALL geolocate each detection to within 500 meters.', VMethod: 'Test', VStatement: 'Detection of surveyed ground calibration targets.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.1_0'})
SET n += {Name: 'IR Sensor Assembly', uuid: '21e6927e-67b1-5be0-bddd-74fc3939fd39', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Converts scene radiance into digitized pixel video.', MissionAction: 'measure mid-wave infrared scene radiance', MissionMeans: 'telescope optics, a cooled focal plane, and readout', MissionContribution: 'payload detection sensitivity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.1_1'})
SET n += {Name: 'Radiance Measurement', uuid: 'bc73ce6b-a8f7-5d43-9205-390e54a2ee24', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver calibrated pixel video of the imaged swath.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.1_1'})
SET n += {Name: 'Sensor Operating Environment', uuid: '93a9d557-9f9d-5eef-84e9-f259063eb9bd', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Cryogenic focal plane behind passively cooled optics.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1_1'})
SET n += {Name: 'Warm', TransitionKind: 'FUNCTIONAL', uuid: '05760911-200b-5f10-b6a2-230414242b7b', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1_2'})
SET n += {Name: 'Cooled', TransitionKind: 'FUNCTIONAL', uuid: 'ea7b0694-2ae4-5a1d-b699-2d2d97a8d421', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Focal plane at operating temperature.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1_1'})
SET n += {Name: 'Telescope Optics', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '75ea3b04-5646-5292-8931-c5258813fcaa', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fore-optics forming the swath image.', TechnologyType: 'Reflective telescope assembly'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1_2'})
SET n += {Name: 'Focal Plane Unit', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '768b5546-2447-520f-a65c-8087d5df32dc', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Cooled detector array with proximity electronics.', TechnologyType: 'Cryocooled focal plane module'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1_3'})
SET n += {Name: 'Cryocooler', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '49d11221-439a-51c0-b5fc-3a98a377ec3d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Closed-cycle cooler holding the focal plane at 80 K.', TechnologyType: 'Pulse-tube cryocooler'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1_1'})
SET n += {Name: 'Form Scene Image', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '884b0895-947c-5768-b6db-dc472dda4316', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Focus scene radiance onto the focal plane.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1_2'})
SET n += {Name: 'Read Out Pixel Video', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '48ee549b-8467-551b-80da-bd021356c431', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Convert focal plane charge into digitized video.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.1_1'})
SET n += {Name: 'Sensor Video Output Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c347ec41-cedb-5968-b79a-765dcac71d0f', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Digitized pixel video output toward the processor.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.1_1'})
SET n += {Name: 'Sensor Radiance Measurement', Baseline: 'None', Orphan: true, Barren: false, uuid: 'b7444d8c-469e-5a17-9a5a-5d32c7fda7d3', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The IR Sensor Assembly SHALL measure mid-wave infrared radiance across the full imaged swath.', VMethod: 'Test', VStatement: 'Radiometric calibration against a blackbody source.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.1.2_0'})
SET n += {Name: 'Focal Plane Unit', uuid: 'effb8200-5550-57f2-b454-6703a77aca25', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Senses infrared photons at cryogenic temperature.', MissionAction: 'convert scene photons into readable pixel signals', MissionMeans: 'a cooled detector array and its readout electronics', MissionContribution: 'sensor radiometric sensitivity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.1.2_1'})
SET n += {Name: 'Photon Sensing', uuid: '26fcc433-a3ea-5042-9251-d84d3ac2730e', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Produce low-noise pixel signals from scene photons.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.1.2_1'})
SET n += {Name: 'Cryogenic Environment', uuid: '0ed2f93b-5a73-5309-9396-efab90ca01ad', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Focal plane held at 80 K by the cryocooler.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2_1'})
SET n += {Name: 'Unpowered', TransitionKind: 'FUNCTIONAL', uuid: '5220d753-6439-576e-a1a0-47c8c357c9ec', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2_2'})
SET n += {Name: 'Sensing', TransitionKind: 'FUNCTIONAL', uuid: '73df0d7b-a92e-5cdf-ad5f-af35c7d6cd13', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2_1'})
SET n += {Name: 'Detector Array', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '0bcbb428-7ca7-5599-a58e-9ae0b5307951', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Mid-wave infrared photodetector matrix.', TechnologyType: 'MCT photodiode array'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2_2'})
SET n += {Name: 'FPA Thermal Strap', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'fe0c89f2-d3cf-5e4f-b2af-dcd8510850a6', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Conductive link from array to cryocooler cold tip.', TechnologyType: 'Flexible copper thermal strap'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2_3'})
SET n += {Name: 'FPA Control Board', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '572ed7fd-eb10-5742-a6a5-a75b736e0dcb', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bias sequencing and temperature telemetry board.', TechnologyType: 'Mixed-signal control board'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2_1'})
SET n += {Name: 'Sense Infrared Photons', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'db360b45-fe8b-54e1-93ab-a4f3fdcbf40f', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Integrate photon flux as pixel charge.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2_2'})
SET n += {Name: 'Regulate Focal Plane Temperature', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '54495b31-37a9-5b1d-8561-816267e1649d', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hold the array at its cryogenic setpoint.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.1.2_1'})
SET n += {Name: 'FPU Video Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '69aa10c1-a8cc-538b-b7b4-b53b468c28c5', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Pixel signal output toward the readout chain.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.1.2_1'})
SET n += {Name: 'Focal Plane Sensitivity', Baseline: 'None', Orphan: true, Barren: false, uuid: '72cdfbba-fa45-586d-b395-b5cec7c0bf1b', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Focal Plane Unit SHALL resolve scene temperature differences of 2 K or better.', VMethod: 'Test', VStatement: 'NEDT measurement at operating temperature.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.1.2.1_0'})
SET n += {Name: 'Detector Array', uuid: 'c47ea053-3c3e-5e8e-9f76-82f4389d64ec', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Photodiode matrix with multiplexing readout.', MissionAction: 'convert photons to calibrated pixel charge', MissionMeans: 'a photodiode matrix read through a multiplexer', MissionContribution: 'focal plane sensitivity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.1.2.1_1'})
SET n += {Name: 'Photocurrent Generation', uuid: 'de206d44-5e87-5cac-a14f-3329bb09c2c3', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Produce pixel charge proportional to radiance.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.1.2.1_1'})
SET n += {Name: 'Array Environment', uuid: '8a4dd038-0c4d-589e-95ec-bfbf906f227b', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Cryogenic operation bonded to the readout circuit.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1_1'})
SET n += {Name: 'Unbiased', TransitionKind: 'FUNCTIONAL', uuid: '453796c1-9171-5484-8265-134c051fe9a7', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1_2'})
SET n += {Name: 'Integrating', TransitionKind: 'FUNCTIONAL', uuid: 'eb2ab4b5-49b6-5c94-a314-f3f06bd53d9d', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1_1'})
SET n += {Name: 'Readout Electronics', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '75340608-64d8-5179-b81e-308a9eddec2d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Amplifies and digitizes the pixel outputs.', TechnologyType: 'Readout integrated circuit with video board'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1_2'})
SET n += {Name: 'Detector Substrate', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2d21898f-5bba-5e86-be1e-d1d19368f7b4', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Photodiode matrix die and carrier.', TechnologyType: 'MCT photodiode die'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2.1_1'})
SET n += {Name: 'Accumulate Pixel Charge', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9414bdcf-1900-5ca9-8132-43f2e406e24d', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Integrate photocurrent per pixel per frame.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2.1_2'})
SET n += {Name: 'Multiplex Pixel Outputs', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f80ff666-d315-5ca6-9451-a8d15851a81e', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sequence pixel charge onto output taps.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.1.2.1_1'})
SET n += {Name: 'Array Output Tap Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6d18a7c1-eba5-5711-89af-97951f919ae1', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Analog output taps toward readout electronics.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.1.2.1_1'})
SET n += {Name: 'Array Responsivity', Baseline: 'None', Orphan: true, Barren: false, uuid: '5a6d0be9-c606-5a4c-bf38-3600d1a77f75', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Detector Array SHALL convert incident infrared photons to pixel charge with calibrated responsivity.', VMethod: 'Test', VStatement: 'Per-pixel responsivity map under flood illumination.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.1.2.1.1_0'})
SET n += {Name: 'Readout Electronics', uuid: 'b616c8ed-498c-5f81-9145-e0543e11239a', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Turns analog pixel taps into a digital stream.', MissionAction: 'digitize every pixel of every frame', MissionMeans: 'a signal processing chain with stable biasing', MissionContribution: 'array signal integrity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Pixel Digitization', uuid: 'a94bb7da-7d81-577a-94d1-e888a17c0d3f', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver a lossless digital pixel stream.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Readout Environment', uuid: '1c453897-cc87-5d55-aa33-b534683b8ee6', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Low-noise analog electronics beside the cold array.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Held', TransitionKind: 'FUNCTIONAL', uuid: 'c937d3ce-a8c6-540e-839f-26bd7f911c72', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1.1_2'})
SET n += {Name: 'Streaming', TransitionKind: 'FUNCTIONAL', uuid: '32ef43eb-dc1d-5b5b-b30a-de7fa47e6453', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Signal Processing Chain', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4a324f90-3c6e-5344-832e-7e84ff251cd1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Analog conditioning and encoding chain.', TechnologyType: 'Preamplifier, video ADC, serializer chain'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1.1_2'})
SET n += {Name: 'Bias Regulator', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd0875369-a7e4-5023-99fd-ab2d053c62d4', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Precision detector bias supply.', TechnologyType: 'Precision voltage reference'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Digitize Pixel Video', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd6579b32-eebe-514c-90c8-9e61e4d0bdcf', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sample and convert each pixel tap.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Readout Video Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '522bec17-5b46-56b7-9dfa-4ae7c2b94e80', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Digital video output of the readout chain.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.1.2.1.1_1'})
SET n += {Name: 'Lossless Digitization', Baseline: 'None', Orphan: true, Barren: false, uuid: 'dce0a164-1a82-5d77-8386-ae4b7b11262a', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Readout Electronics SHALL digitize every pixel of every frame without loss.', VMethod: 'Test', VStatement: 'Frame counter audit over a soak run.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.1.2.1.1.1_0'})
SET n += {Name: 'Signal Processing Chain', uuid: 'ab67d854-23f8-5f43-a0ff-388339deefef', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Conditions, converts, and encodes pixel video.', MissionAction: 'condition and encode the pixel video stream', MissionMeans: 'a preamplifier, video ADC, and output serializer', MissionContribution: 'readout digitization fidelity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Video Conditioning', uuid: '860dcf4a-7712-5ed6-8b44-d057b6bff3fe', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver encoded digital video to the payload.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Signal Chain Environment', uuid: '1aa8eaf4-209b-5f83-acb9-98d7ebe01541', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Shielded analog signal path with a clean clock tree.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Muted', TransitionKind: 'FUNCTIONAL', uuid: 'b042cea3-f422-5ce5-b279-daf5c7599b4d', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.1.2.1.1.1_2'})
SET n += {Name: 'Encoding', TransitionKind: 'FUNCTIONAL', uuid: 'b6ce78f0-4c18-5582-a4b7-79a5a5f5edac', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Preamplifier', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '27cdf948-3be9-5d64-bf84-3c60368698dc', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Low-noise analog front end.', TechnologyType: 'Low-noise amplifier stage'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1.1.1_2'})
SET n += {Name: 'Video ADC', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '63bc9eaf-269c-5a4f-9afc-edc8ed1e37d9', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: '14-bit video analog-to-digital converter.', TechnologyType: 'Video ADC'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.1.2.1.1.1_3'})
SET n += {Name: 'Output Serializer', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c9e2cf4c-a199-5ea1-84cf-9e500a3c85d3', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'LVDS output driver and framer.', TechnologyType: 'LVDS serializer'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Condition Analog Signal', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'fcfffaee-2a5a-52db-a6b2-f2e477347c97', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Amplify and filter each pixel tap.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.1.2.1.1.1_2'})
SET n += {Name: 'Encode Digital Stream', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9df5a2da-f7a9-5a59-b8be-ab5e2ea3c2b9', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Convert and serialize pixel samples.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Chain Video Output Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f83f8e4a-ae5b-5d5f-8b0e-3df1cee58ce7', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'LVDS video output joining the sensor video link.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.1.2.1.1.1_1'})
SET n += {Name: 'Chain Encoding Fidelity', Baseline: 'None', Orphan: true, Barren: true, uuid: '3b58d826-4806-57b1-848c-5b038f1c93fd', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.1.2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Signal Processing Chain SHALL condition and encode the pixel video stream for transfer to the payload processor without adding more than one count of noise.', VMethod: 'Test', VStatement: 'Noise floor measurement with shorted input.'};
MERGE (n:SSTPA:System {HID: 'SYS_1.1.2.2_0'})
SET n += {Name: 'Payload Communications Unit', uuid: 'f7d171e1-d5a3-58c0-aba8-3dedcc050291', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Secure Ka-band downlink chain for detection reports.', MissionAction: 'deliver detection reports securely to the ground station', MissionMeans: 'an IPSec crypto module feeding a Ka-band transmitter', MissionContribution: 'space segment reporting timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_1.1.2.2_1'})
SET n += {Name: 'Secure Detection Downlink', uuid: 'aedf0007-f49a-50e3-bb8f-74e10b6d4661', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Encrypt and radiate detection reports each pass.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_1.1.2.2_1'})
SET n += {Name: 'Downlink RF Environment', uuid: 'cea1b206-89d0-5c81-a704-2660bb6166be', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Ka-band space-to-ground path through gimbaled antenna.'};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.2_1'})
SET n += {Name: 'Radio Silent', TransitionKind: 'FUNCTIONAL', uuid: '4969ea26-ad4b-5f63-b15b-215dc3f8fdd3', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_1.1.2.2_2'})
SET n += {Name: 'Transmitting', TransitionKind: 'FUNCTIONAL', uuid: '44a8bcca-064e-5d4e-8e04-3f1ef970e043', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.2_1'})
SET n += {Name: 'Ka-Band Transmitter', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1ba7ab39-f12f-5b1e-8648-6faad49cdb4f', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Downlink modulator and power amplifier.', TechnologyType: 'Ka-band transmitter'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.2_2'})
SET n += {Name: 'Crypto Module', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2c6a113a-3d61-5f7b-82a2-f832ef8578d8', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'IPSec encryption endpoint for detection traffic.', TechnologyType: 'Embedded IPSec crypto module'};
MERGE (n:SSTPA:Component {HID: 'EL_1.1.2.2_3'})
SET n += {Name: 'Antenna Gimbal', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4de73211-8529-5450-b9b2-8adcfdbe44ac', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Two-axis gimbal pointing the downlink antenna.', TechnologyType: 'Two-axis antenna gimbal'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.2_1'})
SET n += {Name: 'Encrypt Detection Traffic', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f2974033-a892-5401-a2e8-4c908db2e816', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Wrap detection reports in IPSec before transmission.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_1.1.2.2_2'})
SET n += {Name: 'Transmit Downlink Carrier', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '15bb2527-8695-5f9c-8457-4b1c5d099398', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Modulate and radiate the Ka-band downlink.'};
MERGE (n:SSTPA:Interface {HID: 'INT_1.1.2.2_1'})
SET n += {Name: 'IPSec Downlink Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1cdceef7-978a-5060-a615-8070c04fd2d7', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Payload-side IPSec endpoint of the Detection Downlink to the Command Segment ground station receiver.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.2_1'})
SET n += {Name: 'Downlink Traffic Protection', Baseline: 'None', Orphan: false, Barren: true, uuid: '592ad63a-13d4-5c64-9773-876e5943baf3', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The IPSec Downlink Interface SHALL encrypt all detection reports prior to transmission.', VMethod: 'Test', VStatement: 'RF capture shows no plaintext report fields.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_1.1.2.2_2'})
SET n += {Name: 'Downlink Throughput', Baseline: 'None', Orphan: true, Barren: true, uuid: '13ee9690-daa1-5e25-9b8e-bd2a2a7723a6', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '1.1.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Payload Communications Unit SHALL downlink a full pass detection backlog within one ground station contact.', VMethod: 'Analysis', VStatement: 'Link budget and backlog timing analysis.'};
MERGE (n:SSTPA:System {HID: 'SYS_2_0'})
SET n += {Name: 'Command Segment', uuid: '24cc7255-d588-5eb4-86d8-5012cec2c92b', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'National command center directing forest-fire response.', LongDescription: 'The FireSat Command Segment receives satellite fire detections at its ground station, fuses them with watch station reports, and directs aviation and ground firefighting activities over dedicated tasking and coordination networks.', MissionAction: 'direct forest firefighting activities nationwide', MissionMeans: 'a satellite ground station, a fused fire operating picture, and tasking networks to aviation and ground assets', MissionContribution: 'the FireSat suppression direction timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2_1'})
SET n += {Name: 'Fire Response Direction', uuid: 'ec182a4e-9c7a-5090-953d-91e34b5ac7cf', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Turn detections into directed suppression action.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2_1'})
SET n += {Name: 'National Operations Environment', uuid: '94b7f629-159b-5e65-b4eb-0a3412cff041', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Hardened operations facility with satellite ground station, SATCOM, land mobile radio, and terrestrial network connectivity.'};
MERGE (n:SSTPA:State {HID: 'ST_2_1'})
SET n += {Name: 'Off', TransitionKind: 'FUNCTIONAL', uuid: '4a606601-b9fc-57bc-82fd-23e0ea42c590', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2_2'})
SET n += {Name: 'Watch', TransitionKind: 'FUNCTIONAL', uuid: '1454da52-68d5-5f5a-aa56-4f2241946eab', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Routine fire-season watch operations.', StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_2_3'})
SET n += {Name: 'Surge', TransitionKind: 'FUNCTIONAL', uuid: '327baa37-b5d2-53ee-b136-40375cdd8349', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Multi-incident surge operations with full staffing.', StateSequence: 2};
MERGE (n:SSTPA:State {HID: 'ST_2_4'})
SET n += {Name: 'Degraded', TransitionKind: 'FUNCTIONAL', uuid: 'c722910a-1e34-5f39-b0d6-c280dfc17bb1', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Backup power and reduced communications operations.', StateSequence: 3};
MERGE (n:SSTPA:Component {HID: 'EL_2_1'})
SET n += {Name: 'Ground Station', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4079c036-eab3-54ea-8673-db96c0f93985', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Satellite receive and command site serving the constellation.', TechnologyType: 'Ka/S-band satellite ground station', DeploymentContext: 'Fixed site adjacent to the operations center'};
MERGE (n:SSTPA:Component {HID: 'EL_2_2'})
SET n += {Name: 'Operations Center', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f3c95f86-f486-55fe-8a93-6e2c9f64b4e5', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Watch floor and processing systems directing fire response.', TechnologyType: '24/7 operations facility', DeploymentContext: 'Hardened national facility'};
MERGE (n:SSTPA:Component {HID: 'EL_2_3'})
SET n += {Name: 'Backup Power Plant', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6cd45b8b-29fc-57d5-a668-21ab1e60a6d0', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Generators and UPS carrying the segment through outages.', TechnologyType: 'Diesel generators with UPS bridge'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2_1'})
SET n += {Name: 'Receive Satellite Detections', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '36b945ba-a477-5801-b331-f5ebe7efcd29', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Capture and decrypt detection reports from the Space Segment.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2_2'})
SET n += {Name: 'Fuse Fire Operating Picture', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '8d4f8e44-b2de-5831-b19e-594f2850a1e1', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Merge satellite, watch station, and aviation reports.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2_3'})
SET n += {Name: 'Task Aviation Assets', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6b744df3-6866-5559-8d8e-2a49d33e2acc', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Issue drop and jump tasking to the Aviation Segment.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2_4'})
SET n += {Name: 'Direct Ground Response', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3a438258-37f1-5a43-ba88-5be55809d8dd', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Coordinate watch stations and vehicle crews on the ground net.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2_5'})
SET n += {Name: 'Coordinate Response Logistics', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e7ed8fc6-6622-5828-afc8-8efcb4aea5a0', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 5, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Match vehicle fleet logistics to active incidents.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_2_1'})
SET n += {Name: 'Aviation Tasking Link', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '78c06333-6179-5d1d-adf7-18c843827763', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'SATCOM channel carrying drop and jump tasking.', Connection_Description: 'Primary tasking path from the command center to airborne and based aviation assets.', ConnectionType: 'SATCOM data link', OSILayer: 7, Protocol: 'Tasking messages over SATCOM IP', Directionality: 'Bidirectional', TimingClass: 'Near-real-time', SecurityClass: 'Encrypted', PayloadDescription: 'Air tasking orders, drop clearances, aircraft status reports.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2_1'})
SET n += {Name: 'Tasking Delivery', Baseline: 'None', Orphan: false, Barren: false, uuid: '724c071d-9deb-590f-a753-4a6f9f532728', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Aviation Tasking Link SHALL deliver a tasking message to an airborne asset within 60 seconds of release.', VMethod: 'Test', VStatement: 'Timed tasking messages during a flight exercise.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_2_2'})
SET n += {Name: 'Ground Coordination Network', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ca918c7a-da38-574e-8835-5af4cbef85bd', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'P25 land mobile radio net for ground response direction.', Connection_Description: 'Voice and low-rate data coordination among the command center, watch stations, and vehicle crews.', ConnectionType: 'Land mobile radio network', OSILayer: 7, Protocol: 'APCO P25 trunked voice and data', Directionality: 'Multicast', TimingClass: 'Real-time voice', SecurityClass: 'AES voice encryption', PayloadDescription: 'Tactical voice, unit status, and short data messages.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_2_3'})
SET n += {Name: 'Logistics Coordination Link', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4c4dfdeb-5c5f-524f-992d-8de1e425dbb5', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Data link matching fleet logistics to active incidents.', Connection_Description: 'Sustains fuel, water, and crew resupply during incidents.', ConnectionType: 'Terrestrial data link', OSILayer: 7, Protocol: 'HTTPS over LTE with satellite backup', Directionality: 'Bidirectional', TimingClass: 'Transactional', SecurityClass: 'TLS', PayloadDescription: 'Resupply requests, fleet positions, incident logistics status.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2_1'})
SET n += {Name: 'Satellite Downlink Receive Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '56f63694-a0b9-5b58-88cf-18c4ac36e19c', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level receive endpoint of the Detection Downlink.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2_2'})
SET n += {Name: 'Aviation Tasking Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '32292e8e-e4b6-5017-913d-fcfbd79a798a', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'SATCOM tasking channel to the Aviation Segment.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2_3'})
SET n += {Name: 'Ground Coordination Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'df8988be-1c8e-5373-ac76-309e2bac0be4', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'P25 land mobile radio net control station.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2_4'})
SET n += {Name: 'Logistics Coordination Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9193ecca-f529-5130-b9de-dd2bd06e96c0', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Data channel for vehicle fleet logistics coordination.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2_5'})
SET n += {Name: 'Watch Station Backhaul Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '13da7a32-4d93-525b-b7b0-14a3d293a69b', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 5, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Terminating point of the forest watch station backhaul.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2_2'})
SET n += {Name: 'Command Detection Receipt', Baseline: 'None', Orphan: true, Barren: false, uuid: '69a82b79-c81d-5f25-9a9c-5c2bf65b7c71', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Command Segment SHALL receive, decrypt, and display each satellite detection within 2 minutes of ground station reception.', VMethod: 'Test', VStatement: 'Timed injection of recorded downlink passes.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2_3'})
SET n += {Name: 'Command Tasking Timeline', Baseline: 'None', Orphan: true, Barren: false, uuid: '5b3c60f6-0569-5c5c-b69f-153035b7537f', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Command Segment SHALL issue aviation and ground tasking within 15 minutes of detection confirmation.', VMethod: 'Demonstration', VStatement: 'Command post exercise against scripted detections.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2_4'})
SET n += {Name: 'Command Continuity', Baseline: 'None', Orphan: true, Barren: false, uuid: '7e0f0d43-59d3-5b69-801a-2f9b1b8755e8', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Command Segment SHALL continue watch operations on backup power for at least 72 hours.', VMethod: 'Demonstration', VStatement: 'Facility endurance run on generator power.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.1_0'})
SET n += {Name: 'Ground Station', uuid: '41980fbd-6423-56a5-baf3-f0aea65aedb0', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Receives detection downlinks and commands the constellation.', MissionAction: 'exchange mission and TT&C traffic with the constellation', MissionMeans: 'tracking antennas, receive chains, and an uplink exciter', MissionContribution: 'command detection receipt timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.1_1'})
SET n += {Name: 'Space-Ground Gateway', uuid: '52a1d66a-f4bd-5654-9b22-097246df329d', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Terminate the space-ground links for the capability.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.1_1'})
SET n += {Name: 'Ground Station RF Environment', uuid: 'b086b399-50d7-57fe-a7c8-5acf99273961', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Licensed Ka/S-band site with clear horizon masks.'};
MERGE (n:SSTPA:State {HID: 'ST_2.1_1'})
SET n += {Name: 'Idle', TransitionKind: 'FUNCTIONAL', uuid: 'bcfb0474-b0d9-520c-8742-52db6696d502', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.1_2'})
SET n += {Name: 'Tracking', TransitionKind: 'FUNCTIONAL', uuid: 'dc49bb08-9866-521c-9b30-c4b198fcb72d', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Antenna tracking a satellite pass.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.1_1'})
SET n += {Name: 'Satellite Receiver', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1094e88e-786f-5e8b-89ae-d2a68060dc0d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ka-band receive chain from antenna to decrypted frames.', TechnologyType: 'Ka-band receive chain with IPSec gateway'};
MERGE (n:SSTPA:Component {HID: 'EL_2.1_2'})
SET n += {Name: 'Uplink Exciter', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd3fa62d5-2cfe-5b2f-a609-c3e29352c1d8', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'S-band command uplink modulator and power amplifier.', TechnologyType: 'S-band exciter and SSPA'};
MERGE (n:SSTPA:Component {HID: 'EL_2.1_3'})
SET n += {Name: 'Station Network', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2850a149-9765-56e0-930a-81dbae8a68a7', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ground station LAN and timing distribution.', TechnologyType: 'Redundant site LAN with GPS timing'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1_1'})
SET n += {Name: 'Track Satellite Passes', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'b62b2ed8-aa94-5d3c-8c20-42a60daaf0a0', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Point antennas along scheduled pass geometry.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1_2'})
SET n += {Name: 'Receive And Decrypt Downlink', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '07865954-32aa-5738-a26c-f290b2320fda', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Demodulate and decrypt detection downlink traffic.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1_3'})
SET n += {Name: 'Uplink Spacecraft Commands', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '51602a5b-3e9b-50e8-95f2-06b07476d6cd', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Radiate authenticated TT&C uplink carriers.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.1_1'})
SET n += {Name: 'TT&C Ground Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f9c1c2ac-411c-55ed-812f-b6ec00d2d017', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ground-side endpoint of the S-band TT&C link.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.1_2'})
SET n += {Name: 'Station LAN Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '80e58a54-c8c0-5729-8042-25becaf0fa78', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Decrypted detection feed into the operations center.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.1_1'})
SET n += {Name: 'Pass Capture Rate', Baseline: 'None', Orphan: true, Barren: false, uuid: '010b3037-314a-5fcb-9a0a-f5581d2ae254', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Ground Station SHALL successfully capture at least 98 percent of scheduled satellite passes.', VMethod: 'Analysis', VStatement: 'Pass log statistics over one fire season.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.1.1_0'})
SET n += {Name: 'Satellite Receiver', uuid: '4af55f6c-1c5f-5c2f-bcea-b253ec0bdff4', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Receives, demodulates, and decrypts the detection downlink.', MissionAction: 'recover detection reports from the downlink carrier', MissionMeans: 'a tracking antenna, RF front end, and demodulator-crypto chain', MissionContribution: 'ground station pass capture performance'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.1.1_1'})
SET n += {Name: 'Downlink Recovery', uuid: '1223651b-31d3-5a7f-a456-6394fe73ebf6', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver decrypted detection frames to the station LAN.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.1.1_1'})
SET n += {Name: 'Receive Chain Environment', uuid: '78eff1ef-2455-5555-a32e-ff8163722630', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Low-noise RF path from feed to demodulator in a shielded rack.'};
MERGE (n:SSTPA:State {HID: 'ST_2.1.1_1'})
SET n += {Name: 'Standby', TransitionKind: 'FUNCTIONAL', uuid: 'ab03066a-8270-56a0-8ecc-6abfd6727f75', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.1.1_2'})
SET n += {Name: 'Receiving', TransitionKind: 'FUNCTIONAL', uuid: '60283dae-bb2e-503f-ba1a-2092c39bf42b', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.1.1_1'})
SET n += {Name: 'RF Front End', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e5afc650-2f80-5200-924f-8c31530e5037', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Low-noise amplification and downconversion stage.', TechnologyType: 'Cryogenic LNA and block downconverter'};
MERGE (n:SSTPA:Component {HID: 'EL_2.1.1_2'})
SET n += {Name: 'Tracking Antenna', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '62ba117f-f2e2-5fd1-9991-44e9917a0e3d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Full-motion Ka/S-band reflector antenna.', TechnologyType: '7-meter tracking reflector'};
MERGE (n:SSTPA:Component {HID: 'EL_2.1.1_3'})
SET n += {Name: 'Demodulator And Crypto Gateway', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '23d9047e-88ce-5dbb-8454-23501fe565d5', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'CCSDS demodulator with IPSec decryption gateway.', TechnologyType: 'Software demodulator with IPSec gateway'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1.1_1'})
SET n += {Name: 'Amplify And Downconvert Carrier', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'fb6e3980-31b6-5f9d-b4ae-25dccf301999', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Recover an IF signal from the Ka-band carrier.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1.1_2'})
SET n += {Name: 'Demodulate And Decrypt Frames', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9c375ad1-59be-5ab5-ae56-a913b46daa86', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Recover and decrypt CCSDS frames from the IF signal.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.1.1_1'})
SET n += {Name: 'IPSec Ground Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd6e25c08-7672-5b39-b3a1-0f411b2bb3c5', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ground-side IPSec endpoint of the Detection Downlink, peer of the satellite payload IPSec Downlink Interface.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.1.1_1'})
SET n += {Name: 'Ground Decryption', Baseline: 'None', Orphan: false, Barren: true, uuid: '44194b07-ddb3-5c25-abe7-486dab342d4a', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The IPSec Ground Interface SHALL decrypt detection traffic only with current mission keys.', VMethod: 'Test', VStatement: 'Key rollover test across a live pass.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.1.1_2'})
SET n += {Name: 'Receiver Sensitivity', Baseline: 'None', Orphan: true, Barren: false, uuid: 'f4b72ef3-eabd-5420-96fa-e5eec52d58e3', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Satellite Receiver SHALL close the downlink at the minimum specified elevation angle.', VMethod: 'Test', VStatement: 'Link margin measurement at horizon-mask elevation.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.1.1.1_0'})
SET n += {Name: 'RF Front End', uuid: '91e99df4-2d87-5f8f-91df-9580d5b58f46', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sets the receive chain noise floor.', MissionAction: 'amplify the downlink carrier with minimum added noise', MissionMeans: 'a low-noise amplifier and block downconverter', MissionContribution: 'satellite receiver sensitivity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.1.1.1_1'})
SET n += {Name: 'Low-Noise Reception', uuid: '6101ad9c-07c2-577b-b9e0-a510a3991a9e', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Preserve downlink signal-to-noise into the demodulator.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.1.1.1_1'})
SET n += {Name: 'Front End Environment', uuid: 'a3e298e3-5408-5a27-b5ab-7abd0cf6e7dc', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Feed-mounted electronics exposed to site weather.'};
MERGE (n:SSTPA:State {HID: 'ST_2.1.1.1_1'})
SET n += {Name: 'Cold Standby', TransitionKind: 'FUNCTIONAL', uuid: '0f156ea7-2daf-56bb-a633-d5d3ecc5dc3b', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.1.1.1_2'})
SET n += {Name: 'Active', TransitionKind: 'FUNCTIONAL', uuid: 'dbd06331-f10c-5f16-966e-56dc35e2c6f2', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.1.1.1_1'})
SET n += {Name: 'Low-Noise Amplifier', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '59420df4-960c-5720-84d6-b6f698d8d327', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Feed-mounted first amplification stage.', TechnologyType: 'Ka-band LNA'};
MERGE (n:SSTPA:Component {HID: 'EL_2.1.1.1_2'})
SET n += {Name: 'Block Downconverter', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '303022ef-dd3f-52ef-b524-8ff23b33e71f', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ka-band to IF frequency translation.', TechnologyType: 'Block downconverter'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1.1.1_1'})
SET n += {Name: 'Amplify At Low Noise', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '88ebc77f-8757-556f-a5e4-61227624ed5e', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Amplify the received carrier at the feed point.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.1.1.1_2'})
SET n += {Name: 'Downconvert To IF', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a6d31840-e789-5053-9d32-93e1ac5875bb', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Translate the Ka-band carrier to the IF band.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.1.1.1_1'})
SET n += {Name: 'IF Output Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '8dc32664-0c8f-5814-9a42-f7a5c6f1e337', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Intermediate-frequency output to the demodulator.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.1.1.1_1'})
SET n += {Name: 'Front End Noise Figure', Baseline: 'None', Orphan: true, Barren: true, uuid: '43b90aa1-f3b2-54d4-a945-e12b32d50542', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The RF Front End SHALL achieve a system noise figure of 1.2 dB or better.', VMethod: 'Test', VStatement: 'Y-factor noise measurement at the feed.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.2_0'})
SET n += {Name: 'Operations Center', uuid: 'f53704d0-6733-51cb-b799-27c885375186', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fuses the fire picture and directs response assets.', MissionAction: 'build the fire operating picture and direct suppression', MissionMeans: 'mission data processing, a watch floor, and a communications suite', MissionContribution: 'command tasking timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.2_1'})
SET n += {Name: 'Fire Operations Direction', uuid: 'a1664e06-ab0c-5ef6-b51f-884d6bcb746a', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Direct aviation and ground assets from a fused picture.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.2_1'})
SET n += {Name: 'Operations Floor Environment', uuid: '15cc2ee8-d9b9-5d69-b87e-6057d160dd73', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Continuous watch operations with redundant power and HVAC.'};
MERGE (n:SSTPA:State {HID: 'ST_2.2_1'})
SET n += {Name: 'Day Watch', TransitionKind: 'FUNCTIONAL', uuid: '376580ab-d594-5860-9287-da7d7647afe9', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.2_2'})
SET n += {Name: 'Incident Response', TransitionKind: 'FUNCTIONAL', uuid: 'b5679ab8-943e-5b02-beb6-d50900dbcfa0', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Active direction of one or more incidents.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.2_1'})
SET n += {Name: 'Mission Data Processing', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '38431b21-6359-5c43-9563-4a83c7ea4258', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Servers that correlate detections into confirmed fires.', TechnologyType: 'Virtualized server cluster'};
MERGE (n:SSTPA:Component {HID: 'EL_2.2_2'})
SET n += {Name: 'Communications Suite', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9c2a8c75-e9a1-5069-9952-7eea822ac5fe', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Radio, SATCOM, and telephony gateways of the center.', TechnologyType: 'Integrated communications rack row'};
MERGE (n:SSTPA:Component {HID: 'EL_2.2_3'})
SET n += {Name: 'Watch Floor Consoles', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'dbc3b2f6-8f92-5c22-be85-479a4e3ef264', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Watch stander console positions and display wall.', TechnologyType: 'Console positions with display wall'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2_1'})
SET n += {Name: 'Process Detection Reports', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '78427cf2-848c-51b8-a262-694f6943a5aa', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Correlate, deduplicate, and confirm incoming detections.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2_2'})
SET n += {Name: 'Present Operating Picture', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '54270010-1331-5e8d-906c-1acbfb91d510', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Display the fused fire picture to watch standers.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2_3'})
SET n += {Name: 'Relay Tasking Traffic', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '28d7f341-f7c6-5407-b7b0-2f47978a5d93', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bridge tasking decisions onto the segment radio networks.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_2.2_1'})
SET n += {Name: 'Operations LAN', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '914510dc-9d41-5a84-a178-f76999741dad', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Switched LAN binding processing, consoles, and comms.', Connection_Description: 'Internal data fabric of the operations center.', ConnectionType: 'Local area network', OSILayer: 3, Protocol: 'IP over switched Ethernet', Directionality: 'Bidirectional', TimingClass: 'Interactive', SecurityClass: 'Enclave network', PayloadDescription: 'Detection feeds, picture services, tasking traffic.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.2_1'})
SET n += {Name: 'Operations LAN Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3627aa80-dd04-5971-96e9-632f1c31f453', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Comms suite attachment to the operations LAN.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.2_2'})
SET n += {Name: 'Mission Data Feed Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c4f1eda5-6345-5358-a615-0d03ca629448', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Detection feed from processing into the picture services.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.2_1'})
SET n += {Name: 'Detection Confirmation', Baseline: 'None', Orphan: true, Barren: false, uuid: '18afbfa2-c3e8-57b1-945a-3580217e6250', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Operations Center SHALL confirm or reject each candidate detection within 5 minutes of receipt.', VMethod: 'Demonstration', VStatement: 'Watch floor exercise with scripted detection load.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.2.1_0'})
SET n += {Name: 'Mission Data Processing', uuid: 'a3030539-e2f0-58b5-aea1-e5817e139485', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Correlates all detection sources into confirmed fires.', MissionAction: 'turn detection reports into confirmed fire incidents', MissionMeans: 'fusion software over a detection database', MissionContribution: 'operations center confirmation timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.2.1_1'})
SET n += {Name: 'Detection Fusion', uuid: 'd662fd37-83a3-5f4b-88d2-d8fdf371f9da', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Maintain the authoritative confirmed-fire list.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.2.1_1'})
SET n += {Name: 'Server Room Environment', uuid: '38f91d7f-75c5-5b0e-ad19-67a55a02c905', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Conditioned enclave server room on the operations LAN.'};
MERGE (n:SSTPA:State {HID: 'ST_2.2.1_1'})
SET n += {Name: 'Maintenance', TransitionKind: 'FUNCTIONAL', uuid: 'cdff9aa3-033f-5cd0-96c8-9e74f0fe0e14', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.2.1_2'})
SET n += {Name: 'Processing', TransitionKind: 'FUNCTIONAL', uuid: 'dce6db6d-ec76-56cf-a8ea-9346d3016605', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.2.1_1'})
SET n += {Name: 'Fusion Server', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9b37f3b0-b638-5905-9f27-b9089862608c', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Detection correlation and scoring services.', TechnologyType: 'Server cluster application'};
MERGE (n:SSTPA:Component {HID: 'EL_2.2.1_2'})
SET n += {Name: 'Detection Database', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a99f81f8-c65c-549b-96c5-59271bbd6536', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Incident and detection history store.', TechnologyType: 'Replicated relational database'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2.1_1'})
SET n += {Name: 'Correlate Detection Sources', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f4af14ae-3720-5c7c-a55a-3066f955c03b', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Match satellite, watch, and aviation reports by geometry.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2.1_2'})
SET n += {Name: 'Persist Fire Records', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9864f140-d21d-5b96-a14f-0e8f43de552d', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Maintain the incident and detection history database.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.2.1_1'})
SET n += {Name: 'Fusion Service Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f3bb860d-da87-5206-8989-c763173021ae', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Picture and confirmation services on the operations LAN.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.2.1_1'})
SET n += {Name: 'Duplicate Suppression', Baseline: 'None', Orphan: true, Barren: true, uuid: 'b984e919-f807-5708-ac41-76720323ab06', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'Mission Data Processing SHALL merge duplicate reports of the same fire from all sources into one incident.', VMethod: 'Test', VStatement: 'Replay of overlapping multi-source reports.'};
MERGE (n:SSTPA:System {HID: 'SYS_2.2.2_0'})
SET n += {Name: 'Communications Suite', uuid: 'f877b736-eb2f-589a-9472-10b332ee664d', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bridges the operations floor onto external networks.', MissionAction: 'connect watch standers to every response network', MissionMeans: 'SATCOM terminals, LMR gateways, and telephony switches', MissionContribution: 'command tasking and coordination reach'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_2.2.2_1'})
SET n += {Name: 'Network Bridging', uuid: '509ee588-d31f-5a44-99d1-2996593f0dee', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Keep every tasking and coordination path available.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_2.2.2_1'})
SET n += {Name: 'Communications Room Environment', uuid: '0d29d4a3-2a63-56b6-a47f-07095d4a6f84', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Racked gateways with antenna field and PSTN handoffs.'};
MERGE (n:SSTPA:State {HID: 'ST_2.2.2_1'})
SET n += {Name: 'Reduced', TransitionKind: 'FUNCTIONAL', uuid: '00555db6-3d43-55da-90d2-ac705be8b6d1', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_2.2.2_2'})
SET n += {Name: 'Full Service', TransitionKind: 'FUNCTIONAL', uuid: 'd32e246e-6b66-5b76-941a-a055b8e99c1c', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_2.2.2_1'})
SET n += {Name: 'SATCOM Terminal', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'fc870c0f-0635-59c5-979c-2b19931bd1d1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Satellite communications terminal for tasking traffic.', TechnologyType: 'Ku-band SATCOM terminal'};
MERGE (n:SSTPA:Component {HID: 'EL_2.2.2_2'})
SET n += {Name: 'LMR Gateway', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '27118bfc-03e6-5b40-8890-22c6a1db5315', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'P25 radio system gateway and dispatch consoles.', TechnologyType: 'P25 ISSI gateway'};
MERGE (n:SSTPA:Component {HID: 'EL_2.2.2_3'})
SET n += {Name: 'VoIP Switch', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2856edc5-f0f4-51f7-b24b-203ab0840313', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Operational telephony switch.', TechnologyType: 'Enterprise VoIP switch'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2.2_1'})
SET n += {Name: 'Bridge SATCOM Tasking', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '05d14d5a-9e5e-5959-90e5-8c5290bdab14', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Carry tasking traffic over the SATCOM terminal.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2.2_2'})
SET n += {Name: 'Bridge Land Mobile Radio', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ea9009b0-0832-5dab-8fcd-33eccc283f1a', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Connect console positions to the P25 network.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_2.2.2_3'})
SET n += {Name: 'Switch Operational Voice', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c8c0ad4e-e81e-5aa5-9137-629163a062ad', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Route telephony among positions and external agencies.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.2.2_1'})
SET n += {Name: 'SATCOM Terminal Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e684afb6-a508-5340-bdf5-18cbed51be14', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Terminal-side endpoint on the aviation tasking link.'};
MERGE (n:SSTPA:Interface {HID: 'INT_2.2.2_2'})
SET n += {Name: 'LMR Network Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9663c267-35b4-5b76-a89e-50d6d01408b9', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Gateway endpoint on the ground coordination network.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_2.2.2_1'})
SET n += {Name: 'Gateway Availability', Baseline: 'None', Orphan: true, Barren: true, uuid: '0abb6784-28f6-5d6b-a637-d093a98217a6', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '2.2.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Communications Suite SHALL keep each external gateway available at least 99.5 percent of fire season hours.', VMethod: 'Analysis', VStatement: 'Availability rollup from gateway monitoring.'};
MERGE (n:SSTPA:System {HID: 'SYS_3_0'})
SET n += {Name: 'Aviation Segment', uuid: '1d03e9f0-b3b2-53b0-8893-d1e5efae1649', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Firefighting aviation dropping water and deploying fire jumpers.', LongDescription: 'The FireSat Aviation Segment flies air tankers that dump water and retardant on detected fires and smokejumper aircraft that deploy fire jumpers onto remote incidents, all tasked from the Command Segment over SATCOM and coordinated with ground crews on tactical VHF.', MissionAction: 'suppress detected fires from the air', MissionMeans: 'air tankers, smokejumper aircraft, and an air operations base tasked by the Command Segment', MissionContribution: 'the FireSat suppression timeline for remote incidents'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3_1'})
SET n += {Name: 'Aerial Fire Suppression', uuid: '2ba7f765-2c56-591e-867b-a78a53515d7c', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Put water and jumpers onto fires fast.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3_1'})
SET n += {Name: 'Fire Traffic Area Environment', uuid: 'c22c150a-c747-5d00-96db-190779f27d78', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Mountainous low-level flight environment over active fires with smoke, turbulence, and dense fire traffic under temporary flight restrictions.'};
MERGE (n:SSTPA:State {HID: 'ST_3_1'})
SET n += {Name: 'Stand-Down', TransitionKind: 'FUNCTIONAL', uuid: '6b572f00-ba93-52e4-bc67-d4295ac974f5', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3_2'})
SET n += {Name: 'Alert', TransitionKind: 'FUNCTIONAL', uuid: '27b2347e-2e1c-55d4-bf78-a32704152ae3', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Crews and aircraft on tasking alert at the base.', StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_3_3'})
SET n += {Name: 'Committed', TransitionKind: 'FUNCTIONAL', uuid: '47920b56-ba13-55d3-806d-50a76dede486', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Aircraft airborne against tasked incidents.', StateSequence: 2};
MERGE (n:SSTPA:Component {HID: 'EL_3_1'})
SET n += {Name: 'Air Tanker Fleet', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a7bf88c5-3021-5fe2-b4f5-e7f8fdeb99c1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Water and retardant drop aircraft with lead plane.', TechnologyType: 'Fixed-wing air tanker fleet'};
MERGE (n:SSTPA:Component {HID: 'EL_3_2'})
SET n += {Name: 'Smokejumper Wing', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '85fce3f4-2e82-5143-aab2-ca9206b294d9', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Jump aircraft and smokejumper teams for remote incidents.', TechnologyType: 'Smokejumper aircraft and teams'};
MERGE (n:SSTPA:Component {HID: 'EL_3_3'})
SET n += {Name: 'Air Operations Base', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'b3f1d26e-14d5-548a-8462-0acd5e8371c1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Base with retardant plant, flight line, and base comms.', TechnologyType: 'Fire aviation operating base', DeploymentContext: 'Forward airfield within tanker range of protected forests'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3_1'})
SET n += {Name: 'Receive Air Tasking', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f5383d58-e9d8-599e-aad3-f49a139e9261', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Accept and acknowledge tasking from the Command Segment.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3_2'})
SET n += {Name: 'Dump Water On Fires', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4f69c5c6-d6fd-5f25-b6d9-cf35f7ea3309', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver water and retardant drops onto tasked fires.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3_3'})
SET n += {Name: 'Deploy Fire Jumpers', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '33f209c1-502a-54d7-98fe-ca7e5285c01a', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Insert smokejumper teams onto remote incidents.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3_4'})
SET n += {Name: 'Report Drop Effects', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '794148d5-a572-57f8-9b2c-813d0effa6fe', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Report drop and deployment results to the Command Segment.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3_5'})
SET n += {Name: 'Coordinate With Ground Crews', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '75f2ef0d-1f7d-58fe-8972-b5acade11b4f', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 5, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deconflict drops with crews on the tactical air-ground net.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_3_1'})
SET n += {Name: 'Air-To-Ground Tactical Net', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'cb3f2952-2d47-5b4b-973c-ae4c32742e8b', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'VHF-FM voice net deconflicting drops with ground crews.', Connection_Description: 'Direct coordination between aircraft over the fire and the crews working beneath them.', ConnectionType: 'Tactical voice net', OSILayer: 1, Protocol: 'VHF-FM simplex voice', Directionality: 'Multicast', TimingClass: 'Real-time voice', PayloadDescription: 'Drop clearances, crew positions, target talk-ons.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3_1'})
SET n += {Name: 'Drop Clearance Voice', Baseline: 'None', Orphan: false, Barren: true, uuid: 'd98c8f65-8a3a-53d3-af2b-33d91d6f195a', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Air-To-Ground Tactical Net SHALL carry a drop clearance exchange between aircraft and ground crews before every drop.', VMethod: 'Demonstration', VStatement: 'Exercise drops audited against net recordings.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3_1'})
SET n += {Name: 'Aviation Segment Tasking Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3963fe0c-aa28-5404-8232-6caa3d12a49c', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level endpoint of the Command tasking link.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3_2'})
SET n += {Name: 'Air-Ground Coordination Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2fc4274b-1f8c-5bdc-9218-51909399b400', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level endpoint of the tactical air-ground net.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3_2'})
SET n += {Name: 'Aviation Launch Response', Baseline: 'None', Orphan: true, Barren: false, uuid: 'ba86ff63-bbbf-5051-b10f-0883242d8de2', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Aviation Segment SHALL launch a tasked air tanker within 20 minutes of tasking acceptance during fire season alert.', VMethod: 'Demonstration', VStatement: 'Timed launch exercises from alert posture.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3_3'})
SET n += {Name: 'Jumper Deployment', Baseline: 'None', Orphan: true, Barren: false, uuid: '65d76a8f-ffe2-5305-84bd-9476f643955e', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Aviation Segment SHALL deploy a smokejumper team onto a remote incident within 90 minutes of tasking acceptance.', VMethod: 'Demonstration', VStatement: 'Timed jump exercises onto a training incident.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3_4'})
SET n += {Name: 'Sustained Sortie Rate', Baseline: 'None', Orphan: true, Barren: false, uuid: 'd49968a5-9690-5698-b7aa-32b810b95a28', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Aviation Segment SHALL sustain six tanker sorties per day per active incident for five consecutive days.', VMethod: 'Analysis', VStatement: 'Sortie generation model against fleet and base capacity.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.1_0'})
SET n += {Name: 'Air Tanker Fleet', uuid: 'bad2768d-111b-50f4-9b24-77baf037c615', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Delivers water and retardant drops on tasked fires.', MissionAction: 'put water and retardant on tasked fires', MissionMeans: 'air tankers directed by a lead plane', MissionContribution: 'aviation segment drop capacity'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.1_1'})
SET n += {Name: 'Drop Delivery', uuid: '8058196b-1eec-5e62-89e0-8f4b22695576', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver accurate drops at the tasked sortie rate.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.1_1'})
SET n += {Name: 'Drop Pattern Environment', uuid: 'c1080944-d46e-52f0-920a-edc830e9da70', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Low-level smoke-obscured drop runs in mountain terrain.'};
MERGE (n:SSTPA:State {HID: 'ST_3.1_1'})
SET n += {Name: 'Parked', TransitionKind: 'FUNCTIONAL', uuid: '873456a0-c65d-5fa6-b08d-a51489799d2b', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.1_2'})
SET n += {Name: 'Sortie', TransitionKind: 'FUNCTIONAL', uuid: '2f3b37b1-5969-5d58-9355-2631ace75c04', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fleet aircraft flying tasked drop sorties.', StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.1_1'})
SET n += {Name: 'Air Tanker', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9bb91476-fa7b-5bd3-b5a5-db547f9f76a1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Water-dropping aircraft with tank and drop system.', TechnologyType: 'Converted transport airframe'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1_2'})
SET n += {Name: 'Lead Plane', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '904b2726-ae98-599d-a0d2-036f98e797b7', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Pathfinder aircraft marking drop lines for the tankers.', TechnologyType: 'Light twin lead aircraft'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1_1'})
SET n += {Name: 'Fly Drop Sorties', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '590c0717-2fb8-5749-abf5-91adc728f4e2', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fly tasked drop profiles over assigned fires.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1_2'})
SET n += {Name: 'Lead Drop Runs', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1b8f01dd-e543-5bf7-a14f-4e5c56ead1b0', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Mark and lead tankers down the drop line.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.1_1'})
SET n += {Name: 'Fleet Common Frequency Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3fe07fce-b560-5a74-a50a-607f80a9693f', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fleet air-to-air coordination on the tactical net.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.1_1'})
SET n += {Name: 'Drop Accuracy', Baseline: 'None', Orphan: true, Barren: false, uuid: '4647a9da-e7d0-51d5-b677-c52138e73cc0', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Air Tanker Fleet SHALL place drops within 50 meters of the lead plane mark.', VMethod: 'Test', VStatement: 'Scored drops on an instrumented range.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.1.1_0'})
SET n += {Name: 'Air Tanker', uuid: 'a2f5e3ca-7824-5cd0-9c5b-cd0db5ef96ee', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'One drop aircraft with tank, drop system, and avionics.', MissionAction: 'deliver a tasked water or retardant drop', MissionMeans: 'a tanked airframe with a controlled drop system', MissionContribution: 'fleet drop accuracy and sortie rate'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.1.1_1'})
SET n += {Name: 'Single-Ship Drop', uuid: '5403e7d6-034c-52ca-815b-c2504b8f8b30', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fly the drop profile and release on the mark.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.1.1_1'})
SET n += {Name: 'Drop Run Environment', uuid: '809c5717-7912-5849-9bfd-09d6798e28bd', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Low airspeed, low altitude release in turbulence and smoke.'};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1_1'})
SET n += {Name: 'Loaded', TransitionKind: 'FUNCTIONAL', uuid: 'e7e9d840-b522-5278-a0d7-e888126f3e38', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1_2'})
SET n += {Name: 'Drop Run', TransitionKind: 'FUNCTIONAL', uuid: '4fda4ddd-f721-5797-9961-9598709b1291', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1_3'})
SET n += {Name: 'Empty Return', TransitionKind: 'FUNCTIONAL', uuid: '3f8eb040-5400-5d52-8532-dad27d09174a', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 2};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1_1'})
SET n += {Name: 'Water Drop System', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9efc1752-b8e4-5582-b7d9-76d11bba5762', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Tank, doors, and pumps metering the drop.', TechnologyType: 'Constant-flow tank and door system'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1_2'})
SET n += {Name: 'Tanker Avionics', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '7f39538f-deb8-5813-9fa5-ecf09497b6b1', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Radios, navigation, and surveillance equipment.', TechnologyType: 'Retrofit avionics suite'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1_3'})
SET n += {Name: 'Tanker Airframe', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '16464624-0d91-53e6-9383-476b49070e5d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Converted transport aircraft structure and engines.', TechnologyType: 'Converted transport airframe'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1_1'})
SET n += {Name: 'Fly Drop Profile', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c55603e9-b2f6-5c6a-aca2-c2db3b27051c', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hold the drop run speed, height, and line.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1_2'})
SET n += {Name: 'Release Water Load', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '9eea421e-6766-52c1-a361-c6caaec65f22', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Open drop doors to pattern the load on target.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1_3'})
SET n += {Name: 'Talk With Ground Crews', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6ef46f3f-821f-5b07-99cb-c0a0752eca16', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Exchange clearances on the tactical air-ground net.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_3.1.1_1'})
SET n += {Name: 'Tanker Avionics Bus', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e76647f0-31e8-5fbc-a607-a269d20cfed7', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'ARINC 429 bus linking avionics and drop system.', Connection_Description: 'Carries drop commands and system status in the aircraft.', ConnectionType: 'Avionics data bus', OSILayer: 2, Protocol: 'ARINC 429', Directionality: 'Unidirectional', TimingClass: 'Real-time', PayloadDescription: 'Drop commands, door status, tank quantity.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.1.1_1'})
SET n += {Name: 'Tanker VHF Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1dfed150-2c39-51ef-bbb8-8cda8c275a85', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Aircraft radio endpoint on the air-ground net.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.1.1_2'})
SET n += {Name: 'Drop Command Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4335ce0d-9bbc-52d6-ac2b-f3d2515db26e', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Cockpit drop commanding into the drop system.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.1.1_1'})
SET n += {Name: 'Release Reliability', Baseline: 'None', Orphan: true, Barren: false, uuid: 'd19fcbe1-0ac0-5c51-8d30-f341686038f6', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Air Tanker SHALL release the commanded load quantity on 99 percent of commanded drops.', VMethod: 'Test', VStatement: 'Release audit across a drop test series.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.1.1.1_0'})
SET n += {Name: 'Water Drop System', uuid: '2a028c4a-c6e7-5445-a917-3bf50d9b6c94', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Meters and patterns the released load.', MissionAction: 'release the commanded load in the commanded pattern', MissionMeans: 'tank doors and pumps under drop controller command', MissionContribution: 'air tanker release reliability'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.1.1.1_1'})
SET n += {Name: 'Metered Release', uuid: 'd1beb0d3-61ea-56fc-b610-fffc3ff859bf', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Pattern the load onto the fire line.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.1.1.1_1'})
SET n += {Name: 'Drop System Environment', uuid: '3896fb15-b5e5-542e-9bc7-ba73875180c7', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'High-flow water and retardant wetted hardware.'};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1.1_1'})
SET n += {Name: 'Sealed', TransitionKind: 'FUNCTIONAL', uuid: '1857ec79-3e1e-5aed-b5ca-f61c49980c94', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1.1_2'})
SET n += {Name: 'Releasing', TransitionKind: 'FUNCTIONAL', uuid: '8881a0c1-09f7-5572-816b-d2bc92b720d3', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.1_1'})
SET n += {Name: 'Water Tank', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '73cd3ab4-d777-5daf-a467-39c140c21c1f', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Internal tank holding the drop load.', TechnologyType: 'Baffled internal tank'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.1_2'})
SET n += {Name: 'Drop Doors', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '94d248fe-b427-505c-b425-59097eefa880', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hydraulically sequenced release doors.', TechnologyType: 'Hydraulic door actuators'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.1_3'})
SET n += {Name: 'Transfer Pump', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'b36be0bc-2225-5018-80ae-6bb71b210df4', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ground fill and in-flight transfer pump.', TechnologyType: 'Centrifugal transfer pump'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1.1_1'})
SET n += {Name: 'Meter Release Flow', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6804a1a6-4a80-53b3-a333-a99c1ddb9772', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sequence doors and pumps for the commanded coverage.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.1.1.1_1'})
SET n += {Name: 'Drop System Bus Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '09b1b2cb-ddd6-5684-85ea-e07b111cece7', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Drop system endpoint of the avionics bus.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.1.1.1_1'})
SET n += {Name: 'Coverage Level Control', Baseline: 'None', Orphan: true, Barren: true, uuid: 'bb06a233-68e7-557a-ae07-4a54a23a105c', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Water Drop System SHALL deliver the selected coverage level across the drop pattern.', VMethod: 'Test', VStatement: 'Cup-and-grid pattern test per coverage setting.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.1.1.2_0'})
SET n += {Name: 'Tanker Avionics', uuid: 'b5a9c1ce-e5f4-5d74-bd3d-d1d4809ac26a', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Communications and navigation for the drop mission.', MissionAction: 'keep the tanker connected and navigating', MissionMeans: 'VHF and SATCOM radios with GPS navigation', MissionContribution: 'tanker coordination and tasking reach'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.1.1.2_1'})
SET n += {Name: 'Mission Connectivity', uuid: '86f7beb6-c0fd-5ca8-9440-a70df3b73e41', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Voice, data, and navigation for every sortie.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.1.1.2_1'})
SET n += {Name: 'Cockpit Avionics Environment', uuid: '8b747b0e-4727-5382-881b-65d94c30179f', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Certified airborne electronics bays and antennas.'};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1.2_1'})
SET n += {Name: 'Powered Down', TransitionKind: 'FUNCTIONAL', uuid: '01256a4d-bc9f-5f69-a3ea-48e4cdd9a8a6', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.1.1.2_2'})
SET n += {Name: 'Mission Set', TransitionKind: 'FUNCTIONAL', uuid: '19bffc70-d909-50ea-8499-c40bcb1f893d', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.2_1'})
SET n += {Name: 'VHF Tactical Radio', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'cc12841c-bda3-5685-b4b8-2d8c9ede471a', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fire traffic and air-ground voice radio.', TechnologyType: 'VHF-AM/FM airborne radio'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.2_2'})
SET n += {Name: 'SATCOM Transceiver', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '59d98ea5-7ffd-5fbd-a44b-c377ff94afcc', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Airborne satellite data transceiver.', TechnologyType: 'Airborne SATCOM transceiver'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.2_3'})
SET n += {Name: 'GPS Navigator', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd8e31390-964f-535b-bc90-88eef77b46e6', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Navigation and drop point guidance receiver.', TechnologyType: 'Certified GPS navigator'};
MERGE (n:SSTPA:Component {HID: 'EL_3.1.1.2_4'})
SET n += {Name: 'Surveillance Transponder', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3b2b9368-f7d3-5a61-910b-97f077c72f1d', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'ADS-B out for fire traffic deconfliction.', TechnologyType: 'ADS-B transponder'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1.2_1'})
SET n += {Name: 'Provide Tactical Voice', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'cacdf05d-e9e4-5a3e-8bc5-ca56815a6cf8', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Tune and transmit on fire traffic frequencies.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1.2_2'})
SET n += {Name: 'Provide SATCOM Data', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2a536466-3d33-5811-b71f-fbdaaaf6ee59', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Exchange tasking data with the command center.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.1.1.2_3'})
SET n += {Name: 'Navigate Drop Runs', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f8c7f59a-d5eb-5cd9-b88b-e3df1bb86beb', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Provide guidance to the tasked drop point.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.1.1.2_1'})
SET n += {Name: 'Tanker SATCOM Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '60485111-b81f-5d99-ba31-613f48250f38', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Airborne endpoint of the aviation tasking link.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.1.1.2_1'})
SET n += {Name: 'Airborne Tasking Receipt', Baseline: 'None', Orphan: true, Barren: true, uuid: '89e73caf-891d-528e-9a16-aa8be973c3e1', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.1.1.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Tanker Avionics SHALL receive and acknowledge tasking updates while airborne anywhere in the operating area.', VMethod: 'Test', VStatement: 'Tasking exchange across the operating area.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.2_0'})
SET n += {Name: 'Smokejumper Wing', uuid: '0a833270-36c3-5c5d-afa8-c960c11ff063', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deploys fire jumper teams onto remote incidents.', MissionAction: 'put trained fire jumpers onto remote fires', MissionMeans: 'jump aircraft carrying equipped smokejumper teams', MissionContribution: 'aviation segment remote incident response'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.2_1'})
SET n += {Name: 'Jumper Insertion', uuid: '5187c902-efa3-5423-bdb2-aed792281074', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver teams safely onto the jump spot.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.2_1'})
SET n += {Name: 'Jump Operations Environment', uuid: 'c19bc8ed-6a36-50e7-b5b7-d42e4aef83e8', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Low-altitude paracargo and jump runs over mountain terrain.'};
MERGE (n:SSTPA:State {HID: 'ST_3.2_1'})
SET n += {Name: 'Rigged', TransitionKind: 'FUNCTIONAL', uuid: '68a67bd6-8e69-55b6-a827-e4fa62693eef', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.2_2'})
SET n += {Name: 'Jump Operations', TransitionKind: 'FUNCTIONAL', uuid: '71980480-d2ab-5e8d-b503-78d6daa9ee85', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.2_1'})
SET n += {Name: 'Jump Aircraft', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4e0ac25e-50d2-51c6-a7bf-348581a9db98', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Aircraft configured for jumper exit and paracargo.', TechnologyType: 'Turboprop jump ship'};
MERGE (n:SSTPA:Component {HID: 'EL_3.2_2'})
SET n += {Name: 'Smokejumper Teams', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3a8a6c58-105f-5725-8b93-e9c55b0803cd', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Equipped jumper teams with paracargo kit.', TechnologyType: 'Jump kit and paracargo equipment cache'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.2_1'})
SET n += {Name: 'Fly Jump Runs', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '84fd050c-0f13-587a-806b-d09a03825a75', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fly exit runs over the selected jump spot.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.2_2'})
SET n += {Name: 'Insert Jumper Teams', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'eaa66446-8ea5-5f6a-b36d-46fe38907710', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Exit jumpers and drop paracargo onto the incident.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.2_1'})
SET n += {Name: 'Wing Air-Ground Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ee282870-6b16-526d-87a2-dbd253c3a3bc', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Jump aircraft endpoint on the tactical air-ground net.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.2_1'})
SET n += {Name: 'Jump Spot Accuracy', Baseline: 'None', Orphan: true, Barren: false, uuid: '8ce163f2-e9e2-5f81-a7c4-790517e46ca4', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Smokejumper Wing SHALL place jumpers within 100 meters of the selected jump spot.', VMethod: 'Demonstration', VStatement: 'Scored training jumps onto marked spots.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.2.1_0'})
SET n += {Name: 'Jump Aircraft', uuid: '74666b1b-2c9d-50fb-b10b-645465acb9d0', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Carries and exits smokejumper teams over incidents.', MissionAction: 'exit jumpers safely over the jump spot', MissionMeans: 'a jump-configured aircraft with spotter platform', MissionContribution: 'wing jump spot accuracy'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.2.1_1'})
SET n += {Name: 'Exit Platform', uuid: 'ebf131de-8476-55a3-8ec6-0dbcfb4d81cd', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Stable, communicating exit platform over the spot.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.2.1_1'})
SET n += {Name: 'Jump Run Environment', uuid: 'bbc1feba-545b-51de-a9fd-72f0172bc00b', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Door-open low-speed flight over drop terrain.'};
MERGE (n:SSTPA:State {HID: 'ST_3.2.1_1'})
SET n += {Name: 'Cruise', TransitionKind: 'FUNCTIONAL', uuid: 'efd24b40-e981-5933-9e4d-47a26aa15d66', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.2.1_2'})
SET n += {Name: 'Jump Run', TransitionKind: 'FUNCTIONAL', uuid: '67adf040-3453-58bf-8470-10f32bf13644', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.2.1_1'})
SET n += {Name: 'Jump Platform', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '194d91b6-f5ef-5296-82d9-de31fe19223a', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Door, static line anchor, and exit step.', TechnologyType: 'Jump door and anchor cable fit'};
MERGE (n:SSTPA:Component {HID: 'EL_3.2.1_2'})
SET n += {Name: 'Crew Radio', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'bace62b3-4a8d-5d24-b7fa-666ac0b54be8', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Spotter intercom and tactical radio fit.', TechnologyType: 'Intercom and VHF radio fit'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.2.1_1'})
SET n += {Name: 'Hold Exit Run', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '38fb0fa2-6896-5dd6-8d34-33209a971e31', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hold run-in track and exit speed for the stick.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.2.1_2'})
SET n += {Name: 'Coordinate Spotter Calls', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'ad04d6c2-902f-590a-a5cc-040d814964d2', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Carry spotter and crew coordination voice.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.2.1_1'})
SET n += {Name: 'Jump Crew Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '7a0b1128-a4d9-546f-a73e-de67c8a62a62', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Spotter and jumper intercom and signal station.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.2.1_1'})
SET n += {Name: 'Exit Condition Control', Baseline: 'None', Orphan: true, Barren: true, uuid: '2bb3218d-158d-5d3c-9dc5-500614c8bf5f', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Jump Aircraft SHALL hold exit speed within 5 knots through each stick exit.', VMethod: 'Test', VStatement: 'Flight data review across training exits.'};
MERGE (n:SSTPA:System {HID: 'SYS_3.3_0'})
SET n += {Name: 'Air Operations Base', uuid: '30d4478d-c49f-58c0-a69c-07eeb02c4e1e', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Generates and sustains aviation sorties.', MissionAction: 'generate tasked sorties and turn aircraft quickly', MissionMeans: 'a retardant plant, flight line services, and base comms', MissionContribution: 'aviation segment sortie rate'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_3.3_1'})
SET n += {Name: 'Sortie Generation', uuid: '7eb4e374-36d7-50ae-b9c9-086bbb3b0136', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Launch, recover, reload, and relaunch aircraft.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_3.3_1'})
SET n += {Name: 'Base Airfield Environment', uuid: '85d4eca1-4571-518d-8ee3-cfe393344e40', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Airfield operations with retardant loading pits.'};
MERGE (n:SSTPA:State {HID: 'ST_3.3_1'})
SET n += {Name: 'Caretaker', TransitionKind: 'FUNCTIONAL', uuid: '092f49b8-bf9e-508f-b3c7-b51412548e0a', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_3.3_2'})
SET n += {Name: 'Operating', TransitionKind: 'FUNCTIONAL', uuid: '786281a4-5017-569e-998d-325090fe5a38', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_3.3_1'})
SET n += {Name: 'Retardant Plant', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1e273e1d-abd9-5f41-aebe-6e183defd14c', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Mixing and loading pits for water and retardant.', TechnologyType: 'Retardant batch plant'};
MERGE (n:SSTPA:Component {HID: 'EL_3.3_2'})
SET n += {Name: 'Flight Line Services', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'dd5d1ff6-781e-5bc0-90d8-71fa0216379c', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fueling, parking, and turnaround services.', TechnologyType: 'Airfield line service equipment'};
MERGE (n:SSTPA:Component {HID: 'EL_3.3_3'})
SET n += {Name: 'Base Communications', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '68edd90f-3a79-5c8e-917e-c179a0ea2861', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Base radio room and SATCOM terminal.', TechnologyType: 'Base station radios and SATCOM'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.3_1'})
SET n += {Name: 'Manage Base Tasking', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'd36b386f-12f5-5292-a689-73d33c9cf549', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Hold the tasking picture and assign aircraft.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.3_2'})
SET n += {Name: 'Reload Aircraft', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '448262ba-99d3-52cb-af43-4c2cc9cde41d', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Reload water and retardant between sorties.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_3.3_3'})
SET n += {Name: 'Turn Aircraft On The Line', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '598312b1-bec9-56e7-98e4-48b50a4321cb', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fuel, inspect, and relaunch aircraft.'};
MERGE (n:SSTPA:Interface {HID: 'INT_3.3_1'})
SET n += {Name: 'Base SATCOM Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '5c04067c-7b6e-558e-8df2-36eef260be56', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Base endpoint of the aviation tasking link.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_3.3_1'})
SET n += {Name: 'Aircraft Turn Time', Baseline: 'None', Orphan: true, Barren: true, uuid: 'cff61163-09b8-597a-976d-a61399bde985', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '3.3', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Air Operations Base SHALL turn a returning air tanker in under 15 minutes.', VMethod: 'Demonstration', VStatement: 'Timed pit operations during exercise surges.'};
MERGE (n:SSTPA:System {HID: 'SYS_4_0'})
SET n += {Name: 'Ground Segment', uuid: '78a382a0-8418-56b0-855e-fd8b2720ca91', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Forest watch stations and vehicle fleet for local fire response.', LongDescription: 'The FireSat Ground Segment operates watch stations in national forests that detect fires from the ground and direct local firefighting, plus a fleet of fire engines and logistics vehicles that fight fires and sustain crews, coordinated with the Command Segment over land mobile radio and data backhaul.', MissionAction: 'detect fires from the ground and direct local firefighting', MissionMeans: 'forest watch stations, fire engines, and logistics vehicles on the command coordination networks', MissionContribution: 'ground-truth detection and local suppression for FireSat'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4_1'})
SET n += {Name: 'Ground Fire Watch And Response', uuid: 'e4cca71f-ee66-5787-84cc-412aa62ee236', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'See fires early from the ground and fight them locally.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4_1'})
SET n += {Name: 'National Forest Environment', uuid: '2c210dff-91b7-53c5-88d9-ffacfae44cff', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Remote forest terrain with limited grid power, seasonal access roads, and radio propagation shaped by ridgelines.'};
MERGE (n:SSTPA:State {HID: 'ST_4_1'})
SET n += {Name: 'Off-Season', TransitionKind: 'FUNCTIONAL', uuid: '7b8fc914-7639-5167-920c-609658c71079', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4_2'})
SET n += {Name: 'Fire Watch', TransitionKind: 'FUNCTIONAL', uuid: '45646b0c-f011-5e23-9353-5bdb0786d2d2', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Watch stations staffed and fleet on standby.', StateSequence: 1};
MERGE (n:SSTPA:State {HID: 'ST_4_3'})
SET n += {Name: 'Local Response', TransitionKind: 'FUNCTIONAL', uuid: '82223835-e919-5e84-85ab-06fcaba7210c', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Crews and vehicles committed to a local incident.', StateSequence: 2};
MERGE (n:SSTPA:Component {HID: 'EL_4_1'})
SET n += {Name: 'Watch Station Network', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '58e49581-d70a-5d03-90aa-3eb556feec97', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Staffed watch stations netted across the national forests.', TechnologyType: 'Networked fire lookout stations'};
MERGE (n:SSTPA:Component {HID: 'EL_4_2'})
SET n += {Name: 'Vehicle Fleet', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '817e232e-eb7c-5c3e-ac79-7a66f5de5f83', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fire engines and logistics vehicles supporting the districts.', TechnologyType: 'Wildland fire vehicle fleet'};
MERGE (n:SSTPA:Component {HID: 'EL_4_3'})
SET n += {Name: 'Hand Crew Equipment Cache', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '1929b56c-d54e-5ec6-af25-c29e8beefc19', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Tool and equipment cache outfitting district hand crews.', TechnologyType: 'Fire cache container stock'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4_1'})
SET n += {Name: 'Watch For Fires', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '209bb69e-3ffd-5729-bd1c-2286ff1eacde', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Maintain visual watch across assigned forest districts.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4_2'})
SET n += {Name: 'Report Smoke Sightings', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'dedfd78c-eeb7-51e1-9f27-5ca85dc383a7', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Report bearings and locations of smoke to the Command Segment.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4_3'})
SET n += {Name: 'Direct Local Firefighting', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3f5b867d-919f-5491-bdd8-dfe53e03bfd6', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Direct district crews and engines onto confirmed fires.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4_4'})
SET n += {Name: 'Fight Fires With Engines', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'bd9cad15-1cb0-5bfe-b5f0-f6347bdaa19a', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Apply water and crews on the fire line.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4_5'})
SET n += {Name: 'Sustain Crews And Vehicles', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'fd9ec8e3-7652-5ada-b8f6-650ca516aaff', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 5, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Move water, fuel, and supplies to committed crews.'};
MERGE (n:SSTPA:Connection {HID: 'CNN_4_1'})
SET n += {Name: 'Watch Station Backhaul', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a08f328d-b1c0-547e-8655-6dc0572a5ed1', TypeName: 'Connection', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Licensed microwave IP backhaul from watch stations to Command.', Connection_Description: 'Carries watch station imagery and reports where no terrestrial network reaches the forest.', ConnectionType: 'Microwave IP backhaul', OSILayer: 3, Protocol: 'IP over licensed microwave', Directionality: 'Bidirectional', TimingClass: 'Interactive', PayloadDescription: 'Spotting imagery, smoke reports, station status.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4_1'})
SET n += {Name: 'Backhaul Availability', Baseline: 'None', Orphan: false, Barren: true, uuid: '21c418da-3438-55fc-a7e5-52856f653a79', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Watch Station Backhaul SHALL be available at least 99 percent of fire season hours at every staffed station.', VMethod: 'Analysis', VStatement: 'Link monitoring rollup across a fire season.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4_1'})
SET n += {Name: 'Ground Tactical Radio Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '85b9747b-5d16-58c3-bcb5-0010a96322d9', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level endpoint on the ground coordination network.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4_2'})
SET n += {Name: 'Ground Air-Net Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '2ce5280a-67ec-525b-952e-00cf52b15daa', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level endpoint on the tactical air-ground net.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4_3'})
SET n += {Name: 'Fleet Logistics Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c4a36e49-c3b3-566d-8479-8c1a8a200e3b', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Segment-level endpoint of the logistics coordination link.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4_2'})
SET n += {Name: 'Ground Smoke Reporting', Baseline: 'None', Orphan: true, Barren: false, uuid: '4ba1d189-a938-57e3-af5a-77633de0d0a6', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Ground Segment SHALL report a bearing and estimated location for visible smoke within 5 minutes of sighting.', VMethod: 'Demonstration', VStatement: 'Timed smoke reports against staged smoke sources.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4_3'})
SET n += {Name: 'Local Response Time', Baseline: 'None', Orphan: true, Barren: false, uuid: '2973140f-43f3-5686-aca0-2fca2eaaf142', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Ground Segment SHALL put an engine crew on a confirmed fire within its district within 45 minutes of dispatch.', VMethod: 'Demonstration', VStatement: 'Timed district response exercises.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4_4'})
SET n += {Name: 'Fleet Sustainment', Baseline: 'None', Orphan: true, Barren: false, uuid: '39b3b685-f143-5cac-b116-c49ee23cf38b', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4', Sequence: 4, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Ground Segment SHALL sustain committed crews with water, fuel, and supplies for 14 consecutive incident days.', VMethod: 'Analysis', VStatement: 'Logistics throughput model against fleet capacity.'};
MERGE (n:SSTPA:System {HID: 'SYS_4.1_0'})
SET n += {Name: 'Watch Station Network', uuid: '05667d1e-1ffa-523b-a035-1fe2dd90bcf3', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Detects and localizes fires by ground observation.', MissionAction: 'detect and localize forest fires by ground watch', MissionMeans: 'staffed watch stations with optical spotting and radio', MissionContribution: 'ground segment smoke reporting timeline'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4.1_1'})
SET n += {Name: 'District Fire Watch', uuid: '8c305e4e-1b4f-5c0f-8cb8-c2127a56ea4b', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Keep every district under continuous daylight watch.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4.1_1'})
SET n += {Name: 'Lookout Network Environment', uuid: '0907c4a4-36a6-5db8-881a-a4b37f915842', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Ridge-top stations with microwave line-of-sight paths.'};
MERGE (n:SSTPA:State {HID: 'ST_4.1_1'})
SET n += {Name: 'Unstaffed', TransitionKind: 'FUNCTIONAL', uuid: '1de05ddd-c2b7-58a8-b1b1-954c6ed71649', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4.1_2'})
SET n += {Name: 'Watching', TransitionKind: 'FUNCTIONAL', uuid: '4a17eeae-b2d8-5fa6-9a9c-c8be9d7e1d98', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_4.1_1'})
SET n += {Name: 'Watch Station', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '414e2edb-a81f-562d-b8af-71aa4d148fa3', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Staffed lookout with tower, optics, and radio.', TechnologyType: 'Fire lookout station'};
MERGE (n:SSTPA:Component {HID: 'EL_4.1_2'})
SET n += {Name: 'Backhaul Relay', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'f18c988f-686a-595d-a5a0-9beff01f8a86', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Ridge-top microwave relay aggregating station links.', TechnologyType: 'Licensed microwave relay'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1_1'})
SET n += {Name: 'Scan Assigned Districts', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '4a63b69e-69ab-5369-9a13-cb16894a1b13', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sweep assigned sectors on the watch schedule.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1_2'})
SET n += {Name: 'Cross-Fix Smoke Bearings', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'e37f5130-a91c-5f77-a894-37396146bf46', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Triangulate smoke location from multiple stations.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.1_1'})
SET n += {Name: 'Network Backhaul Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '51416ab6-f611-5b97-bdf8-122df6c7e3f9', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Network-side aggregation of station backhaul links.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4.1_1'})
SET n += {Name: 'Cross-Fix Accuracy', Baseline: 'None', Orphan: true, Barren: false, uuid: '3634029b-88fa-559f-bf7a-70fd37c31c71', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Watch Station Network SHALL localize smoke by cross-fix to within 1 kilometer.', VMethod: 'Demonstration', VStatement: 'Cross-fix exercises against surveyed smoke sources.'};
MERGE (n:SSTPA:System {HID: 'SYS_4.1.1_0'})
SET n += {Name: 'Watch Station', uuid: '0ede81ea-1adb-55bd-9c22-fc8e74b47dec', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'One staffed lookout covering its assigned sectors.', MissionAction: 'sight and report smoke in assigned sectors', MissionMeans: 'an observation tower, optical spotting system, and radio', MissionContribution: 'network cross-fix coverage'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4.1.1_1'})
SET n += {Name: 'Sector Watch', uuid: 'aa5c38fa-092a-56f9-95d1-90ea65e99d81', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Continuous daylight watch over assigned sectors.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4.1.1_1'})
SET n += {Name: 'Lookout Site Environment', uuid: '9622b52f-0915-5415-b6e7-9245bb405714', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Exposed ridge-top site on solar and generator power.'};
MERGE (n:SSTPA:State {HID: 'ST_4.1.1_1'})
SET n += {Name: 'Closed', TransitionKind: 'FUNCTIONAL', uuid: '3d2f6f9d-61c2-513f-a2d1-cdb2f2df46db', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4.1.1_2'})
SET n += {Name: 'On Watch', TransitionKind: 'FUNCTIONAL', uuid: '5d9a3b39-a148-59f3-ad36-d7d80a8bfbf2', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_4.1.1_1'})
SET n += {Name: 'Optical Spotting System', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'aa5d36b3-e797-5649-8bd0-dab3cc3d6b8a', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Camera and bearing head for smoke localization.', TechnologyType: 'Long-range camera on calibrated bearing mount'};
MERGE (n:SSTPA:Component {HID: 'EL_4.1.1_2'})
SET n += {Name: 'Observation Tower', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '56daf6c8-21c8-5ba2-accb-d10cc38d09de', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Elevated observation cab and site structure.', TechnologyType: 'Steel lookout tower'};
MERGE (n:SSTPA:Component {HID: 'EL_4.1.1_3'})
SET n += {Name: 'Station Radio', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '13346a2d-e68e-5838-bb74-2853821cbe22', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'P25 base station radio at the lookout.', TechnologyType: 'P25 base station'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1.1_1'})
SET n += {Name: 'Observe Assigned Sectors', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'eb852b4c-99e5-54e7-8bbb-56655655f3d2', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Sweep sectors visually and with the spotting system.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1.1_2'})
SET n += {Name: 'Call Smoke Bearings', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '7f6de5b0-2d8c-5189-b679-b6ab5ccba5a7', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Report azimuth and estimated range for smoke.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.1.1_1'})
SET n += {Name: 'Station Radio Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '8ee651db-dc41-57c4-ba29-f3630584c2f7', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Station endpoint on the ground coordination network.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.1.1_2'})
SET n += {Name: 'Station Backhaul Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '8c9f0c54-3172-5773-a627-1bb8027e69a1', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Station endpoint of the microwave backhaul.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4.1.1_1'})
SET n += {Name: 'Bearing Accuracy', Baseline: 'None', Orphan: true, Barren: false, uuid: 'c6fb6179-f156-5866-aaf5-68718d1be8a7', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Watch Station SHALL report smoke azimuths accurate to within 1 degree.', VMethod: 'Test', VStatement: 'Bearing checks against surveyed landmarks.'};
MERGE (n:SSTPA:System {HID: 'SYS_4.1.1.1_0'})
SET n += {Name: 'Optical Spotting System', uuid: '2c3d4a00-7eb9-5124-8c13-45040be8e88f', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Measures calibrated bearings to observed smoke.', MissionAction: 'image and measure bearings to smoke columns', MissionMeans: 'a long-range camera on a calibrated pan-tilt head', MissionContribution: 'station bearing accuracy'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4.1.1.1_1'})
SET n += {Name: 'Calibrated Spotting', uuid: 'b628e782-29a8-5aa3-ba0e-b7c069d8a747', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bearing-accurate imagery of candidate smoke.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4.1.1.1_1'})
SET n += {Name: 'Spotting Environment', uuid: 'f5c805a9-af3b-532d-a54f-5c6175a354c7', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Heat shimmer, haze, and low sun angles over forest.'};
MERGE (n:SSTPA:State {HID: 'ST_4.1.1.1_1'})
SET n += {Name: 'Stowed', TransitionKind: 'FUNCTIONAL', uuid: 'ca66fcaa-08c6-5bec-9805-a4939891c66c', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4.1.1.1_2'})
SET n += {Name: 'Scanning', TransitionKind: 'FUNCTIONAL', uuid: '26d484b3-aaa0-5159-86ec-ecfc2ca780d6', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_4.1.1.1_1'})
SET n += {Name: 'Spotting Camera', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '33f190d2-35cc-54d1-9018-02f35681026b', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Long-range zoom camera with low-light mode.', TechnologyType: 'Long-range zoom camera'};
MERGE (n:SSTPA:Component {HID: 'EL_4.1.1.1_2'})
SET n += {Name: 'Calibrated Pan-Tilt Head', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c39219db-a900-5741-bd5c-61bfec2c9b72', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Bearing-calibrated positioner and encoder set.', TechnologyType: 'Precision pan-tilt positioner'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1.1.1_1'})
SET n += {Name: 'Image Watch Sectors', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '8ba07c71-1619-585e-abea-38c6a7e065fb', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Capture sector imagery on the scan plan.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.1.1.1_2'})
SET n += {Name: 'Measure Smoke Bearing', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '65b07de6-4c6f-50a7-9cd0-b14def5f6d6b', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Read calibrated azimuth and elevation to target.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.1.1.1_1'})
SET n += {Name: 'Spotting Data Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '7fba5576-f318-5466-b51f-a05b19a38aef', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Imagery and bearing output to the station systems.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4.1.1.1_1'})
SET n += {Name: 'Mount Calibration', Baseline: 'None', Orphan: true, Barren: true, uuid: 'e7d0ae6b-3f7a-5408-bfd9-41614e7eaa1c', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.1.1.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Optical Spotting System SHALL hold bearing calibration within 0.2 degrees between checks.', VMethod: 'Test', VStatement: 'Repeatability runs against surveyed landmarks.'};
MERGE (n:SSTPA:System {HID: 'SYS_4.2_0'})
SET n += {Name: 'Vehicle Fleet', uuid: '147fbf62-0742-5f5a-97dd-8e8f3f37b490', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fights fires and sustains crews across the districts.', MissionAction: 'fight fires and move logistics in the districts', MissionMeans: 'fire engines, logistics trucks, and fuel tenders', MissionContribution: 'ground segment response and sustainment'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4.2_1'})
SET n += {Name: 'District Response Fleet', uuid: 'aa8185d4-e3d5-56ba-8efd-bf4ecbf3f056', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Engines on the fire line, supplies on the road.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4.2_1'})
SET n += {Name: 'Forest Road Environment', uuid: '58c33af5-3280-5672-9f5b-f9aa453b2cb9', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Unimproved forest roads, dust, grades, and river fords.'};
MERGE (n:SSTPA:State {HID: 'ST_4.2_1'})
SET n += {Name: 'Motor Pool', TransitionKind: 'FUNCTIONAL', uuid: 'fbf64147-535e-5df2-9b8d-67742b9c3e32', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4.2_2'})
SET n += {Name: 'Dispatched', TransitionKind: 'FUNCTIONAL', uuid: '1b50e20e-abbb-5ac0-86b7-253e11eb0b91', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_4.2_1'})
SET n += {Name: 'Fire Engine', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'b622f20a-fbe6-503c-b040-1f428d8884aa', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Wildland engine with pump, tank, and crew.', TechnologyType: 'Type 3 wildland engine'};
MERGE (n:SSTPA:Component {HID: 'EL_4.2_2'})
SET n += {Name: 'Logistics Truck', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6eea8b7b-ba56-59bf-b98e-78cf90a77d93', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Supply truck running district resupply circuits.', TechnologyType: 'All-wheel-drive supply truck'};
MERGE (n:SSTPA:Component {HID: 'EL_4.2_3'})
SET n += {Name: 'Fuel Tender', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'dc0c7045-6484-5540-ba12-b19a6d6b730b', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Mobile fueling for engines and equipment.', TechnologyType: 'Wildland fuel tender'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.2_1'})
SET n += {Name: 'Crew And Position Engines', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '06a6786e-ae97-5a6c-9cfc-79ed28c92efd', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Stage crewed engines against district risk.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.2_2'})
SET n += {Name: 'Run Logistics Circuits', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '3e7adbcd-dc5b-50fd-abe7-8edaddba88d1', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver water, fuel, and supplies to committed crews.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.2_1'})
SET n += {Name: 'Fleet Data Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a902587e-38e8-565c-adf8-6d38d25fa866', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Fleet tracking and resupply data endpoint.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4.2_1'})
SET n += {Name: 'Fleet Readiness', Baseline: 'None', Orphan: true, Barren: true, uuid: '7c13f917-4ae6-55e3-8128-12a3213b6e9f', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Vehicle Fleet SHALL keep at least 90 percent of engines mission-capable through fire season.', VMethod: 'Analysis', VStatement: 'Maintenance readiness reporting rollup.'};
MERGE (n:SSTPA:System {HID: 'SYS_4.2.1_0'})
SET n += {Name: 'Fire Engine', uuid: '9ebb1220-8ec2-579f-8ee0-8e8ee1cef043', TypeName: 'System', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 0, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'One crewed engine applying water on the fire line.', MissionAction: 'apply water and crew work on the fire line', MissionMeans: 'a pump-and-roll wildland engine with tactical radio', MissionContribution: 'fleet district response'};
MERGE (n:SSTPA:Purpose {HID: 'PUR_4.2.1_1'})
SET n += {Name: 'Line Engine', uuid: '3c4cf8ca-fccb-5571-80bd-21378abd4682', TypeName: 'Purpose', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'First water on the fire and crew mobility.'};
MERGE (n:SSTPA:Environment {HID: 'ENV_4.2.1_1'})
SET n += {Name: 'Fire Line Environment', uuid: '29accccc-db45-5906-b6d5-259cecf77f7a', TypeName: 'Environment', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), Context: 'Heat, smoke, and grade operations near active fire.'};
MERGE (n:SSTPA:State {HID: 'ST_4.2.1_1'})
SET n += {Name: 'Staged', TransitionKind: 'FUNCTIONAL', uuid: 'a9f6dee2-79ca-52a4-b425-d1a192496fb8', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 0};
MERGE (n:SSTPA:State {HID: 'ST_4.2.1_2'})
SET n += {Name: 'Pumping', TransitionKind: 'FUNCTIONAL', uuid: 'ef7a930e-640a-5f9f-8628-c99622771cb6', TypeName: 'State', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), StateSequence: 1};
MERGE (n:SSTPA:Component {HID: 'EL_4.2.1_1'})
SET n += {Name: 'Pump Module', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'a6c8ec6c-56ea-5ff5-99f2-3367e8891ec2', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Engine-driven pump and plumbing.', TechnologyType: 'PTO-driven centrifugal pump'};
MERGE (n:SSTPA:Component {HID: 'EL_4.2.1_2'})
SET n += {Name: 'Water Tank', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '56e9ef89-b536-571e-85a5-cbd05cdd25ce', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'On-board water tank and foam cell.', TechnologyType: 'Baffled poly tank with foam cell'};
MERGE (n:SSTPA:Component {HID: 'EL_4.2.1_3'})
SET n += {Name: 'Vehicle Radio', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c4c15e60-f6e9-59fe-8a0d-d18d04f1aedf', TypeName: 'Component', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 3, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Mobile P25 and VHF tactical radio set.', TechnologyType: 'Dual-band mobile radio'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.2.1_1'})
SET n += {Name: 'Pump And Roll Water', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: 'c02b698e-f7e2-5ffd-9c6d-8d2c4efa1653', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Deliver pumped water while moving along the line.'};
MERGE (n:SSTPA:SystemFunction {HID: 'FUN_4.2.1_2'})
SET n += {Name: 'Hold Tactical Net Check', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '6ddef694-d840-55f1-96e0-9c6227cdcf28', TypeName: 'SystemFunction', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Keep the crew on the coordination and air nets.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.2.1_1'})
SET n += {Name: 'Engine Radio Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '73709818-7d96-5fd0-ab5f-bae70b1be562', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Engine endpoint on the ground coordination network.'};
MERGE (n:SSTPA:Interface {HID: 'INT_4.2.1_2'})
SET n += {Name: 'Engine Air-Net Interface', SafetyCritical: false, MissionCritical: false, FlightCritical: false, SecurityCritical: false, Confidentiality: false, Availability: false, Authenticity: false, NonRepudiation: false, Certifiable: false, Privacy: false, Trustworthy: false, uuid: '06c0d379-b90a-5629-8cd6-99eacee49c31', TypeName: 'Interface', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 2, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), ShortDescription: 'Engine endpoint on the tactical air-ground net.'};
MERGE (n:SSTPA:Requirement {HID: 'REQ_4.2.1_1'})
SET n += {Name: 'Engine Pump Flow', Baseline: 'None', Orphan: true, Barren: true, uuid: '58273396-3300-5830-b88f-cc19b1a2546c', TypeName: 'Requirement', Owner: 'SSTPA Tools', OwnerEmail: 'tools@sstpa.example', Creator: 'SSTPA Tools', CreatorEmail: 'tools@sstpa.example', VersionID: '0.7', SoIIndex: '4.2.1', Sequence: 1, Created: localdatetime('2026-07-04T17:12:15'), LastTouch: localdatetime('2026-07-04T17:12:15'), RStatement: 'The Fire Engine SHALL sustain 150 gallons per minute while moving at crew walking pace.', VMethod: 'Test', VStatement: 'Pump-and-roll flow test on grade.'};

// ---- Relationships ----

MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'REQ__1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'REQ__2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'REQ__3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'SYS_1_0'})
MERGE (a)-[r:HAS_SYSTEM]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'PUR_1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'ENV_1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'ST_1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'ST_1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'ST_1_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'ST_1_4'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1_1'}), (b:SSTPA {HID: 'ST_1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Launch and separation complete'};
MATCH (a:SSTPA {HID: 'ST_1_2'}), (b:SSTPA {HID: 'ST_1_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'On-orbit acceptance review passed'};
MATCH (a:SSTPA {HID: 'ST_1_3'}), (b:SSTPA {HID: 'ST_1_4'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Spacecraft fault or ground command'};
MATCH (a:SSTPA {HID: 'ST_1_4'}), (b:SSTPA {HID: 'ST_1_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fault cleared and ground release'};
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'EL_1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'EL_1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'FUN_1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_1'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'FUN_1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_2'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'FUN_1_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_3'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'FUN_1_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_4'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_1'}), (b:SSTPA {HID: 'FUN_1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'CNN_1_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'CNN_1_1'}), (b:SSTPA {HID: 'REQ_1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'CNN_1_2'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'INT_1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1_1'}), (b:SSTPA {HID: 'FUN_1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1_1'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'INT_1_1'}), (b:SSTPA {HID: 'REQ_1_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1_0'}), (b:SSTPA {HID: 'INT_1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1_2'}), (b:SSTPA {HID: 'FUN_1_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1_2'}), (b:SSTPA {HID: 'EL_1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_2'}), (b:SSTPA {HID: 'INT_1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_1_3'}), (b:SSTPA {HID: 'INT_1_2'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1_1'}), (b:SSTPA {HID: 'REQ_1_3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1_1'}), (b:SSTPA {HID: 'REQ_1_4'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1_1'}), (b:SSTPA {HID: 'REQ_1_5'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1_1'}), (b:SSTPA {HID: 'SYS_1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'PUR_1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'ENV_1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'ST_1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'ST_1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'ST_1.1_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1_1'}), (b:SSTPA {HID: 'ST_1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Separation switch release'};
MATCH (a:SSTPA {HID: 'ST_1.1_2'}), (b:SSTPA {HID: 'ST_1.1_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Ground release to operations'};
MATCH (a:SSTPA {HID: 'ST_1.1_3'}), (b:SSTPA {HID: 'ST_1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fault protection trip'};
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'EL_1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'EL_1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'EL_1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'EL_1.1_4'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'FUN_1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_1'}), (b:SSTPA {HID: 'EL_1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'FUN_1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_2'}), (b:SSTPA {HID: 'EL_1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'FUN_1.1_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_3'}), (b:SSTPA {HID: 'EL_1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'FUN_1.1_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_4'}), (b:SSTPA {HID: 'EL_1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_3'}), (b:SSTPA {HID: 'FUN_1.1_4'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'CNN_1.1_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'INT_1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1_1'}), (b:SSTPA {HID: 'FUN_1.1_4'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1_1'}), (b:SSTPA {HID: 'EL_1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1_0'}), (b:SSTPA {HID: 'INT_1.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1_2'}), (b:SSTPA {HID: 'FUN_1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1_2'}), (b:SSTPA {HID: 'EL_1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1_4'}), (b:SSTPA {HID: 'INT_1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1_1'}), (b:SSTPA {HID: 'REQ_1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1_1'}), (b:SSTPA {HID: 'REQ_1.1_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1_1'}), (b:SSTPA {HID: 'REQ_1.1_3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1_1'}), (b:SSTPA {HID: 'SYS_1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'PUR_1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'ENV_1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.1_1'}), (b:SSTPA {HID: 'ST_1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Payload support enabled'};
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1_4'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1_2'}), (b:SSTPA {HID: 'EL_1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1_3'}), (b:SSTPA {HID: 'EL_1.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1_4'}), (b:SSTPA {HID: 'EL_1.1.1_4'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.1_4'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1_4'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1_2'}), (b:SSTPA {HID: 'FUN_1.1.1_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1_2'}), (b:SSTPA {HID: 'EL_1.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1_3'}), (b:SSTPA {HID: 'INT_1.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.1_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.1_1'}), (b:SSTPA {HID: 'SYS_1.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'PUR_1.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'ENV_1.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.1.1_1'}), (b:SSTPA {HID: 'ST_1.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Star tracker lock acquired'};
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1.1_2'}), (b:SSTPA {HID: 'EL_1.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1.1_2'}), (b:SSTPA {HID: 'INT_1.1.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.1.1_1'}), (b:SSTPA {HID: 'SYS_1.1.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'PUR_1.1.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'ENV_1.1.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.1.1.1_1'}), (b:SSTPA {HID: 'ST_1.1.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Wheel enable command'};
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.1.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.1.1.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1_2'}), (b:SSTPA {HID: 'SYS_1.1.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'PUR_1.1.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'ENV_1.1.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'ST_1.1.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'ST_1.1.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2_1'}), (b:SSTPA {HID: 'ST_1.1.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Payload enable over lit ground track'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_1'}), (b:SSTPA {HID: 'EL_1.1.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_2'}), (b:SSTPA {HID: 'EL_1.1.2_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_3'}), (b:SSTPA {HID: 'EL_1.1.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_2'}), (b:SSTPA {HID: 'FUN_1.1.2_3'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'CNN_1.1.2_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'INT_1.1.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2_1'}), (b:SSTPA {HID: 'EL_1.1.2_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2_0'}), (b:SSTPA {HID: 'INT_1.1.2_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2_2'}), (b:SSTPA {HID: 'FUN_1.1.2_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2_2'}), (b:SSTPA {HID: 'EL_1.1.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2_3'}), (b:SSTPA {HID: 'INT_1.1.2_2'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2_1'}), (b:SSTPA {HID: 'SYS_1.1.2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'PUR_1.1.2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'ENV_1.1.2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.1_1'}), (b:SSTPA {HID: 'ST_1.1.2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Cryocooler at setpoint'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1_2'}), (b:SSTPA {HID: 'EL_1.1.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1_0'}), (b:SSTPA {HID: 'INT_1.1.2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1_2'}), (b:SSTPA {HID: 'INT_1.1.2.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2.1_2'}), (b:SSTPA {HID: 'SYS_1.1.2.1.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'PUR_1.1.2.1.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'ENV_1.1.2.1.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.1.2_1'}), (b:SSTPA {HID: 'ST_1.1.2.1.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Bias enable at temperature'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2_2'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2_0'}), (b:SSTPA {HID: 'INT_1.1.2.1.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.1.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2.1.2_1'}), (b:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'PUR_1.1.2.1.2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'ENV_1.1.2.1.2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Detector bias applied'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1_2'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1_0'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1_2'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'PUR_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'ENV_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Frame clock started'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'PUR_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'ENV_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'ST_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Video enable'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_2'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.1.2.1.1.1_0'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'EL_1.1.2.1.2.1.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.1.2.1.1.1_2'}), (b:SSTPA {HID: 'INT_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_1.1.2_2'}), (b:SSTPA {HID: 'SYS_1.1.2.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'PUR_1.1.2.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'ENV_1.1.2.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'ST_1.1.2.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'ST_1.1.2.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_1.1.2.2_1'}), (b:SSTPA {HID: 'ST_1.1.2.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Ground station in view'};
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'EL_1.1.2.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.2_1'}), (b:SSTPA {HID: 'EL_1.1.2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'FUN_1.1.2.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.2_2'}), (b:SSTPA {HID: 'EL_1.1.2.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2.2_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_1.1.2.2_0'}), (b:SSTPA {HID: 'INT_1.1.2.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.2_1'}), (b:SSTPA {HID: 'FUN_1.1.2.2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.2_1'}), (b:SSTPA {HID: 'EL_1.1.2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'INT_1.1.2.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'FUN_1.1.2.2_2'}), (b:SSTPA {HID: 'INT_1.1.2.2_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_1.1.2.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2.2_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'SYS_2_0'})
MERGE (a)-[r:HAS_SYSTEM]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'PUR_2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'ENV_2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'ST_2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'ST_2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'ST_2_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'ST_2_4'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2_1'}), (b:SSTPA {HID: 'ST_2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Daily operations start'};
MATCH (a:SSTPA {HID: 'ST_2_2'}), (b:SSTPA {HID: 'ST_2_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Major fire incident declared'};
MATCH (a:SSTPA {HID: 'ST_2_2'}), (b:SSTPA {HID: 'ST_2_4'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Loss of primary power or comms'};
MATCH (a:SSTPA {HID: 'ST_2_3'}), (b:SSTPA {HID: 'ST_2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Incidents contained'};
MATCH (a:SSTPA {HID: 'ST_2_4'}), (b:SSTPA {HID: 'ST_2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Primary services restored'};
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'EL_2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'EL_2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'FUN_2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_1'}), (b:SSTPA {HID: 'EL_2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'FUN_2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_2'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'FUN_2_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_3'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'FUN_2_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_4'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'FUN_2_5'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_5'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_1'}), (b:SSTPA {HID: 'FUN_2_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_2'}), (b:SSTPA {HID: 'FUN_2_3'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_2'}), (b:SSTPA {HID: 'FUN_2_4'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'CNN_2_1'}), (b:SSTPA {HID: 'REQ_2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'CNN_2_3'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'INT_2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2_1'}), (b:SSTPA {HID: 'FUN_2_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2_1'}), (b:SSTPA {HID: 'EL_2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'INT_2_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2_2'}), (b:SSTPA {HID: 'FUN_2_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2_2'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'INT_2_3'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2_3'}), (b:SSTPA {HID: 'FUN_2_4'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2_3'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'INT_2_4'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2_4'}), (b:SSTPA {HID: 'FUN_2_5'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2_4'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2_0'}), (b:SSTPA {HID: 'INT_2_5'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2_5'}), (b:SSTPA {HID: 'FUN_2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2_5'}), (b:SSTPA {HID: 'EL_2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_3'}), (b:SSTPA {HID: 'INT_2_2'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_4'}), (b:SSTPA {HID: 'INT_2_3'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_2_5'}), (b:SSTPA {HID: 'INT_2_4'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_2_1'}), (b:SSTPA {HID: 'REQ_2_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_2_1'}), (b:SSTPA {HID: 'REQ_2_3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_2_1'}), (b:SSTPA {HID: 'REQ_2_4'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2_1'}), (b:SSTPA {HID: 'SYS_2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'PUR_2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'ENV_2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'ST_2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'ST_2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.1_1'}), (b:SSTPA {HID: 'ST_2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Scheduled pass start'};
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'EL_2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'EL_2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'EL_2.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'FUN_2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1_1'}), (b:SSTPA {HID: 'EL_2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'FUN_2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1_2'}), (b:SSTPA {HID: 'EL_2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'FUN_2.1_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1_3'}), (b:SSTPA {HID: 'EL_2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'INT_2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1_1'}), (b:SSTPA {HID: 'FUN_2.1_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1_1'}), (b:SSTPA {HID: 'EL_2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1_0'}), (b:SSTPA {HID: 'INT_2.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1_2'}), (b:SSTPA {HID: 'FUN_2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1_2'}), (b:SSTPA {HID: 'EL_2.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1_2'}), (b:SSTPA {HID: 'INT_2.1_2'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1_3'}), (b:SSTPA {HID: 'INT_2.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.1_1'}), (b:SSTPA {HID: 'REQ_2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2.1_1'}), (b:SSTPA {HID: 'SYS_2.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'PUR_2.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'ENV_2.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'ST_2.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'ST_2.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.1.1_1'}), (b:SSTPA {HID: 'ST_2.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Carrier lock'};
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'EL_2.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'EL_2.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'EL_2.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'FUN_2.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1_1'}), (b:SSTPA {HID: 'EL_2.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'FUN_2.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1_2'}), (b:SSTPA {HID: 'EL_2.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1_1'}), (b:SSTPA {HID: 'FUN_2.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1_0'}), (b:SSTPA {HID: 'INT_2.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1.1_1'}), (b:SSTPA {HID: 'FUN_2.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1.1_1'}), (b:SSTPA {HID: 'EL_2.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1.1_1'}), (b:SSTPA {HID: 'REQ_2.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1_2'}), (b:SSTPA {HID: 'INT_2.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.1.1_1'}), (b:SSTPA {HID: 'REQ_2.1.1_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2.1.1_1'}), (b:SSTPA {HID: 'SYS_2.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'PUR_2.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'ENV_2.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'ST_2.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'ST_2.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.1.1.1_1'}), (b:SSTPA {HID: 'ST_2.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Receive chain enabled'};
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'EL_2.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'EL_2.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'FUN_2.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1.1_1'}), (b:SSTPA {HID: 'EL_2.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'FUN_2.1.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1.1_2'}), (b:SSTPA {HID: 'EL_2.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1.1_1'}), (b:SSTPA {HID: 'FUN_2.1.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.1.1.1_0'}), (b:SSTPA {HID: 'INT_2.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1.1.1_1'}), (b:SSTPA {HID: 'FUN_2.1.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.1.1.1_1'}), (b:SSTPA {HID: 'EL_2.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.1.1.1_2'}), (b:SSTPA {HID: 'INT_2.1.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.1.1.1_1'}), (b:SSTPA {HID: 'REQ_2.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2_2'}), (b:SSTPA {HID: 'SYS_2.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'PUR_2.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'ENV_2.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'ST_2.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'ST_2.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.2_1'}), (b:SSTPA {HID: 'ST_2.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Confirmed detection assigned'};
MATCH (a:SSTPA {HID: 'ST_2.2_2'}), (b:SSTPA {HID: 'ST_2.2_1'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Incident closed'};
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'EL_2.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'EL_2.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'EL_2.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'FUN_2.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2_1'}), (b:SSTPA {HID: 'EL_2.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'FUN_2.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2_2'}), (b:SSTPA {HID: 'EL_2.2_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'FUN_2.2_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2_3'}), (b:SSTPA {HID: 'EL_2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2_1'}), (b:SSTPA {HID: 'FUN_2.2_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'CNN_2.2_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'INT_2.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2_1'}), (b:SSTPA {HID: 'FUN_2.2_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2_1'}), (b:SSTPA {HID: 'EL_2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2_0'}), (b:SSTPA {HID: 'INT_2.2_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2_2'}), (b:SSTPA {HID: 'FUN_2.2_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2_2'}), (b:SSTPA {HID: 'EL_2.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2_3'}), (b:SSTPA {HID: 'INT_2.2_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.2_1'}), (b:SSTPA {HID: 'REQ_2.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2.2_1'}), (b:SSTPA {HID: 'SYS_2.2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'PUR_2.2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'ENV_2.2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'ST_2.2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'ST_2.2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.2.1_1'}), (b:SSTPA {HID: 'ST_2.2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fusion services released'};
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'EL_2.2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'EL_2.2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'FUN_2.2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.1_1'}), (b:SSTPA {HID: 'EL_2.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'FUN_2.2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.1_2'}), (b:SSTPA {HID: 'EL_2.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.1_1'}), (b:SSTPA {HID: 'FUN_2.2.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.1_0'}), (b:SSTPA {HID: 'INT_2.2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.1_1'}), (b:SSTPA {HID: 'FUN_2.2.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.1_1'}), (b:SSTPA {HID: 'EL_2.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.2.1_1'}), (b:SSTPA {HID: 'REQ_2.2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_2.2_2'}), (b:SSTPA {HID: 'SYS_2.2.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'PUR_2.2.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'ENV_2.2.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'ST_2.2.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'ST_2.2.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_2.2.2_1'}), (b:SSTPA {HID: 'ST_2.2.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'All gateways verified'};
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'EL_2.2.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'EL_2.2.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'EL_2.2.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'FUN_2.2.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.2_1'}), (b:SSTPA {HID: 'EL_2.2.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'FUN_2.2.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.2_2'}), (b:SSTPA {HID: 'EL_2.2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'FUN_2.2.2_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_2.2.2_3'}), (b:SSTPA {HID: 'EL_2.2.2_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'INT_2.2.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.2_1'}), (b:SSTPA {HID: 'FUN_2.2.2_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.2_1'}), (b:SSTPA {HID: 'EL_2.2.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_2.2.2_0'}), (b:SSTPA {HID: 'INT_2.2.2_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.2_2'}), (b:SSTPA {HID: 'FUN_2.2.2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_2.2.2_2'}), (b:SSTPA {HID: 'EL_2.2.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_2.2.2_1'}), (b:SSTPA {HID: 'REQ_2.2.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'SYS_3_0'})
MERGE (a)-[r:HAS_SYSTEM]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'PUR_3_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'ENV_3_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'ST_3_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'ST_3_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'ST_3_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3_1'}), (b:SSTPA {HID: 'ST_3_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fire season readiness posture set'};
MATCH (a:SSTPA {HID: 'ST_3_2'}), (b:SSTPA {HID: 'ST_3_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Tasking order accepted'};
MATCH (a:SSTPA {HID: 'ST_3_3'}), (b:SSTPA {HID: 'ST_3_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Tasking complete and aircraft recovered'};
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'EL_3_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'EL_3_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'EL_3_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'FUN_3_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_1'}), (b:SSTPA {HID: 'EL_3_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'FUN_3_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_2'}), (b:SSTPA {HID: 'EL_3_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'FUN_3_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_3'}), (b:SSTPA {HID: 'EL_3_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'FUN_3_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_4'}), (b:SSTPA {HID: 'EL_3_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'FUN_3_5'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_5'}), (b:SSTPA {HID: 'EL_3_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_1'}), (b:SSTPA {HID: 'FUN_3_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_1'}), (b:SSTPA {HID: 'FUN_3_3'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'CNN_3_1'}), (b:SSTPA {HID: 'REQ_3_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'INT_3_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3_1'}), (b:SSTPA {HID: 'FUN_3_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3_1'}), (b:SSTPA {HID: 'EL_3_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3_0'}), (b:SSTPA {HID: 'INT_3_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3_2'}), (b:SSTPA {HID: 'FUN_3_5'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3_2'}), (b:SSTPA {HID: 'EL_3_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_4'}), (b:SSTPA {HID: 'INT_3_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_3_5'}), (b:SSTPA {HID: 'INT_3_2'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_3_1'}), (b:SSTPA {HID: 'REQ_3_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_3_1'}), (b:SSTPA {HID: 'REQ_3_3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_3_1'}), (b:SSTPA {HID: 'REQ_3_4'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3_1'}), (b:SSTPA {HID: 'SYS_3.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'PUR_3.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'ENV_3.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'ST_3.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'ST_3.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.1_1'}), (b:SSTPA {HID: 'ST_3.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Launch order'};
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'EL_3.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'EL_3.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'FUN_3.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1_1'}), (b:SSTPA {HID: 'EL_3.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'FUN_3.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1_2'}), (b:SSTPA {HID: 'EL_3.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1_2'}), (b:SSTPA {HID: 'FUN_3.1_1'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1_0'}), (b:SSTPA {HID: 'INT_3.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1_1'}), (b:SSTPA {HID: 'FUN_3.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1_1'}), (b:SSTPA {HID: 'EL_3.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.1_1'}), (b:SSTPA {HID: 'REQ_3.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3.1_1'}), (b:SSTPA {HID: 'SYS_3.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'PUR_3.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'ENV_3.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'ST_3.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'ST_3.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'ST_3.1.1_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.1.1_1'}), (b:SSTPA {HID: 'ST_3.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Cleared onto the drop line'};
MATCH (a:SSTPA {HID: 'ST_3.1.1_2'}), (b:SSTPA {HID: 'ST_3.1.1_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Load released'};
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'FUN_3.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1_1'}), (b:SSTPA {HID: 'EL_3.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'FUN_3.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1_2'}), (b:SSTPA {HID: 'EL_3.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'FUN_3.1.1_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1_3'}), (b:SSTPA {HID: 'EL_3.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'CNN_3.1.1_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'INT_3.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1_1'}), (b:SSTPA {HID: 'FUN_3.1.1_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1_1'}), (b:SSTPA {HID: 'EL_3.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1_0'}), (b:SSTPA {HID: 'INT_3.1.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1_2'}), (b:SSTPA {HID: 'FUN_3.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1_2'}), (b:SSTPA {HID: 'EL_3.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1_3'}), (b:SSTPA {HID: 'INT_3.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.1.1_1'}), (b:SSTPA {HID: 'REQ_3.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3.1.1_1'}), (b:SSTPA {HID: 'SYS_3.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'PUR_3.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'ENV_3.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'ST_3.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'ST_3.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.1.1.1_1'}), (b:SSTPA {HID: 'ST_3.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Drop command'};
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'EL_3.1.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'FUN_3.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1.1_1'}), (b:SSTPA {HID: 'EL_3.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.1_0'}), (b:SSTPA {HID: 'INT_3.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1.1_1'}), (b:SSTPA {HID: 'FUN_3.1.1.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1.1_1'}), (b:SSTPA {HID: 'EL_3.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.1.1.1_1'}), (b:SSTPA {HID: 'REQ_3.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3.1.1_2'}), (b:SSTPA {HID: 'SYS_3.1.1.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'PUR_3.1.1.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'ENV_3.1.1.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'ST_3.1.1.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'ST_3.1.1.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.1.1.2_1'}), (b:SSTPA {HID: 'ST_3.1.1.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Avionics master on'};
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'EL_3.1.1.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'EL_3.1.1.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'EL_3.1.1.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'EL_3.1.1.2_4'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'FUN_3.1.1.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1.2_1'}), (b:SSTPA {HID: 'EL_3.1.1.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'FUN_3.1.1.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1.2_2'}), (b:SSTPA {HID: 'EL_3.1.1.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'FUN_3.1.1.2_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1.2_3'}), (b:SSTPA {HID: 'EL_3.1.1.2_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.1.1.2_0'}), (b:SSTPA {HID: 'INT_3.1.1.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1.2_1'}), (b:SSTPA {HID: 'FUN_3.1.1.2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.1.1.2_1'}), (b:SSTPA {HID: 'EL_3.1.1.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.1.1.2_2'}), (b:SSTPA {HID: 'INT_3.1.1.2_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.1.1.2_1'}), (b:SSTPA {HID: 'REQ_3.1.1.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3_2'}), (b:SSTPA {HID: 'SYS_3.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'PUR_3.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'ENV_3.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'ST_3.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'ST_3.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.2_1'}), (b:SSTPA {HID: 'ST_3.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Jump tasking accepted'};
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'EL_3.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'EL_3.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'FUN_3.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.2_1'}), (b:SSTPA {HID: 'EL_3.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'FUN_3.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.2_2'}), (b:SSTPA {HID: 'EL_3.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2_0'}), (b:SSTPA {HID: 'INT_3.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.2_1'}), (b:SSTPA {HID: 'FUN_3.2_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.2_1'}), (b:SSTPA {HID: 'EL_3.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.2_1'}), (b:SSTPA {HID: 'REQ_3.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3.2_1'}), (b:SSTPA {HID: 'SYS_3.2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'PUR_3.2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'ENV_3.2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'ST_3.2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'ST_3.2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.2.1_1'}), (b:SSTPA {HID: 'ST_3.2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Spotter calls the run-in'};
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'EL_3.2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'EL_3.2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'FUN_3.2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.2.1_1'}), (b:SSTPA {HID: 'EL_3.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'FUN_3.2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.2.1_2'}), (b:SSTPA {HID: 'EL_3.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.2.1_0'}), (b:SSTPA {HID: 'INT_3.2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.2.1_1'}), (b:SSTPA {HID: 'FUN_3.2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.2.1_1'}), (b:SSTPA {HID: 'EL_3.2.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.2.1_1'}), (b:SSTPA {HID: 'REQ_3.2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_3_3'}), (b:SSTPA {HID: 'SYS_3.3_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'PUR_3.3_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'ENV_3.3_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'ST_3.3_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'ST_3.3_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_3.3_1'}), (b:SSTPA {HID: 'ST_3.3_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fire season activation'};
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'EL_3.3_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'EL_3.3_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'EL_3.3_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'FUN_3.3_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.3_1'}), (b:SSTPA {HID: 'EL_3.3_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'FUN_3.3_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.3_2'}), (b:SSTPA {HID: 'EL_3.3_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'FUN_3.3_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_3.3_3'}), (b:SSTPA {HID: 'EL_3.3_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_3.3_0'}), (b:SSTPA {HID: 'INT_3.3_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_3.3_1'}), (b:SSTPA {HID: 'FUN_3.3_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_3.3_1'}), (b:SSTPA {HID: 'EL_3.3_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'PUR_3.3_1'}), (b:SSTPA {HID: 'REQ_3.3_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'CAP__1'}), (b:SSTPA {HID: 'SYS_4_0'})
MERGE (a)-[r:HAS_SYSTEM]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'PUR_4_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'ENV_4_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'ST_4_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'ST_4_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'ST_4_3'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4_1'}), (b:SSTPA {HID: 'ST_4_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fire season staffing complete'};
MATCH (a:SSTPA {HID: 'ST_4_2'}), (b:SSTPA {HID: 'ST_4_3'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Fire confirmed in the district'};
MATCH (a:SSTPA {HID: 'ST_4_3'}), (b:SSTPA {HID: 'ST_4_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Incident contained'};
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'EL_4_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'EL_4_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'EL_4_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'FUN_4_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_1'}), (b:SSTPA {HID: 'EL_4_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'FUN_4_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_2'}), (b:SSTPA {HID: 'EL_4_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'FUN_4_3'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_3'}), (b:SSTPA {HID: 'EL_4_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'FUN_4_4'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_4'}), (b:SSTPA {HID: 'EL_4_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'FUN_4_5'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_5'}), (b:SSTPA {HID: 'EL_4_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_1'}), (b:SSTPA {HID: 'FUN_4_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'CNN_4_1'})
MERGE (a)-[r:HAS_CONNECTION]->(b);
MATCH (a:SSTPA {HID: 'CNN_4_1'}), (b:SSTPA {HID: 'REQ_4_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'INT_4_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4_1'}), (b:SSTPA {HID: 'FUN_4_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4_1'}), (b:SSTPA {HID: 'FUN_4_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4_1'}), (b:SSTPA {HID: 'EL_4_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'INT_4_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4_2'}), (b:SSTPA {HID: 'FUN_4_3'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4_2'}), (b:SSTPA {HID: 'EL_4_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4_0'}), (b:SSTPA {HID: 'INT_4_3'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4_3'}), (b:SSTPA {HID: 'FUN_4_5'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4_3'}), (b:SSTPA {HID: 'EL_4_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_2'}), (b:SSTPA {HID: 'INT_4_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'FUN_4_5'}), (b:SSTPA {HID: 'INT_4_3'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4_1'}), (b:SSTPA {HID: 'REQ_4_2'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_4_1'}), (b:SSTPA {HID: 'REQ_4_3'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'PUR_4_1'}), (b:SSTPA {HID: 'REQ_4_4'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_4_1'}), (b:SSTPA {HID: 'SYS_4.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'PUR_4.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'ENV_4.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'ST_4.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'ST_4.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4.1_1'}), (b:SSTPA {HID: 'ST_4.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Season staffing in place'};
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'EL_4.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'EL_4.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'FUN_4.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1_1'}), (b:SSTPA {HID: 'EL_4.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'FUN_4.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1_2'}), (b:SSTPA {HID: 'EL_4.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1_0'}), (b:SSTPA {HID: 'INT_4.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1_1'}), (b:SSTPA {HID: 'FUN_4.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1_1'}), (b:SSTPA {HID: 'EL_4.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1_2'}), (b:SSTPA {HID: 'INT_4.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4.1_1'}), (b:SSTPA {HID: 'REQ_4.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_4.1_1'}), (b:SSTPA {HID: 'SYS_4.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'PUR_4.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'ENV_4.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'ST_4.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'ST_4.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4.1.1_1'}), (b:SSTPA {HID: 'ST_4.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Observer on station'};
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'EL_4.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'EL_4.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'EL_4.1.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'FUN_4.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1_1'}), (b:SSTPA {HID: 'EL_4.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'FUN_4.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1_2'}), (b:SSTPA {HID: 'EL_4.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1_1'}), (b:SSTPA {HID: 'FUN_4.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'INT_4.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1_1'}), (b:SSTPA {HID: 'FUN_4.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1_1'}), (b:SSTPA {HID: 'EL_4.1.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1_0'}), (b:SSTPA {HID: 'INT_4.1.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1_2'}), (b:SSTPA {HID: 'FUN_4.1.1_1'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1_2'}), (b:SSTPA {HID: 'EL_4.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1_2'}), (b:SSTPA {HID: 'INT_4.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4.1.1_1'}), (b:SSTPA {HID: 'REQ_4.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_4.1.1_1'}), (b:SSTPA {HID: 'SYS_4.1.1.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'PUR_4.1.1.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'ENV_4.1.1.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'ST_4.1.1.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'ST_4.1.1.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4.1.1.1_1'}), (b:SSTPA {HID: 'ST_4.1.1.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'Watch schedule start'};
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'EL_4.1.1.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'EL_4.1.1.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'FUN_4.1.1.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1.1_1'}), (b:SSTPA {HID: 'EL_4.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'FUN_4.1.1.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1.1_2'}), (b:SSTPA {HID: 'EL_4.1.1.1_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1.1_1'}), (b:SSTPA {HID: 'FUN_4.1.1.1_2'})
MERGE (a)-[r:FLOWS_TO_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.1.1.1_0'}), (b:SSTPA {HID: 'INT_4.1.1.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1.1_1'}), (b:SSTPA {HID: 'FUN_4.1.1.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.1.1.1_1'}), (b:SSTPA {HID: 'EL_4.1.1.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.1.1.1_2'}), (b:SSTPA {HID: 'INT_4.1.1.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4.1.1.1_1'}), (b:SSTPA {HID: 'REQ_4.1.1.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_4_2'}), (b:SSTPA {HID: 'SYS_4.2_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'PUR_4.2_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'ENV_4.2_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'ST_4.2_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'ST_4.2_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4.2_1'}), (b:SSTPA {HID: 'ST_4.2_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'District dispatch order'};
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'EL_4.2_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'EL_4.2_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'EL_4.2_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'FUN_4.2_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2_1'}), (b:SSTPA {HID: 'EL_4.2_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'FUN_4.2_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2_2'}), (b:SSTPA {HID: 'EL_4.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2_0'}), (b:SSTPA {HID: 'INT_4.2_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2_1'}), (b:SSTPA {HID: 'FUN_4.2_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2_1'}), (b:SSTPA {HID: 'EL_4.2_2'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2_2'}), (b:SSTPA {HID: 'INT_4.2_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4.2_1'}), (b:SSTPA {HID: 'REQ_4.2_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'EL_4.2_1'}), (b:SSTPA {HID: 'SYS_4.2.1_0'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'PUR_4.2.1_1'})
MERGE (a)-[r:REALIZES]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'ENV_4.2.1_1'})
MERGE (a)-[r:ACTS_IN]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'ST_4.2.1_1'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'ST_4.2.1_2'})
MERGE (a)-[r:EXHIBITS]->(b);
MATCH (a:SSTPA {HID: 'ST_4.2.1_1'}), (b:SSTPA {HID: 'ST_4.2.1_2'})
MERGE (a)-[r:TRANSITIONS_TO]->(b)
SET r += {TransitionKind: 'FUNCTIONAL', Trigger: 'On the line with water on'};
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'EL_4.2.1_1'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'EL_4.2.1_2'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'EL_4.2.1_3'})
MERGE (a)-[r:HAS_ELEMENT]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'FUN_4.2.1_1'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2.1_1'}), (b:SSTPA {HID: 'EL_4.2.1_1'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'FUN_4.2.1_2'})
MERGE (a)-[r:HAS_FUNCTION]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2.1_2'}), (b:SSTPA {HID: 'EL_4.2.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'INT_4.2.1_1'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2.1_1'}), (b:SSTPA {HID: 'FUN_4.2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2.1_1'}), (b:SSTPA {HID: 'EL_4.2.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'SYS_4.2.1_0'}), (b:SSTPA {HID: 'INT_4.2.1_2'})
MERGE (a)-[r:HAS_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2.1_2'}), (b:SSTPA {HID: 'FUN_4.2.1_2'})
MERGE (a)-[r:CONNECTS]->(b);
MATCH (a:SSTPA {HID: 'INT_4.2.1_2'}), (b:SSTPA {HID: 'EL_4.2.1_3'})
MERGE (a)-[r:ALLOCATED_TO]->(b);
MATCH (a:SSTPA {HID: 'FUN_4.2.1_2'}), (b:SSTPA {HID: 'INT_4.2.1_1'})
MERGE (a)-[r:FLOWS_TO_INTERFACE]->(b);
MATCH (a:SSTPA {HID: 'PUR_4.2.1_1'}), (b:SSTPA {HID: 'REQ_4.2.1_1'})
MERGE (a)-[r:HAS_REQUIREMENT]->(b);
MATCH (a:SSTPA {HID: 'INT_1_1'}), (b:SSTPA {HID: 'CNN_1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'CCSDS AOS over Ka-band, ESP/IPSec', FlowDirectionality: 'Unidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_1_2'}), (b:SSTPA {HID: 'CNN_1_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer2: Data Link', Protocol: 'CCSDS TC/TM over S-band', FlowDirectionality: 'Bidirectional', SecurityClass: 'Authenticated commands'};
MATCH (a:SSTPA {HID: 'INT_1.1_1'}), (b:SSTPA {HID: 'CNN_1.1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'SpaceWire cable harness', LogicalLayer: 'Layer2: Data Link', Protocol: 'SpaceWire', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_1.1.1_1'}), (b:SSTPA {HID: 'CNN_1_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer2: Data Link', Protocol: 'CCSDS TC/TM over S-band', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_1.1.1_2'}), (b:SSTPA {HID: 'CNN_1.1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'SpaceWire cable harness', LogicalLayer: 'Layer2: Data Link', Protocol: 'SpaceWire', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_1.1.2_1'}), (b:SSTPA {HID: 'CNN_1.1.2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'LVDS harness', LogicalLayer: 'Layer 1: Physical', Protocol: 'LVDS pixel video', FlowDirectionality: 'Unidirectional'};
MATCH (a:SSTPA {HID: 'INT_1.1.2.1.2.1.1.1_1'}), (b:SSTPA {HID: 'CNN_1.1.2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'LVDS harness', LogicalLayer: 'Layer 1: Physical', Protocol: 'LVDS pixel video', FlowDirectionality: 'Unidirectional'};
MATCH (a:SSTPA {HID: 'INT_1.1.2.2_1'}), (b:SSTPA {HID: 'CNN_1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'ESP/IPSec over CCSDS AOS', FlowDirectionality: 'Unidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_2_1'}), (b:SSTPA {HID: 'CNN_1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'CCSDS AOS over Ka-band, ESP/IPSec', FlowDirectionality: 'Unidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_2_2'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'Tasking messages over SATCOM IP', FlowDirectionality: 'Bidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_2_3'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'APCO P25 trunked voice and data', FlowDirectionality: 'Multicast', SecurityClass: 'AES voice encryption'};
MATCH (a:SSTPA {HID: 'INT_2_4'}), (b:SSTPA {HID: 'CNN_2_3'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'HTTPS over LTE and satellite backup', FlowDirectionality: 'Bidirectional', SecurityClass: 'TLS'};
MATCH (a:SSTPA {HID: 'INT_2_5'}), (b:SSTPA {HID: 'CNN_4_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over licensed microwave', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_2.1_1'}), (b:SSTPA {HID: 'CNN_1_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer2: Data Link', Protocol: 'CCSDS TC/TM over S-band', FlowDirectionality: 'Bidirectional', SecurityClass: 'Authenticated commands'};
MATCH (a:SSTPA {HID: 'INT_2.1.1_1'}), (b:SSTPA {HID: 'CNN_1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'ESP/IPSec over CCSDS AOS', FlowDirectionality: 'Unidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_2.2_1'}), (b:SSTPA {HID: 'CNN_2.2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over switched Ethernet', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_2.2_2'}), (b:SSTPA {HID: 'CNN_2.2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over switched Ethernet', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_2.2.2_1'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over SATCOM', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_2.2.2_2'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'APCO P25 ISSI', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_3_1'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'Tasking messages over SATCOM IP', FlowDirectionality: 'Bidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_3_2'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_3.1_1'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_3.1.1_1'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_3.1.1_2'}), (b:SSTPA {HID: 'CNN_3.1.1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'ARINC 429 twisted pair', LogicalLayer: 'Layer2: Data Link', Protocol: 'ARINC 429', FlowDirectionality: 'Unidirectional'};
MATCH (a:SSTPA {HID: 'INT_3.1.1.1_1'}), (b:SSTPA {HID: 'CNN_3.1.1_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'BOTH', PhysicalType: 'ARINC 429 twisted pair', LogicalLayer: 'Layer2: Data Link', Protocol: 'ARINC 429', FlowDirectionality: 'Unidirectional'};
MATCH (a:SSTPA {HID: 'INT_3.1.1.2_1'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over SATCOM', FlowDirectionality: 'Bidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_3.2_1'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_3.3_1'}), (b:SSTPA {HID: 'CNN_2_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over SATCOM', FlowDirectionality: 'Bidirectional', SecurityClass: 'Encrypted'};
MATCH (a:SSTPA {HID: 'INT_4_1'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'APCO P25 trunked voice and data', FlowDirectionality: 'Multicast', SecurityClass: 'AES voice encryption'};
MATCH (a:SSTPA {HID: 'INT_4_2'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_4_3'}), (b:SSTPA {HID: 'CNN_2_3'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'HTTPS over LTE and satellite backup', FlowDirectionality: 'Bidirectional', SecurityClass: 'TLS'};
MATCH (a:SSTPA {HID: 'INT_4.1_1'}), (b:SSTPA {HID: 'CNN_4_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over licensed microwave', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_4.1.1_1'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'APCO P25 conventional voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_4.1.1_2'}), (b:SSTPA {HID: 'CNN_4_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 3: Network', Protocol: 'IP over licensed microwave', FlowDirectionality: 'Bidirectional'};
MATCH (a:SSTPA {HID: 'INT_4.2_1'}), (b:SSTPA {HID: 'CNN_2_3'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'HTTPS over LTE and satellite backup', FlowDirectionality: 'Bidirectional', SecurityClass: 'TLS'};
MATCH (a:SSTPA {HID: 'INT_4.2.1_1'}), (b:SSTPA {HID: 'CNN_2_2'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 7: Application', Protocol: 'APCO P25 conventional voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'INT_4.2.1_2'}), (b:SSTPA {HID: 'CNN_3_1'})
MERGE (a)-[r:PARTICIPATES_IN]->(b)
SET r += {RelationshipNature: 'LOGICAL', LogicalLayer: 'Layer 1: Physical', Protocol: 'VHF-FM tactical voice', FlowDirectionality: 'Multicast'};
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_1_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_1_3'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__3'}), (b:SSTPA {HID: 'REQ_1_3'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_1_4'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_1_5'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1_4'}), (b:SSTPA {HID: 'REQ_1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1_2'}), (b:SSTPA {HID: 'REQ_1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1_3'}), (b:SSTPA {HID: 'REQ_1.1.1_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.1_2'}), (b:SSTPA {HID: 'REQ_1.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.2.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.2.1.2_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.2.1.2.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1.1.2.1.2.1.1_1'}), (b:SSTPA {HID: 'REQ_1.1.2.1.2.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1_2'}), (b:SSTPA {HID: 'REQ_1.1.2.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1_5'}), (b:SSTPA {HID: 'REQ_1.1.2.2_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_2_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_2_3'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__3'}), (b:SSTPA {HID: 'REQ_2_4'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2_2'}), (b:SSTPA {HID: 'REQ_2.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_1_2'}), (b:SSTPA {HID: 'REQ_2.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2.1_1'}), (b:SSTPA {HID: 'REQ_2.1.1_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2.1.1_2'}), (b:SSTPA {HID: 'REQ_2.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2_3'}), (b:SSTPA {HID: 'REQ_2.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2.2_1'}), (b:SSTPA {HID: 'REQ_2.2.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2_4'}), (b:SSTPA {HID: 'REQ_2.2.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_3_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_3_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_3_3'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__3'}), (b:SSTPA {HID: 'REQ_3_4'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3_2'}), (b:SSTPA {HID: 'REQ_3.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3.1_1'}), (b:SSTPA {HID: 'REQ_3.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3.1.1_1'}), (b:SSTPA {HID: 'REQ_3.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_2_1'}), (b:SSTPA {HID: 'REQ_3.1.1.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3_3'}), (b:SSTPA {HID: 'REQ_3.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3.2_1'}), (b:SSTPA {HID: 'REQ_3.2.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_3_4'}), (b:SSTPA {HID: 'REQ_3.3_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__3'}), (b:SSTPA {HID: 'REQ_4_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__1'}), (b:SSTPA {HID: 'REQ_4_2'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__2'}), (b:SSTPA {HID: 'REQ_4_3'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ__3'}), (b:SSTPA {HID: 'REQ_4_4'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4_2'}), (b:SSTPA {HID: 'REQ_4.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4.1_1'}), (b:SSTPA {HID: 'REQ_4.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4.1.1_1'}), (b:SSTPA {HID: 'REQ_4.1.1.1_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4_3'}), (b:SSTPA {HID: 'REQ_4.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4_4'}), (b:SSTPA {HID: 'REQ_4.2_1'})
MERGE (a)-[r:PARENTS]->(b);
MATCH (a:SSTPA {HID: 'REQ_4_3'}), (b:SSTPA {HID: 'REQ_4.2.1_1'})
MERGE (a)-[r:PARENTS]->(b);

// Expected example node count: 467
MATCH (n:SSTPA {Creator: 'SSTPA Tools'})
WHERE n.SoIIndex = '' OR split(n.SoIIndex, '.')[0] IN ['1', '2', '3', '4']
RETURN count(n) AS exampleNodes;
