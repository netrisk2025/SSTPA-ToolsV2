// Model Translation API (SRS §5.6.6.12, §3.7): G2M SysML/KerML projection,
// the SSTPA Profile Library, and M2G validate/commit (property-edit subset;
// scope documented in docs/REQUIREMENTS-NOTES.md).
//
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"

	"github.com/netrisk2025/SSTPA-ToolsV2/backend/internal/model"
	"github.com/netrisk2025/SSTPA-ToolsV2/backend/internal/schema"
)

// fetchModelGraph loads one SoI sub-graph (SRS §3.7.8 SOI scope) including
// [:REFERENCES] annotation data, excluding non-translated content (§3.7.2).
func (s *Server) fetchModelGraph(r *http.Request, soiHid string) (*model.Graph, error) {
	h, err := schema.ParseHID(soiHid)
	if err != nil {
		return nil, fmt.Errorf("invalid soi HID: %w", err)
	}
	soi := h.SoIKey()

	res, err := s.db.Read(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		g := &model.Graph{SoIHID: soiHid}

		rec, err := tx.Run(r.Context(), `
			MATCH (n:SSTPA) WHERE n.SoIIndex = $soi
			RETURN n.HID AS hid, n.TypeName AS label, properties(n) AS props`,
			map[string]any{"soi": soi})
		if err != nil {
			return nil, err
		}
		for rec.Next(r.Context()) {
			m := rec.Record().AsMap()
			hid, _ := m["hid"].(string)
			label, _ := m["label"].(string)
			props, _ := m["props"].(map[string]any)
			if hid == "" || label == "" {
				continue
			}
			g.Nodes = append(g.Nodes, model.Node{HID: hid, Label: label, Props: props})
			if hid == soiHid {
				if name, ok := props["Name"].(string); ok {
					g.SoIName = name
				}
			}
		}
		if err := rec.Err(); err != nil {
			return nil, err
		}

		rrec, err := tx.Run(r.Context(), `
			MATCH (a:SSTPA)-[rel]->(b:SSTPA)
			WHERE a.SoIIndex = $soi AND (b.SoIIndex = $soi OR type(rel) IN ['PARTICIPATES_IN','PARENTS'])
			RETURN type(rel) AS type, a.HID AS src, b.HID AS tgt, properties(rel) AS props
			UNION ALL
			MATCH (a:SSTPA)-[rel:REFERENCES]->(ref:REF)
			WHERE a.SoIIndex = $soi
			RETURN 'REFERENCES' AS type, a.HID AS src,
			       (ref.FrameworkName + '|' + ref.ExternalID + '|' + coalesce(ref.SourceURI,'')) AS tgt,
			       {} AS props`,
			map[string]any{"soi": soi})
		if err != nil {
			return nil, err
		}
		for rrec.Next(r.Context()) {
			m := rrec.Record().AsMap()
			relType, _ := m["type"].(string)
			src, _ := m["src"].(string)
			tgt, _ := m["tgt"].(string)
			props, _ := m["props"].(map[string]any)
			rel := model.Rel{Type: relType, Source: src, Target: tgt, Props: props}
			if relType == "REFERENCES" {
				// tgt packs framework|externalId|sourceUri (§3.7.2: annotation
				// only, reference content never embedded).
				parts := splitN3(tgt)
				rel.Target = ""
				rel.RefFramework, rel.RefExternalID, rel.RefSourceURI = parts[0], parts[1], parts[2]
			}
			g.Rels = append(g.Rels, rel)
		}
		if err := rrec.Err(); err != nil {
			return nil, err
		}
		return g, nil
	})
	if err != nil {
		return nil, err
	}
	g := res.(*model.Graph)
	if len(g.Nodes) == 0 {
		return nil, fmt.Errorf("SoI %s has no nodes", soiHid)
	}
	if g.SoIName == "" {
		g.SoIName = soiHid
	}
	return g, nil
}

func splitN3(s string) [3]string {
	var out [3]string
	idx := 0
	start := 0
	for i := 0; i < len(s) && idx < 2; i++ {
		if s[i] == '|' {
			out[idx] = s[start:i]
			idx++
			start = i + 1
		}
	}
	out[idx] = s[start:]
	return out
}

// handleModelText serves GET /api/model/{sysml|kerml} (SRS §5.6.6.12).
func (s *Server) handleModelText(language string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		soiHid := r.URL.Query().Get("soi")
		if soiHid == "" {
			writeError(w, http.StatusBadRequest, "soi query parameter is required", "")
			return
		}
		g, err := s.fetchModelGraph(r, soiHid)
		if err != nil {
			writeError(w, http.StatusUnprocessableEntity, "model translation failed", err.Error())
			return
		}
		sysml, kerml := model.EmitSoI(s.schema, g, s.cfg.SchemaVersion)
		text := sysml
		if language == "kerml" {
			text = kerml
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte(text))
	}
}

// handleModelProfile serves GET /api/model/profile: the SSTPA Profile
// Library bound to the schema version (SRS §3.7.3).
func (s *Server) handleModelProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte(model.ProfileLibrary(s.cfg.SchemaVersion)))
}

type modelValidateRequest struct {
	Text   string `json:"text"`
	SoIHID string `json:"soiHid"`
	ToolID string `json:"toolId"`
}

type modelChange struct {
	HID        string         `json:"hid"`
	Properties map[string]any `json:"properties"`
}

