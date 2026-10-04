# Loss Tool metric method and source analysis

Integration method baseline: 2026-10-04. Adapted from the approved Attack Tree prototype source analysis under SRS §6.5.10.22. This report defines the equations, deliberate interpretations and independent test vectors; current production execution evidence is recorded in `VERIFICATION.md`. Historical prototype passes are not production verification.

## Sources and reading convention

Primary source: Terrance R. Ingoldsby, *Attack Tree-based Threat Risk Analysis*, Amenaza Technologies Limited, revised January 27, 2021. Reviewed local source: `/home/netrisk/Projects/Attack Tree/Reference/Attack-Tree-Threat-Risk-Analysis.pdf` (not distributed). This 62-page PDF uses printed pages 1–58 after four front-matter pages; **printed p. n is PDF page n+4**, with one-based PDF numbering. References below use printed pages. The paper's formulas, captions and worked examples on pp. 24 and 36 were visually inspected in addition to text extraction.

SSTPA baseline: `/home/netrisk/Projects/SSTPA Tools/SSTPA Tool SRS V7.md`, especially §§3.3.10.16, 3.3.10.24 (Loss metric definition property), 3.3.10.25 (Attack metric values), and 6.5.10.8 (metric system). `docs/REQUIREMENTS-NOTES.md` I-19 records the approved integration supersession.

The paper is copyrighted, all rights reserved. This analysis paraphrases its method; it is not a license to redistribute the paper. The local PDF, extracted text and rendered source pages are excluded from the public application repository. Examples and FireSat extensions authored for the prototype are separately identified.

## Decisions driven by the user

1. Analysts enter **raw metric values only on leaf nodes**. Internal nodes and the Loss root display calculated values. Root properties store metric definitions, aggregation rules and analysis configuration.
2. The Loss root also stores visual configuration and layout; those settings do not change analytical values.
3. Values remain calculated when branches are rolled up. Visual collapse is not analytical tailoring.
4. The paper explicitly permits analyst-entered impact, benefit and attack-success-efficiency values at intermediate/root nodes (pp. 18–19, 26, 31, 45). The approved leaf-only policy deliberately differs. Model these as documented leaf contributions or allocate them to existing leaves when that preserves the intended scenario. Do not silently pretend that summing small operational losses captures the business consequence of their combination. A root-level business loss shared by multiple OR alternatives may need equivalent leaf contributions in each alternative; avoid double counting within AND scenarios. This is a modeling convention, not an equivalent transformation for every possible model in the paper.

## What the reference actually measures

The paper distinguishes physical measurements with units from expert ratings on defined scales (pp. 14–16). Both are useful, but a technical-skill rating is not an objectively measured probability. Its examples use a technical-ability scale of 1–100; that scale is illustrative, not mandatory.

The supported metric space is extensible. The paper does not prescribe a finite mandatory field set for every model. It introduces classes of indicators and gives concrete examples. The application can supply named presets and allow additional indicators with unit, domain, interpretation, source and root rules.

