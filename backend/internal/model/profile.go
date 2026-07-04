// SSTPA Profile Library (SRS §3.7.3): the read-only, versioned KerML 1.0
// library package served by the Backend. Contains the SSTPA Domain
// classifiers, SSTPA Associations, and SSTPA Metadata keyword definitions
// that G2M output references and M2G requires for type resolution.
//
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
package model

import "fmt"

// ProfileLibrary renders the SSTPA Profile bound to the given schema version
// (SRS §3.7.3: "The Profile Library version SHALL be bound to the data
// schema VersionID").
func ProfileLibrary(schemaVersion string) string {
	return fmt.Sprintf(`package 'SSTPA Profile' {
	#sstpa { schemaVersion = %q }

	package 'SSTPA Domain' {
		classifier Asset {
			feature AssetType : String;
			feature SafetyCritical : Boolean;
			feature MissionCritical : Boolean;
			feature FlightCritical : Boolean;
			feature SecurityCritical : Boolean;
			feature Confidentiality : Boolean;
			feature Availability : Boolean;
			feature Authenticity : Boolean;
			feature NonRepudiation : Boolean;
			feature Certifiable : Boolean;
			feature Privacy : Boolean;
			feature Trustworthy : Boolean;
			feature SafetyLevel : String;
			feature MissionLevel : String;
			feature FlightLevel : String;
			feature SecurityLevel : String;
		}
		classifier DerivedAsset specializes Asset;
		classifier Regime {
			feature Authority : String;
			feature Standard : String;
			feature CertificationScope : String;
		}
		classifier Hazard {
			feature HStatement : String;
		}
		classifier Loss {
			feature LStatement : String;
			feature AttackTreeStatus : String;
			feature TreeIsValid : Boolean;
			feature PathCount : Integer;
		}
		classifier Attack {
			feature AttackLevel : String;
			feature ReferenceFramework : String;
			feature ReferenceID : String;
			feature IsRVCandidate : Boolean;
			feature MetricsJSON : String;
		}
		classifier Countermeasure {
			feature CMStatement : String;
			feature CMType : String;
		}
		classifier SecurityControl {
			feature ControlStatement : String;
			feature SatisfactionStatement : String;
			feature ReferenceFramework : String;
			feature ReferenceID : String;
		}
		classifier ControlsBaseline {
			feature ConfidentialityImpact : String;
			feature IntegrityImpact : String;
			feature AvailabilityImpact : String;
			feature BaselineStatus : String;
			feature IsActive : Boolean;
		}
		classifier GsnGoal { feature GStatement : String; feature GsnID : String; }
		classifier GsnStrategy { feature SStatement : String; feature GsnID : String; }
		classifier GsnContext { feature CStatement : String; feature GsnID : String; }
		classifier GsnAssumption { feature AStatement : String; feature GsnID : String; }
		classifier GsnJustification { feature JStatement : String; feature GsnID : String; }
		classifier GsnSolution { feature SolStatement : String; feature GsnID : String; }
		behavior ControlAlgorithm;
		behavior ControlledProcess;
		step ControlAction;
		struct ProcessModel;
		classifier Feedback; // flow feature type
	}

	package 'SSTPA Associations' {
		assoc AtRefinement {
			feature LossHID : String;
			feature TailoredOut : Boolean;
			feature TailorReason : String;
			feature CompleteBlock : Boolean;
			feature CompleteBlockReason : String;
			feature AllowedRV : Boolean;
			feature AllowedRVReason : String;
			feature SANDSequence : Integer;
		}
		assoc AtAnd specializes AtRefinement;
		assoc AtOr specializes AtRefinement;
		assoc AtSand specializes AtRefinement;
		assoc Holds { feature TraceNote : String; feature TraceStatus : String; feature TraceStateHID : String; feature TraceVersion : Integer; }
		assoc Transports specializes Holds;
		assoc Uses specializes Holds;
		assoc ValidIn;
		assoc HasLoss;
		assoc HasGoal;
		assoc HasRegime;
		assoc HasHazard;
		assoc Derives;
		assoc LossEnvironment;
		assoc Threatens;
		assoc Violates;
		assoc UsesAttack;
		assoc Exploits;
		assoc Defeats;
		assoc Blocks;
		assoc SubordinateTo;
		assoc TargetsLoss;
		assoc Enforces;
		assoc Mitigates;
		assoc Satisfies;
		assoc AppliesTo;
		assoc HasRequirement;
		assoc SupportedBy;
		assoc InContextOf;
		assoc SolutionEvidence;
		assoc Generates;
		assoc Commands;
		assoc Causes;
		assoc Produces;
		assoc Informs;
		assoc Tunes;
		assoc Implements;
	}

	package 'SSTPA Metadata' {
		metadata def <'#capability'> Capability specializes SemanticMetadata;
		metadata def <'#sandbox'> Sandbox specializes SemanticMetadata;
		metadata def <'#system'> SystemKeyword specializes SemanticMetadata;
		metadata def <'#element'> Element specializes SemanticMetadata;
		metadata def <'#environment'> EnvironmentKeyword specializes SemanticMetadata;
		metadata def <'#purpose'> PurposeKeyword specializes SemanticMetadata;
		metadata def <'#validation'> ValidationKeyword specializes SemanticMetadata;
		metadata def <'#extend'> Extend specializes SemanticMetadata { attribute extensionPoint : String; }
		metadata def <'#involves'> Involves specializes SemanticMetadata;
		metadata def <'#parents'> Parents specializes SemanticMetadata;
		metadata def <'#externalref'> ExternalRef specializes SemanticMetadata {
			attribute framework : String;
			attribute externalId : String;
			attribute sourceUri : String;
		}
		metadata def <'#sstpa'> Sstpa specializes SemanticMetadata { attribute schemaVersion : String; }
	}
}
`, schemaVersion)
}