type modelValidateResponse struct {
	Valid       bool               `json:"valid"`
	Changes     []modelChange      `json:"changes"`
	Diagnostics []model.Diagnostic `json:"diagnostics"`
	Note        string             `json:"note"`
}

const m2gScopeNote = "M2G accepts property and documentation edits on existing HID-identified elements; element/relationship creation and deletion via model text is not accepted in this release (see docs/REQUIREMENTS-NOTES.md)."

// computeModelChanges diffs parsed element edits against the live graph.
func (s *Server) computeModelChanges(r *http.Request, parsed model.ParseResult) ([]modelChange, []model.Diagnostic, error) {
	diags := append([]model.Diagnostic{}, parsed.Diagnostics...)
	var changes []modelChange

	for _, el := range parsed.Elements {
		cur, err := fetchNodeProps(r, s, el.HID)
		if err != nil {
			diags = append(diags, model.Diagnostic{
				Line: el.Line, Rule: "M2G-UNKNOWN-HID",
				Message: fmt.Sprintf("element %s does not exist in the graph; creation via model text is not accepted", el.HID),
				Excerpt: el.HID,
			})
			continue
		}
		label, _ := cur["TypeName"].(string)
		delta := map[string]any{}
		for k, v := range el.Props {
			if _, sysManaged := map[string]bool{
				"HID": true, "uuid": true, "TypeName": true, "Owner": true,
				"OwnerEmail": true, "Creator": true, "CreatorEmail": true,
			}[k]; sysManaged {
				diags = append(diags, model.Diagnostic{
					Line: el.Line, Rule: "M2G-BOOKKEEPING",
					Message: fmt.Sprintf("%s.%s is Backend-assigned and cannot be set from model text (SRS §3.7.2)", el.HID, k),
				})
				continue
			}
			cast, err := s.castProperty(label, k, v)
			if err != nil {
				diags = append(diags, model.Diagnostic{
					Line: el.Line, Rule: "M2G-PROPERTY",
					Message: fmt.Sprintf("%s: %v", el.HID, err),
				})
				continue
			}
			if fmt.Sprintf("%v", cur[k]) != fmt.Sprintf("%v", cast) {
				delta[k] = cast
			}
		}
		if el.ShortDesc != nil && fmt.Sprintf("%v", cur["ShortDescription"]) != *el.ShortDesc {
			delta["ShortDescription"] = *el.ShortDesc
		}
		if el.LongDesc != nil && fmt.Sprintf("%v", cur["LongDescription"]) != *el.LongDesc {
			delta["LongDescription"] = *el.LongDesc
		}
		if len(delta) > 0 {
			changes = append(changes, modelChange{HID: el.HID, Properties: delta})
		}
	}
	return changes, diags, nil
}

func fetchNodeProps(r *http.Request, s *Server, hid string) (map[string]any, error) {
	res, err := s.db.Read(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		rec, err := tx.Run(r.Context(),
			`MATCH (n:SSTPA {HID: $hid}) RETURN properties(n) AS props LIMIT 1`,
			map[string]any{"hid": hid})
		if err != nil {
			return nil, err
		}
		single, err := rec.Single(r.Context())
		if err != nil {
			return nil, fmt.Errorf("node %s not found", hid)
		}
		props, _ := single.AsMap()["props"].(map[string]any)
		return props, nil
	})
	if err != nil {
		return nil, err
	}
	return res.(map[string]any), nil
}

// handleModelValidate implements POST /api/model/validate (SRS §5.6.6.12,
// §3.7.9 pipeline through "present staged diff").
func (s *Server) handleModelValidate(w http.ResponseWriter, r *http.Request) {
	var req modelValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Text == "" {
		writeError(w, http.StatusBadRequest, "text is required", "")
		return
	}
	parsed := model.Parse(req.Text)
	changes, diags, err := s.computeModelChanges(r, parsed)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "validation failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, modelValidateResponse{
		Valid:       len(diags) == 0,
		Changes:     changes,
		Diagnostics: diags,
		Note:        m2gScopeNote,
	})
}

// handleModelCommit implements POST /api/model/commit: the validated change
// set executes through the standard commit pipeline (one ACID transaction,
// ownership and notification behavior; SRS §3.7.9, §5.6.6.8).
func (s *Server) handleModelCommit(w http.ResponseWriter, r *http.Request) {
	user, _ := CurrentUser(r.Context())
	var req modelValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Text == "" {
		writeError(w, http.StatusBadRequest, "text is required", "")
		return
	}
	parsed := model.Parse(req.Text)
	changes, diags, err := s.computeModelChanges(r, parsed)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "validation failed", err.Error())
		return
	}
	if len(diags) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, modelValidateResponse{
			Valid: false, Changes: changes, Diagnostics: diags, Note: m2gScopeNote,
		})
		return
	}
	if len(changes) == 0 {
		writeJSON(w, http.StatusOK, map[string]any{
			"status": "no changes", "note": m2gScopeNote,
		})
		return
	}

	commitReq := commitRequest{
		SoIHID: req.SoIHID,
		ToolID: firstNonEmpty(req.ToolID, "gui.modeltext"),
	}
	for _, c := range changes {
		commitReq.Operations = append(commitReq.Operations, commitOperation{
			Op: "updateNode", HID: c.HID, Props: c.Properties,
		})
	}
	commitID := uuid.NewString()
	result, err := s.db.Write(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		return s.executeCommit(r, tx, user, commitID, commitReq)
	})
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, "commit rejected", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}