| Family / named property | Meaning and domain | Paper pages | Loss Tool representation |
|---|---|---|---|
| Monetary attack cost | Resources consumed to execute an operation; nonnegative currency amount | 14–17, 23–24 | Leaf `AttackCost`; unit such as USD; SUM over required actions |
| Technical ability | Reusable skill, expert-defined numeric rating | 15–17 | Leaf `TechnicalAbility`; MAX over required actions |
| Time / time to perform exploit | Duration; nonnegative, consistent units | 14, 17, 35–36 | Leaf `AttackTime`; SUM for sequential actions, MAX for truly concurrent actions |
| Noticeability | Degree to which activity is observable, with an explicit scale | 14, 22–24, 33 | Leaf `Noticeability`; paper examples use 0–1, but it is not automatically a statistical detection probability |
| Physical presence required | Whether an action needs proximity | 16 | Boolean leaf indicator, numeric 0/1 encoding only if schema needs numbers |
| Breach of trust required | Whether an action requires a trusted insider capability | 51 | Boolean leaf indicator, compared with actor capability |
| Additional resources | Examples include materials, talent and willingness to be noticed | 20–22 | Custom resource indicators and utility curves |
| Monetary attacker benefit | Raw reward expected by attacker | 25–28, 33 | Leaf `AttackerMoneyGain`; benefit utility maps to perceived value |
| Destruction / vandalism benefit | Nonmonetary reward, e.g. satisfying destructive urges | 27, 33 | Leaf `AttackerDestructionGain`, documented rating scale |
| Revenge, prestige, power, other desired rewards | Additional actor-specific benefits | 27 | Custom benefit indicators with utilities and normalized weights |
| Attacker detriment | Jail, injury, death or other negative effect on attacker, distinct from expended resources | 27–28, 45 | One or more nonnegative raw detriment indicators with negative contribution in net desirability; ASE does not discount detriments |
| Victim financial loss | Property damage, theft, business loss, intellectual-property loss | 18–19, 31–34, 40–41 | Leaf `VictimFinancialLoss`; raw currency distinct from normalized pain |
| Victim deaths, injuries, environmental damage, mission/business disruption | Impact categories selected for the system and stakeholder | 19, 38–41 | Additional victim impact indicators; units and calibration explicit |
| Resource affinity utilities | Actor-specific mapping of raw required resources to willingness/ability, commonly 0–1 | 21–25 | Root-configured piecewise-linear curves; evaluated on the complete scenario resource requirement |
| Attack feasibility | Combined resource-affinity utility | 23–25, 33 | Derived geometric mean; product available as the earlier alternative |
| Attack difficulty | Reciprocal interpretation of feasibility | 25, 29 | Derived `1 / feasibility`; unbounded status at zero feasibility |
| Perceived attacker benefit / desirability | Weighted combination of perceived benefits and detriments | 27–28, 33 | Derived weighted sum; no universal raw resource units |
| Capabilistic propensity | Modeled tendency to execute an attack per encounter | 29–31, 34 | Feasibility × nonnegative net desirability; distinguish from measured stochastic probability |
| Perceived victim impact / pain factor | Stakeholder-specific utility of raw victim impacts | 31–34, 38–39 | Weighted victim utilities; documented calibration |
| Relative attack risk | Risk for a single encounter | 32–34 | Propensity × pain factor |
| Encounter count / rate | Opportunity to engage the target | 35–36 | Derived from actor count, target count, duty factor, threading, attack and recovery time, or explicit analyst configuration |
| Attack frequency / rate of occurrence (RO) | Expected attack occurrences per chosen time unit | 36 | Propensity × encounter rate |
| Annual rate of occurrence (ARO) | RO normalized to one year | 36 | Derived with explicit time-unit conversion |
| Cumulative / absolute risk | Accumulated risk over a stated exposure horizon | 37–39 | RO × horizon × pain; may exceed 1 |
| Time until risk reaches unity / threshold | Exposure time to accumulate specified risk | 37 | Derived threshold / (RO × pain), when denominator is positive |
| Annual loss expectancy (ALE) | Annual expected raw loss for each victim impact type | 40–41 | ARO × raw scenario loss; USD/year for financial loss, not normalized pain |
| Random event probability | Stochastic event likelihood distinct from deliberate resource-constrained activity | 42–44 | Leaf probability in [0,1], with independence declaration before probability-union aggregation |
| Random event frequency and duration | Opportunity window opened by stochastic events; MTBF/MTTR are related availability data | 44 | Frequency in events/time and duration in time; mixed-event exposure window derived explicitly |
| Attack success efficiency (ASE), also described as attack effectiveness in glossary | Probability of success after the required resource-constrained action has been attempted | 45–46, 56 | Leaf values in [0,1], separated into benefit-based and encounter-based ASE |
| Feasibility / capability pruning status | Whether requirements exceed actor resources/capabilities | 17–18, 51 | Derived status; preserve excluded scenarios for explanation rather than deleting model nodes |
| Overall hostile risk / total risk | Aggregate reporting across competing scenarios or independent actors | 40, 46 | Named selection policy, scenario identifier and assumptions; not blind summation |

## Scalar SSTPA calculations versus scenario calculations

### SSTPA-compatible property roll-up

The baseline's root `MetricDefinitionsJSON` contains `MetricName`, `MetricDirection`, `LeafDefault`, `ANDFormula`, `ORFormula`, `SANDFormula`, optional `AcceptanceThreshold`, `ThresholdDirection`, and `Description`. Supported formulas are SUM, PRODUCT, MIN and MAX. Examples are:

- Attack cost: AND SUM, OR MIN, SAND SUM.
- Attack probability: AND PRODUCT, OR MAX, SAND PRODUCT.

This profile remains valuable for per-property bounds and for eventual integration. It does **not** mean that all displayed scalar extrema describe the same achievable attack scenario. For example, an OR with children `(cost=10, benefit=0.1)` and `(cost=100, benefit=0.9)` cannot yield a real scenario `(cost=10, benefit=0.9)`.

The existing baseline's `MetricDirection` descriptions conflict: the property definition says MINIMIZE means lower is safer and lists cost, while the detailed cost example says lower cost makes an attack more achievable. The adapter can preserve the enum for interchange but needs an explicit description separating attacker optimization from defender acceptance. Use `ThresholdDirection` for acceptance: minimum attack cost ABOVE a threshold is safer; attack probability BELOW a threshold is safer. Do not infer safety solely from `MetricDirection`.

### Amenaza-compatible scenario calculation

In the paper, a scenario is a complete set of leaf actions satisfying the root goal. An OR chooses one alternative; AND combines required child scenarios. OR does not independently minimize/maximize each resource. See pp. 16–17 and 43–44.

1. A leaf produces one scenario vector containing its raw metrics and its source node identifier.
2. An OR produces the union of its child scenario sets. Each scenario preserves one whole alternative's values and provenance.
3. An AND forms the Cartesian product of child scenario sets and combines each chosen vector according to each metric's AND rule.
4. A SAND uses the same required-child combination while preserving declared sequence. Sequential time sums. SAND is an SSTPA extension; the paper discusses sequential AND activities but does not specify a named SAND operator.
5. Transform each resulting complete scenario's resources and effects through actor/victim utility rules.
6. Retain the selected scenario identifier with every displayed derived result. A worst-risk summary selects one coherent scenario; alternatively display a range/table. Do not combine unrelated scalar bounds into a fictitious scenario.
7. Scenario enumeration is independently bounded. Even a tree with fewer than 100 nodes may represent millions of combinations. If the cap is exceeded, return an explicit incomplete-analysis result; do not label a partial maximum as the verified worst case. Visual node limits are insufficient as a scenario budget.

Repeated DAG nodes require explicit semantics. A shared event's cost/probability cannot automatically be charged/multiplied twice merely because it appears in two display locations. Store source leaf sets and detect overlap; either deduplicate under a declared shared-event policy or report the unsupported correlation before presenting a certified result. The paper's ganged-subtree method (pp. 47–48) is not equivalent to blindly deduplicating arbitrary shared nodes.

## Proposed mathematical contract

The following is a concrete, testable interpretation rather than a claim that the paper mandates these exact storage names.

### Raw metric definitions

Each definition supplies a stable name, role (resource/benefit/detriment/victim/probability/context), unit, domain, explicit leaf default, AND/OR/SAND rules and description/source. Root rules use enumerated operations, not executable user code. Reject duplicate names, nonfinite numbers, malformed bounds, invalid probabilities, zero time denominators, negative counts and references to undefined metrics.

Core presets can include `AttackCost`, `TechnicalAbility`, `AttackTime`, `Noticeability`, `PhysicalPresenceRequired`, `BreachOfTrustRequired`, `AttackerMoneyGain`, `AttackerDestructionGain`, `AttackerDetriment`, `VictimFinancialLoss`, `VictimSafetyImpact`, `VictimMissionImpact`, `RandomEventProbability`, `RandomEventDuration`, `RandomEventFrequency`, `BenefitASE`, `EncounterASE`, and the baseline's `AttackProbability` scalar. This is a useful preset set, not a claim that the reference contains exactly 18 required fields.

Noticeability aggregation is model-dependent. The paper does not prescribe a universal noticeability gate formula. A MAX default may be used as an explicitly labeled declared rating convention. A probability-union formula needs independent-event semantics and cannot be justified merely because a rating is between zero and one.

A Boolean resource requirement combines with logical OR across required actions: if any required action needs physical presence, the scenario does too. At hostile OR, keep the active alternative's Boolean value. Compare with the actor's Boolean ability; unmet requirements make that scenario infeasible.

### Root analysis configuration

Configuration includes actor and victim names, resource utility curves, benefit/detriment/victim utility curves and weights, the opportunity model, units, horizon, calibrated risk threshold, and scenario selection policy. Actor population, capabilities and utility parameters are **configuration**, not analyst-entered parent-node metric values. If the user elects to model opportunity inputs as node properties instead, those inputs also belong on leaves with explicit aggregation rules.

For a piecewise-linear utility curve, points have strictly increasing finite x coordinates and finite y values. Interpolate within segments; use documented endpoint values outside the range. Resource utility normally decreases from 1 toward 0 as demand increases. Benefit utility normally increases toward 1. Preserve explicit calibration rather than creating undocumented curve shapes. For normalized benefits/resource utilities, y is in [0,1]. Victim calibration may explicitly allow values above 1 (pp. 38–39); cumulative risk always may exceed 1.

### Per-scenario calculations

Let resources be `r_i`, resource utility curves be `u_i`, normalized benefit utilities be `b_j`, normalized nonnegative detriment utilities be `d_k`, and victim utility outputs be `v_l`. Configured weights within each family are nonnegative and sum to one.

- `ResourceUtilities[i] = u_i(r_i)`.
- `Feasibility = (PRODUCT(ResourceUtilities))^(1/n)` for `n > 0`; any failed Boolean capability sets feasibility to zero. Empty resource sets need an explicit neutral value of 1 and a disclosure that no resource constraints were modeled.
- `Difficulty = 1 / Feasibility`; at feasibility zero use a typed `unbounded` value rather than JSON Infinity or division-by-zero output.
- `BenefitASE = PRODUCT(benefit-based ASE values on scenario)`; default factor 1.
- Apply `BenefitASE` to raw attacker benefits **before** benefit utility conversion, not to victim impact or detriments.
- `GrossBenefit = SUM(w_j × b_j(BenefitASE × rawBenefit_j))`.
- `Detriment = SUM(q_k × d_k(rawDetriment_k))`, zero if no detriment indicators configured.
- `NetDesirability = max(0, GrossBenefit - Detriment)`. The zero floor is an explicit approved interpretation of the paper's negative-benefit deterrence discussion, because negative attack propensity is not meaningful.
- `Propensity = Feasibility × NetDesirability`.
- `PainFactor = SUM(z_l × v_l(rawVictimImpact_l))`.
- `RelativeRisk = Propensity × PainFactor`.
- `EncounterASE = PRODUCT(encounter-based ASE values on scenario)`; default 1.
- `EffectiveEncounterRate = EncounterRate × EncounterASE × OpportunityFraction`.
- `RO = Propensity × EffectiveEncounterRate`.
- `ARO = RO × timeUnitsPerYear` if RO is expressed per a smaller unit; otherwise ARO = RO for a yearly rate.
- `CumulativeRisk = RO × HorizonInSameUnits × PainFactor`.
- `ALE[impact] = ARO × RawVictimImpact[impact]` for each raw impact indicator; monetary ALE uses raw monetary loss.
- `TimeToRiskThreshold = RiskThreshold / (RO × PainFactor)` when the denominator is positive; otherwise `unbounded`. Risk threshold must be positive.

Root and internal node values use the same evaluation of the subtree treated as the current objective. As the paper cautions on pp. 44 and 46, a subtree's calculated propensity is an assessment of pursuing that intermediate objective, not the unconditional probability of that substep inside every larger attack.

### Opportunity and stochastic events

For single-shot actors, `EncounterCount = AdversaryCount / TargetCount` during a sufficiently long chosen campaign; do not repeat this count each year without changing the model.

For recurring actors, a consistent interpretation of p. 36 is:

`EncounterRate = AdversaryCount × ThreadFactor × DutyFactor / ((AttackTime + RecoveryTime) × TargetCount)`.

Single-thread uses ThreadFactor = 1. DutyFactor is in [0,1], TargetCount > 0, ThreadFactor >= 1, attack plus recovery time > 0. The printed multi-thread denominator is overlapped by another formula; the interpretation above uses the surrounding explanation and the legible single-thread formula. Maintain explicit time units.

For independent random events, AND probability is PRODUCT and OR probability is `1 - PRODUCT(1-p_i)`. This is a stochastic probability-union operation, not the hostile alternative selector. Shared or dependent random events require an appropriate dependence model; do not claim the independence formulas are generally valid.

For a mixed random/hostile opportunity window, an explicitly nonoverlapping approximation is `OpportunityFraction = min(1, FrequencyPerTimeUnit × DurationInSameTimeUnit)`. The paper's example is two events per year lasting two days each: 4/365 of yearly exposure. Overlapping events, failures/repair cycles, and correlated hazards need their own declared availability model. Independent failure rate and repair time cannot be silently treated as the same as a direct probability.

Do not multiply a random probability by a duration-derived opportunity factor representing the same phenomenon without a clear model; that double-counts the constraint.

### Countermeasure and incomplete-state behavior

Complete blocking is a feasibility/structure state, not a zero attack-cost alternative. A blocked branch is unavailable to a successful scenario. Returning cost zero for a complete block at an OR would incorrectly make it the cheapest attack. A tree with no feasible successful scenarios reports blocked/no feasible scenario; probability/propensity may be zero, while cost is not a misleading successful-path zero.

Partial countermeasures can be modeled by additional leaf resource requirements or ASE factors and retain traceability to the blocked attack. The prior baseline permitted numeric contributions on branch Countermeasure nodes; SRS §6.5.10.22 now adopts the user's leaf-only policy for production. Existing branch values remain stored for review, are ignored by the calculation and produce findings.

Tailored-out branches are excluded analytically according to a documented structural policy; rolled-up nodes remain included. Missing leaf values use only the explicit declared default and are visibly marked as defaulted. An unresolved import, invalid rule, overflow or scenario cap does not silently produce a complete result.

## Independent test vectors

All values below are arithmetic expectations, not assertions that a particular application's tests have run. Use absolute tolerance 1e-9 for ordinary small derived values or relative tolerance 1e-9 for large monetary values. Display rounding is separate from calculation.

### V1 — Paper's first worked scenario (pp. 23, 33–34)

Inputs: cost $25 with utility 0.9; technical ability 10 with utility 0.9; noticeability 0.3 with utility 0.95. Benefit utilities: money 0.78 and destruction 0.5 with weights 0.4 and 0.6. Pain = 0.83; raw financial damage = $15,250.

| Result | Exact numerical expectation |
|---|---:|
| Resource utility product | 0.7695 |
| Feasibility geometric mean | 0.9163672116434409 |
| Difficulty | 1.0912655835934695 |
| Benefit | 0.612 |
| Propensity | 0.5608167335257859 |
| Relative risk | 0.46547788882640223 |

### V2 — Paper's second worked scenario (pp. 24, 33–34)

Inputs: cost $30 with utility 0.79; technical ability 10 with utility 0.9; noticeability 0.28 with utility 0.97. Benefit utilities: money 0.82 and destruction 0.8 with weights 0.4 and 0.6. Pain = 0.9; raw financial damage = $18,500.

| Result | Exact numerical expectation |
|---|---:|
| Resource utility product | 0.68967 |
| Feasibility geometric mean | 0.8835146971457896 |
| Difficulty | 1.1318430844789773 |
| Benefit | 0.808 |
| Propensity | 0.713879875293798 |
| Relative risk | 0.6424918877644182 |

The reference uses rounded intermediate quantities and prints relative risks 0.466 and 0.643. Exact calculations above are intentionally not forced to reproduce rounding at every intermediate step.

### V3 — Required actions and sequential/concurrent time

Leaf A: cost 25, skill 10, duration 2 hours; leaf B: cost 5, skill 30, duration 3 hours. Required actions yield cost 30 and skill 30. Concurrent AND duration = 3 hours; sequential SAND duration = 5 hours. Reordering SAND does not change sum/product numerically but must change the stored sequence/provenance.

### V4 — No hybrid scenario at OR

Alternative A: cost 10, benefit 0.1; B: cost 100, benefit 0.9. Scalar summaries may show minimum cost 10 and maximum benefit 0.9 **as separate bounds**. Scenario mode contains exactly A and B; it never produces (10,0.9). A root chosen as worst risk identifies which scenario supplied all derived values.

### V5 — Random probability versus hostile alternatives

Independent random leaf probabilities 0.2 and 0.3: stochastic AND = 0.06; stochastic OR = 0.44. SSTPA attack-probability scalar MAX at OR = 0.3. These are different named interpretations and must not be interchangeable defaults.

### V6 — ASE stage order

Raw benefit 100, benefit ASE 0.5, benefit curve points (0,0), (50,0.8), (100,1): perceived benefit = 0.8, **not** 0.5. If feasibility=0.9, detriment=0.1, pain=0.6, nominal encounter rate=10/year, encounter ASE=0.25: net desirability=0.7, propensity=0.63, relative risk=0.378, effective encounters=2.5/year, ARO=1.575, yearly cumulative risk=0.945. Encounter ASE does not change relative risk. Detriment is not discounted by benefit ASE.

### V7 — Exposure, ALE and unbounded cumulative risk

Take V1; explicitly configured encounters=10/year; horizon=3 years; no ASE or random window reduction. ARO=5.608167335257859/year. Cumulative risk=13.964336664792066. Financial ALE=$85,524.55186268235/year. Time to unity=0.21483297574483612 years. Values above 1 are valid cumulative risk and must not be clipped.

### V8 — Opportunity units and windows

100 recurring actors; 10 targets; attack duration=2 hours; recovery=3 hours; thread factor=2; duty factor=0.5. Encounter rate=2/hour. With yearly window fraction 4/365, adjusted rate=0.021917808219178082/hour. A single-shot population uses 100/10=10 campaign encounters, not 2/hour.

### V9 — Zero, bounds and unsafe expressions

A required Boolean capability not possessed by the actor gives feasibility and propensity 0 and difficulty unbounded. Zero RO gives time-to-threshold unbounded. Probability -0.1/1.1, NaN/Infinity, duplicate metric name, unsorted utility points, zero target count, zero attack-plus-recovery, negative weight and weights not summing to one are rejected. No rule editor evaluates arbitrary JavaScript.

### V10 — Block, tailor and collapse

OR alternatives: A cost 10 blocked, B cost 25 feasible. Successful-path minimum is 25, not 0 or 10. Collapse B: every metric unchanged. Tailor B out: no feasible successful scenario remains. A hidden or collapsed branch still counts toward node/depth/width budgets.

## Source corrections and unsupported generalizations

- **Verified numerical typo, p. 24:** the prose prints 0.6897^(1/3)=0.577. The actual cube root is approximately 0.8835, matching the worked table on p. 33. Use corrected arithmetic.
- **Rounding, pp. 24 and 33–34:** 0.79×0.9×0.97 is 0.68967, rounded to 0.6897 in prose. Intermediate rounding explains some last-digit differences in printed risk figures.
- **Overlapping formula, p. 36:** the multi-thread formula visually overlaps the single-thread formula. Record the interpretation rather than presenting an illegible denominator as unambiguous source text.
- **Dimensional inconsistency, p. 41:** a proposed ALE upper-bound sentence refers to the sum of AROs. A frequency is not a loss amount. Do not implement an ALE bound with frequency units.
- **Independence, p. 46:** even when leaf random events are independent, overlapping cut sets need not be mutually independent. Blindly summing their event probabilities/risks can double count. Use declared independence/disjointness assumptions or withhold the combined claim.
- **Hostile scenario choice, pp. 30 and 40:** the paper acknowledges competition between scenarios and presents an optional uncertainty heuristic (retain top-propensity candidates, then choose maximum cumulative risk). The approved evaluator selecting maximum relative risk is a disclosed conservative summary policy, not the exact optional heuristic in the paper.
- **Victim calibration, pp. 38–39:** normalized pain is not universally capped at 1 once calibration is changed. A displayed risk number needs a stakeholder and calibration, not an unexplained label of acceptable/unacceptable.
- **SAND:** ordered gates come from SSTPA, not a named construct in this reference. Sequential-duration aggregation is supported by the paper's discussion of AND timing.
- **No scientific certainty claim:** propensity is a model of human choice based on utility assumptions, not an empirically certified event probability. FireSat demo numbers illustrate mechanics; they are not validated spacecraft risk estimates.

## Traceability checklist for implementers

The production SRS and verification evidence identify which of these capabilities are implemented. Supporting a custom numeric field does not itself implement a utility-based metric, ASE stage ordering, scenario-coherent risk, or population-frequency analysis. Each implemented formula needs input validation, a displayed rule and source, an independent positive vector, a boundary/error vector, persistence round-trip evidence, and recalculation after edits. Any unimplemented method remains explicitly marked rather than represented as verified paper compatibility.

## Implemented evaluator mapping (2026-10-04)

The implementation is `frontend/src/tools/loss/domain/metrics.ts`; independent vectors are exercised in `frontend/tests/loss/metrics.test.ts`. Production Core mapping is in `frontend/src/tools/loss/coreAdapter.ts`. The configuration factories return fresh JSON-compatible rule/profile objects. `evaluateMetrics` returns each node's selected coherent `values`, separate `scalarValues`, retained scenarios and their leaf provenance, completion status, threshold results and findings. Root Environment context is explicitly excluded from metric traversal. The outgoing State subgroup determines the root attack gate; other mixed sibling gates are rejected.

The runtime uses all 18 named presets above and supports additional indicators through numeric root rules and named utility/weight entries. `AnalysisProfileJSON` stores actor/victim names; resource, benefit, detriment and pain utility mappings; opportunity parameters; explicit stochastic independence; a 1–5,000 scenario budget (default 256); and scalar versus scenario mode. Complete scenario mode chooses the scenario with maximum relative risk and preserves that scenario's entire vector. Scalar mode deliberately withholds compound propensity/risk rather than multiplying unrelated scalar extrema. Strict thresholds compare only known values; equality fails both ABOVE and BELOW.

Pure stochastic nodes can be marked `eventKind: stochastic`. They use probability per fixed yearly exposure; their event propensity does not depend on attacker desirability. A stochastic AND multiplies independent probabilities and stochastic OR uses the independent union formula. The profile must explicitly assert independence. A stochastic OR with differing child impact values reports incomplete analysis, because a first-event/conditional impact model has not been specified. This is the ambiguity discussed on p. 50, not a silently implemented Monte Carlo approximation. Pure stochastic risk uses the configured fixed annual exposure count, regardless of the hostile encounter-mode setting. Random frequency/duration properties serve the mixed-event opportunity window when combined with a hostile scenario. These distinct meanings are stated in findings and source documentation.

Multiple references to the same required leaf under AND/SAND report incomplete correlated-event analysis; the evaluator does not charge or multiply it twice and pretend the result is correct. A scenario budget overflow, missing null-default input, nonfinite aggregate, invalid utility/rule, or zero recurring attack-plus-recovery time also withholds a complete root result. Exactly the configured number of scenarios is allowed; incompleteness begins when additional scenarios are omitted. Complete blocks yield no successful attacker scenario. Collapsed presentation state is never read by the metric evaluator.

Raw numeric inputs supplied on internal nodes are ignored with a finding. Defaults are explicit in root definitions and reported when used. Core unestimated fields use null, not invented zero. Optional fields use documented identities: Boolean requirements and optional effects are zero; ASE and independent probability factors are one. Final internal/root values are recomputed, never accepted as input. If a zero feasibility or zero accumulation rate makes a reciprocal unbounded, the numeric field is null and a finding states the unbounded interpretation; JSON never contains Infinity or NaN.

### Integration review corrections

The approved domain contract includes the following behavior: a structural terminal (such as a State or Component without an Attack/derived-Asset terminal) cannot produce a complete numeric analysis; a node with all subordinate branches tailored out reports incomplete scope rather than treating tailoring as a protective block; a genuinely complete-blocked tree has zero success probability/propensity/risk and an infeasible, nonnumeric attack cost; and both strict ABOVE and BELOW comparisons fail equality. Reserved JavaScript object-property identifiers are rejected at the graph/import boundary and the metric result dictionary does not inherit object properties. Stochastic leaves can have inapplicable hostile resource fields while deriving event risk from their probability and configured victim effects; a mixed-event model still needs explicit neutral contributions for those resource fields when aggregating into hostile parent scenarios.

The scenario profile also protects the stable IDs used directly by its equations: `AttackTime`, `RandomEventProbability`, `RandomEventDuration`, `RandomEventFrequency`, `BenefitASE`, `EncounterASE`, and `VictimFinancialLoss`. Their display labels remain editable. Deleting or renaming those IDs in scenario mode produces a validation finding instead of silently substituting neutral factors. Custom metric IDs remain editable; this dependency restriction does not apply to the independent scalar profile. Typed relationship creation now supplies the SSTPA OR/AND defaults while preserving an existing active sibling operator.
