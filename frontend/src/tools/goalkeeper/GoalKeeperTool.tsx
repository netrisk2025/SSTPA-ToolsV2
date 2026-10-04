// Production Goal Keeper: canonical Core authoring with the approved GSN v3 presentation.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Component, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/client";
import type { CommitOperation, SoINode } from "../../api/types";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useDrawer, useToolWindows } from "../../state/stores";
import type { ToolLaunchContext, ToolManifest } from "../manifest";
import { ResizablePane, ToolStatus, downloadText, errorText } from "../shared";
import { displayIdFor, fromCore, readCoreView, serializeCoreView, type CoreView } from "./core-adapter";
import { layoutArgument } from "./domain/layout/elk";
import { validateStructure as validateGsn } from "./domain/rules/validate";
import { exportMarkdown as exportCoreMarkdown } from "./domain/export/report";
import { renderDiagram } from "./domain/presentation/svg";
import type { ViewportState } from "./domain/model/types";
import { GsnCanvas } from "./GsnCanvas";
import { ColorsDialog, ModelDialog } from "./PresentationDialogs";
import { useGsnTheme } from "./useGsnTheme";

type Mode = "structure" | "evidence" | "validation" | "export";
type GsnLabel = "GsnGoal" | "GsnStrategy" | "GsnContext" | "GsnJustification" | "GsnAssumption" | "GsnSolution";
type GsnRel = "SUPPORTED_BY" | "IN_CONTEXT_OF";
const GSN_LABELS: GsnLabel[] = ["GsnGoal", "GsnStrategy", "GsnContext", "GsnJustification", "GsnAssumption", "GsnSolution"];
const EVIDENCE_RELS = ["HAS_VALIDATION", "HAS_VERIFICATION", "HAS_LOSS"] as const;
const CRITICALITIES = ["SafetyCritical", "MissionCritical", "FlightCritical", "SecurityCritical"] as const;
const ASSURANCES = ["Confidentiality", "Availability", "Authenticity", "NonRepudiation", "Certifiable", "Privacy", "Trustworthy"] as const;
interface StructureOption { asset?: SoINode; loss?: SoINode; root: SoINode }
interface Finding { severity: "ERROR" | "WARNING" | "INFO"; nodeHid?: string; message: string }
type GsnEdge = { source: string; target: string; type: string };

export default function GoalKeeperTool({ctx}: {ctx:ToolLaunchContext;manifest:ToolManifest}) {
  const [workspaceSoi,setWorkspaceSoi]=useState(ctx.soiHid), [dirty,setDirty]=useState(false), [working,setWorking]=useState(false);
  const [rootHid,setRootHid]=useState("");
  const focusSeen=useRef<string|null>(null);
  useEffect(()=>{if(!dirty&&!working)setWorkspaceSoi(ctx.soiHid);},[ctx.soiHid,dirty,working]);
  const soi=useQuery({queryKey:["soi",workspaceSoi],queryFn:()=>api.soi(workspaceSoi!),enabled:!!workspaceSoi});
  const nodes=useMemo(()=>soi.data?.nodes??[],[soi.data]);
  const byHid=useMemo(()=>new Map(nodes.map(n=>[n.hid,n])),[nodes]);
  const gsnNodes=useMemo(()=>nodes.filter(n=>GSN_LABELS.includes(n.typeName as GsnLabel)),[nodes]);
  const structures=useMemo(()=>buildStructures(nodes.filter(n=>n.typeName==="Asset"||n.typeName==="DerivedAsset"),nodes.filter(n=>n.typeName==="Loss"),gsnNodes,byHid),[nodes,gsnNodes,byHid]);
  useEffect(()=>{
    if(dirty||working)return;
    const focus=ctx.focusHid??ctx.drawerNodeHid;
    if(focus && focusSeen.current!==focus){
      focusSeen.current=focus;
      const found=structures.find(s=>s.root.hid===rootForNode(focus,gsnNodes)||s.asset?.hid===focus||s.loss?.hid===focus);
      if(found){setRootHid(found.root.hid);return;}
    }
    if(!structures.some(s=>s.root.hid===rootHid))setRootHid(structures[0]?.root.hid??"");
  },[structures,gsnNodes,ctx.focusHid,ctx.drawerNodeHid,rootHid,dirty,working]);
  if(!workspaceSoi)return <ToolStatus needsSoI/>;
  if(!soi.data&&(soi.isLoading||soi.error))return <ToolStatus loading={soi.isLoading} error={soi.error} onRetry={()=>void soi.refetch()}/>;
  // A background response is not permission to discard the mounted snapshot.
  // In particular, another writer may remove this root while we hold a draft or commit.
  const retainMissingRoot=!!rootHid&&!byHid.has(rootHid)&&(dirty||working);
  return <div className="sstpa-gk-host">
    <div className="sstpa-gk-hostbar"><label htmlFor="sstpa-gk-root">Argument</label><select id="sstpa-gk-root" className="sstpa-input" disabled={dirty||working} value={rootHid} onChange={e=>setRootHid(e.target.value)}>
      {retainMissingRoot&&<option value={rootHid}>{rootHid} · Retained argument</option>}
      {!structures.length&&<option value="">No root Goal in this SoI</option>}{structures.map(s=><option key={s.root.hid} value={s.root.hid}>{s.root.hid} · {String(s.root.properties.Name??"Root Goal")}</option>)}
    </select><span className="sstpa-gk-metadata">GSN v3 · core notation</span></div>
    {workspaceSoi!==ctx.soiHid&&<div className="sstpa-alert-warning">This draft belongs to {workspaceSoi}. Commit or Revert before following the selected SoI.</div>}
    {retainMissingRoot&&<div className="sstpa-alert-warning">Root Goal {rootHid} is absent from the latest Core response. Your current work is retained. Export it or Revert / reload to reconcile with Core.</div>}
    {soi.error&&<div className="sstpa-alert-warning">Refresh failed; the loaded argument is retained. {errorText(soi.error)}</div>}
    {rootHid&&(byHid.has(rootHid)||retainMissingRoot)?<ArgumentLoadBoundary key={`${workspaceSoi}:${rootHid}`} nodes={nodes} onRetry={()=>void soi.refetch()}><ArgumentWorkspace initialNodes={nodes} rootHid={rootHid} soiHid={workspaceSoi} focusHid={ctx.focusHid??ctx.drawerNodeHid} onDirty={setDirty} onWorking={setWorking}/></ArgumentLoadBoundary>:
      <ToolStatus empty="No Goal Structure in this SoI." emptyHint="Use Asset Manager to establish an ordinary Asset's Loss and root Goal, or open an existing Goal in the Data Drawer."/>}
  </div>;
}

class ArgumentLoadBoundary extends Component<{ nodes: SoINode[]; onRetry: () => void; children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidUpdate(previous: Readonly<{ nodes: SoINode[] }>) {
    // Only a replacement Core response clears a load error; ordinary refetches never reset a live draft.
    // eslint-disable-next-line react/no-did-update-set-state
    if (this.state.error && previous.nodes !== this.props.nodes) this.setState({ error: null });
  }
  render() { return this.state.error ? <ToolStatus error={this.state.error} onRetry={this.props.onRetry}/> : this.props.children; }
}

function ArgumentWorkspace({initialNodes,rootHid,soiHid,focusHid,onDirty,onWorking}:{initialNodes:SoINode[];rootHid:string;soiHid:string;focusHid:string|null;onDirty:(v:boolean)=>void;onWorking:(v:boolean)=>void}) {
  const qc=useQueryClient(),openDrawer=useDrawer(s=>s.openDrawer),drawerOpen=useDrawer(s=>s.open),closeTool=useToolWindows(s=>s.closeTool);
  // Freeze this snapshot until an explicit save/reload. Background refetch never consumes a draft.
  const [nodes,setNodes]=useState(initialNodes),[mode,setMode]=useState<Mode>("structure"),[selectedHid,setSelectedHid]=useState<string|null>(()=>focusHid&&fromCore(rootHid,initialNodes).elements.has(focusHid)?focusHid:rootHid);
  const [viewDirty,setViewDirty]=useState(false),[nodeDirty,setNodeDirty]=useState(false),[working,setWorking]=useState(false),[needsRefresh,setNeedsRefresh]=useState(false);
  const [notice,setNotice]=useState(""),[inspector,setInspector]=useState(false),[outline,setOutline]=useState(false),[model,setModel]=useState(false),[colors,setColors]=useState(false),[search,setSearch]=useState(""),[confirmClose,setConfirmClose]=useState(false),[confirmRevert,setConfirmRevert]=useState(false),[epoch,setEpoch]=useState(0);
  const theme=useGsnTheme(),generation=useRef(0);
  const byHid=useMemo(()=>new Map(nodes.map(n=>[n.hid,n])),[nodes]);
  const structure=useMemo(()=>fromCore(rootHid,nodes),[rootHid,nodes]);
  const [view,setView]=useState<CoreView>(()=>readCoreView(initialNodes.find(n=>n.hid===rootHid),fromCore(rootHid,initialNodes)));
  const root=byHid.get(rootHid),gsnNodes=nodes.filter(n=>GSN_LABELS.includes(n.typeName as GsnLabel));
  const graph = {
    nodes: [...structure.elements.keys()].map(hid => byHid.get(hid)!),
    edges: [...structure.elements.values()].flatMap(el => [
      ...el.supportedBy.map(target => ({ source: el.gsnId, target, type: "SUPPORTED_BY" })),
      ...el.inContextOf.map(target => ({ source: el.gsnId, target, type: "IN_CONTEXT_OF" })),
      ...(byHid.get(el.gsnId)?.relationships ?? []).filter(rel => EVIDENCE_RELS.includes(rel.type as typeof EVIDENCE_RELS[number]) && el.hasEvidence.includes(rel.targetHID) && structure.evidence.has(rel.targetHID)).map(rel => ({ source: el.gsnId, target: rel.targetHID, type: rel.type })),
    ]),
  };
  const findings:Finding[]=validateGsn(structure).map(f=>({severity:f.severity,nodeHid:f.nodeId,message:f.message}));
  const workingStructure=useMemo(()=>({...structure,layout:{...structure.layout,savedAt:view.savedAt,viewport:view.viewport,nodes:view.positions,display:{...structure.layout.display,nodeStyles:view.nodeStyles}}}),[structure,view]);
  const dirty=viewDirty||nodeDirty||needsRefresh;
  useEffect(()=>{onDirty(dirty);},[dirty,onDirty]);
  useEffect(()=>{onWorking(working);},[working,onWorking]);
  useEffect(()=>()=>{generation.current++;onDirty(false);onWorking(false);},[onDirty,onWorking]);
  useEffect(()=>{
    const close=(e:Event)=>{if(working){e.preventDefault();setNotice("Wait for the current operation to finish.");}else if(dirty){e.preventDefault();setConfirmClose(true);}};
    const unload=(e:BeforeUnloadEvent)=>{if(dirty||working){e.preventDefault();e.returnValue="";}};
    window.addEventListener("sstpa.goalkeeper.request-close",close);window.addEventListener("beforeunload",unload);
    return()=>{window.removeEventListener("sstpa.goalkeeper.request-close",close);window.removeEventListener("beforeunload",unload);};
  },[dirty,working]);
  useEffect(() => {
    const loaded = readCoreView(nodes.find(n => n.hid === rootHid), structure);
    if (loaded.hasSavedLayout) return;
    const ticket = ++generation.current;
    setWorking(true);
    void layoutArgument(structure).then(positions => {
      if (ticket !== generation.current) return;
      setView(v => ({ ...v, positions, viewport: { x: 0, y: 0, zoom: 1 } }));
      setEpoch(x => x + 1);
    }).catch(error => { if (ticket === generation.current) setNotice(`Initial arrangement failed: ${errorText(error)}. Use Arrange to retry.`); })
      .finally(() => { if (ticket === generation.current) setWorking(false); });
    // This ref is a sequence counter, not a DOM ref: invalidate this request only if it is still current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { if (ticket === generation.current) generation.current++; };
  }, [nodes, rootHid, structure]);
  const invalidate=()=>{void qc.invalidateQueries({queryKey:["soi"]});void qc.invalidateQueries({queryKey:["model-text"]});};
  const adopt=(fresh:SoINode[])=>{const next=fromCore(rootHid,fresh);setNodes(fresh);setView(readCoreView(fresh.find(n=>n.hid===rootHid),next));setViewDirty(false);setNodeDirty(false);setNeedsRefresh(false);setEpoch(x=>x+1);};
  const reload=async()=>{setWorking(true);const ticket=++generation.current;try{const fresh=await api.soi(soiHid);if(ticket!==generation.current)return;adopt(fresh.nodes??[]);setNotice("Reloaded the committed argument and presentation.");}catch(e){if(ticket===generation.current)setNotice(errorText(e));}finally{if(ticket===generation.current)setWorking(false);}};
  const commit=async(operations:CommitOperation[],isView=false)=>{
    if(working||needsRefresh)return;
    setWorking(true);const ticket=++generation.current;let accepted=false;
    try{await api.commit({soiHid,toolId:"sstpa.goalkeeper",operations});accepted=true;if(ticket!==generation.current)return;setNeedsRefresh(true);const fresh=await api.soi(soiHid);if(ticket!==generation.current)return;adopt(fresh.nodes??[]);invalidate();setNotice(isView?"Presentation committed to Core.":"Argument changes committed to Core.");}
    catch(e){if(ticket!==generation.current)return;setNotice(accepted?"COMMIT SUCCEEDED, but reload failed. The draft is retained for comparison. Export if needed, then Reload committed before submitting another transaction.":errorText(e));}
    finally{if(ticket===generation.current)setWorking(false);}
  };
  const saveView=()=>{if(!root)return;try{const value=serializeCoreView(root,structure,view);const op:CommitOperation={op:"updateNode",hid:rootHid,expectedGoalStructure:typeof root.properties.GoalStructure==="string"?root.properties.GoalStructure:null,properties:{GoalStructure:value}};void commit([op],true);}catch(e){setNotice(errorText(e));}};
  const arrange=async()=>{const ticket=++generation.current;setWorking(true);try{const positions=await layoutArgument(structure);if(ticket!==generation.current)return;setView(v=>({...v,positions}));setViewDirty(true);setEpoch(x=>x+1);}catch(e){setNotice(errorText(e));}finally{if(ticket===generation.current)setWorking(false);}};
  const setViewport=useCallback((viewport:ViewportState)=>{if(!working&&!needsRefresh&&!nodeDirty)setView(v=>v.viewport.x===viewport.x&&v.viewport.y===viewport.y&&v.viewport.zoom===viewport.zoom&&v.viewport.focusId===viewport.focusId?v:{...v,viewport});},[working,needsRefresh,nodeDirty]);
  const select=(id:string|null)=>{if(working||needsRefresh)return;if(nodeDirty&&id!==selectedHid){setNotice("Commit or Revert the node edit before selecting another node.");return;}if(id&&!structure.elements.has(id)){openDrawer({mode:"edit",hid:id});return;}setSelectedHid(id);setInspector(true);};
  const searchResults=filterGraphNodes(graph.nodes,search);
  const md=exportCoreMarkdown(workingStructure);
  const svg=()=>renderDiagram(workingStructure,view.positions,{theme,nodeStyles:view.nodeStyles});
  const json=()=>JSON.stringify({format:"sstpa-goalkeeper-export",version:1,soiHid,rootHid,rootUuid:root?.uuid,scope:"whole argument",presentation:{positions:view.positions,viewport:view.viewport,nodeStyles:view.nodeStyles},gsnNodes:graph.nodes.map(n=>({hid:n.hid,uuid:n.uuid,typeName:n.typeName,properties:n.properties})),relationships:graph.edges,evidence:[...structure.evidence.entries()],findings},null,2);
  return <>
    <div className="sstpa-gk-menubar" role="toolbar" aria-label="Goal Keeper actions">
      {(["structure","evidence","validation","export"] as Mode[]).map(m=><button key={m} className={`sstpa-button ${mode===m?"":"secondary"}`} onClick={()=>setMode(m)}>{m[0].toUpperCase()+m.slice(1)}{m==="validation"&&findings.some(f=>f.severity==="ERROR")?" !":""}</button>)}
      <details className="sstpa-gk-view-menu"><summary className="sstpa-button secondary">View</summary><div>
        <button className="sstpa-button secondary" onClick={()=>setModel(true)}>SysML / KerML equivalent</button>
        <button className="sstpa-button secondary" onClick={()=>setOutline(v=>!v)}>{outline?"Hide":"Show"} argument outline</button>
        <button className="sstpa-button secondary" disabled={nodeDirty} onClick={()=>setInspector(v=>!v)}>{inspector?"Hide":"Show"} inspector</button>
      </div></details>
      <button className="sstpa-button secondary" disabled={working||nodeDirty||needsRefresh} onClick={()=>setColors(true)}>Node type colors</button>
      <button className="sstpa-button secondary" disabled={working||nodeDirty||needsRefresh} onClick={()=>void arrange()}>Arrange</button>
      <span className="sstpa-gk-spacer"/><button className="sstpa-button" disabled={!viewDirty||working||nodeDirty||needsRefresh} onClick={saveView}>Commit presentation</button>
      <button className="sstpa-button secondary" disabled={working} onClick={()=>{if(dirty&&!needsRefresh)setConfirmRevert(true);else void reload();}}>{needsRefresh?"Reload committed":"Revert / reload"}</button>
    </div>
    {notice&&<div className="sstpa-alert-warning" role="status">{notice}<button className="icon-button" aria-label="Dismiss status" onClick={()=>setNotice("")}>×</button></div>}
    {view.warnings.map((warning,i)=><div key={i} className="sstpa-alert-warning">{warning}</div>)}
    <div className="sstpa-gk-titlebar"><div><h2>{String(root?.properties.Name??"Assurance argument")}</h2><p>{structure.elements.size} elements · {findings.filter(f=>f.severity==="WARNING").length} incomplete findings{dirty?" · Uncommitted changes":""}</p></div><input className="sstpa-input" aria-label="Search GSN" placeholder="Find ID or statement…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
    {search.trim()&&<div className="sstpa-gk-search-results">{searchResults.length?searchResults.map(n=><button key={n.hid} className="sstpa-button secondary" onClick={()=>{select(n.hid);setMode("structure");}}>{gsnId(n)||n.hid} · {String(n.properties.Name??"")}</button>):"No matching nodes."}</div>}
    <div className="sstpa-gk-workspace">
      {outline&&<ResizablePane dock="left" storageKey="goalkeeper.outline" defaultWidth={230}><div className="sstpa-gk-outline">{graph.nodes.map(n=><button key={n.hid} className="sstpa-button secondary" onClick={()=>select(n.hid)}><strong>{gsnId(n)||n.hid}</strong> {String(n.properties.Name??"")}</button>)}</div></ResizablePane>}
      <div className="sstpa-gk-main">
        <div className="sstpa-gk-canvas-host" style={{display:mode==="structure"?"flex":"none"}}><GsnCanvas key={epoch} structure={workingStructure} positions={view.positions} viewport={view.viewport} setViewport={setViewport} theme={theme} revealToken={epoch} graphEpoch={epoch} disabled={working||needsRefresh||nodeDirty} restoreViewport={view.hasSavedLayout||viewDirty} selectedId={selectedHid} errorIds={new Set(findings.filter(f=>f.severity==="ERROR").map(f=>f.nodeHid!).filter(Boolean))} onSelect={select} onDrag={(id,x,y)=>{if(working||needsRefresh)return;generation.current++;setView(v=>({...v,positions:{...v.positions,[id]:{x,y}}}));setViewDirty(true);}} onInteraction={()=>{if(!working&&!needsRefresh&&!nodeDirty)setViewDirty(true);}}/></div>
        {mode==="evidence"&&<EvidenceView nodes={graph.nodes} byHid={byHid} onSelect={select}/>}
        {mode==="validation"&&<ValidationView findings={findings} allGsnNodes={gsnNodes} graphNodes={graph.nodes} onSelect={select}/>}
        {mode==="export"&&<div className="sstpa-gk-export"><div className="sstpa-gk-menubar"><button className="sstpa-button" onClick={()=>downloadText(`sstpa-${rootHid}-gsn.svg`,svg(),"image/svg+xml")}>SVG</button><button className="sstpa-button" onClick={()=>downloadText(`sstpa-${rootHid}-gsn.json`,json(),"application/json")}>JSON</button><button className="sstpa-button" onClick={()=>downloadText(`sstpa-${rootHid}-gsn.md`,md,"text/markdown")}>Markdown</button><span>Whole argument · working presentation</span></div><pre>{md}</pre></div>}
      </div>
      {inspector&&<fieldset className="sstpa-gk-inspector-fieldset" disabled={working||viewDirty||needsRefresh}><DetailPanel node={byHid.get(selectedHid??"")} rootHid={rootHid} graphNodes={graph.nodes} allGsnNodes={gsnNodes} graphEdges={graph.edges} evidenceNodes={nodes.filter(n=>["Validation","Verification","Loss"].includes(n.typeName))} drawerOpen={drawerOpen} onOpenDrawer={hid=>openDrawer({mode:"edit",hid})} onCommit={ops=>void commit(ops)} onSelect={select} onEditDirty={setNodeDirty} editDirty={nodeDirty}/>{viewDirty&&<p>Commit or Revert presentation changes before editing Core nodes.</p>}</fieldset>}
    </div>
    {model&&<ModelDialog structure={workingStructure} view={view} theme={theme} soiHid={soiHid} onClose={()=>setModel(false)}/>}
    {colors&&!working&&!needsRefresh&&!nodeDirty&&<ColorsDialog styles={view.nodeStyles} theme={theme} onChange={nodeStyles=>{setView(v=>({...v,nodeStyles}));setViewDirty(true);}} onClose={()=>setColors(false)}/>}
    {confirmRevert&&<ConfirmDialog title="Discard uncommitted Goal Keeper changes?" danger confirmLabel="Discard and reload" onConfirm={()=>{setConfirmRevert(false);void reload();}} onCancel={()=>setConfirmRevert(false)}>Reloading replaces your current node edits and presentation with the last committed Core values.</ConfirmDialog>}
    {confirmClose&&<ConfirmDialog title="Discard uncommitted Goal Keeper changes?" danger confirmLabel="Discard and close" onConfirm={()=>closeTool("sstpa.goalkeeper")} onCancel={()=>setConfirmClose(false)}>The last committed argument remains in Core. Your current presentation or node edits will be discarded.</ConfirmDialog>}
  </>;
}

function EvidenceView({
  nodes,
  byHid,
  onSelect,
}: {
  nodes: SoINode[];
  byHid: Map<string, SoINode>;
  onSelect: (hid: string) => void;
}) {
  const solutions = nodes.filter((n) => n.typeName === "GsnSolution");
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "var(--sstpa-sp-3)" }}>
      {solutions.map((s) => {
        const ev = evidenceFor(s, byHid);
        return (
          <div key={s.hid} className="entity-card" style={{ marginBottom: 8 }}>
            <div className="entity-card-header">
              <span className="entity-hid">{s.hid}</span>
              <span className="type-badge" style={{ background: ev.length > 0 ? "var(--sstpa-status-ok)" : "var(--sstpa-status-warn)" }}>
                {ev.length > 0 ? `${ev.length} evidence` : "incomplete — no evidence"}
              </span>
            </div>
            <div style={{ fontWeight: 700 }}>{String(s.properties.Name ?? "")}</div>
            {/* Evidence rows per §6.5.11.12: type, HID, Name, ShortDescription,
                V-method/procedure, Loss Criticality/Assurance. */}
            {ev.map(({ node: e, relType }) => (
              <div
                key={`${relType}-${e.hid}`}
                style={{ borderTop: "1px solid var(--sstpa-line-soft)", padding: "4px 0", fontSize: "0.72rem" }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="type-badge" style={{ background: "var(--sstpa-status-info)" }}>{e.typeName}</span>
                  <button className="icon-button" onClick={() => onSelect(e.hid)}>{e.hid}</button>
                  <strong>{String(e.properties.Name ?? "")}</strong>
                  <span className="mono" style={{ fontSize: "0.62rem", color: "var(--sstpa-muted)" }}>{relType}</span>
                </div>
                {String(e.properties.ShortDescription ?? "").trim() !== "" && (
                  <div style={{ color: "var(--sstpa-muted)" }}>{String(e.properties.ShortDescription)}</div>
                )}
                {e.typeName === "Validation" && String(e.properties.VMethod ?? "").trim() !== "" && (
                  <div>Validation method: {String(e.properties.VMethod)}</div>
                )}
                {e.typeName === "Verification" && String(e.properties.Procedure ?? "").trim() !== "" && (
                  <div>Verification procedure: {String(e.properties.Procedure)}</div>
                )}
                {e.typeName === "Loss" && (
                  <div>
                    Criticality: {singleTrueProp(e, CRITICALITIES)} / Assurance: {singleTrueProp(e, ASSURANCES)}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
      {solutions.length === 0 && <p style={{ color: "var(--sstpa-muted)" }}>No Solution nodes in this structure.</p>}
    </div>
  );
}

function singleTrueProp(n: SoINode, keys: readonly string[]): string {
  return keys.find((k) => n.properties[k] === true) ?? "—";
}

function ValidationView({
  findings,
  allGsnNodes,
  graphNodes,
  onSelect,
}: {
  findings: Finding[];
  allGsnNodes: SoINode[];
  graphNodes: SoINode[];
  onSelect: (hid: string) => void;
}) {
  const graphSet = new Set(graphNodes.map((n) => n.hid));
  const unreachable = allGsnNodes.filter((n) => !graphSet.has(n.hid));
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "var(--sstpa-sp-3)" }}>
      {findings.map((f, i) => (
        <div key={i} className="sstpa-alert-warning" style={{ marginBottom: 8 }}>
          <strong>{f.severity}</strong> {f.message}{" "}
          {f.nodeHid && <button className="icon-button" onClick={() => onSelect(f.nodeHid!)}>{f.nodeHid}</button>}
        </div>
      ))}
      {findings.length === 0 && <p className="state-ok">No structural findings for this Goal Structure.</p>}
      {unreachable.length > 0 && (
        <>
          <h3>Other GSN nodes in this SoI</h3><p>These may belong to other arguments. Open them in the Core drawer to inspect.</p>
          {unreachable.map((n) => (
            <button key={n.hid} className="icon-button" onClick={() => onSelect(n.hid)}>{n.hid} {String(n.properties.Name ?? "")}</button>
          ))}
        </>
      )}
    </div>
  );
}

function DetailPanel({
  node,
  rootHid,
  graphNodes,
  allGsnNodes,
  graphEdges,
  evidenceNodes,
  drawerOpen,
  onOpenDrawer,
  onCommit,
  onSelect,
  onEditDirty,
  editDirty,
}: {
  node?: SoINode;
  rootHid: string;
  graphNodes: SoINode[];
  graphEdges: GsnEdge[];
  allGsnNodes: SoINode[];
  evidenceNodes: SoINode[];
  drawerOpen: boolean;
  onOpenDrawer: (hid: string) => void;
  onCommit: (ops: CommitOperation[]) => void;
  onSelect: (hid: string) => void;
  onEditDirty: (dirty: boolean) => void;
  editDirty: boolean;
}) {
  const [newLabel, setNewLabel] = useState<GsnLabel>("GsnGoal");
  const [relType, setRelType] = useState<GsnRel>("SUPPORTED_BY");
  const [existingTarget, setExistingTarget] = useState("");
  const [evidenceTarget, setEvidenceTarget] = useState("");
  const [edit, setEdit] = useState({ name: "", statement: "", undeveloped: false, identifier: "" });
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (!node) return;
    setEdit({ name: String(node.properties.Name ?? ""), statement: statement(node), undeveloped: node.properties.Undeveloped === true, identifier: String(node.properties[`${node.typeName.slice(3)}ID`] ?? "") });
    onEditDirty(false);
  }, [node, onEditDirty]);

  if (!node) {
    return (
      <ResizablePane dock="right" storageKey="goalkeeper.detail" defaultWidth={330} style={{ padding: "var(--sstpa-sp-3)" }}>
        <p>Select a GSN node.</p>
      </ResizablePane>
    );
  }

  const canSupport = node.typeName === "GsnGoal" || node.typeName === "GsnStrategy";
  const canContext = node.typeName === "GsnGoal" || node.typeName === "GsnStrategy";
  const canEvidence = node.typeName === "GsnSolution";
  const outgoing = (node.relationships ?? []).filter((r) => ["SUPPORTED_BY", "IN_CONTEXT_OF", ...EVIDENCE_RELS].includes(r.type));
  const isRoot = rootHid === node.hid;
  const rootPath = pathToRoot(rootHid, node.hid, graphEdges);
  const idProperty = `${node.typeName.slice(3)}ID`, idValue = edit.identifier.trim();
  const numericId = Number(idValue);
  const identifierError = idValue && (!/^\d+$/.test(idValue) || !Number.isSafeInteger(numericId) || numericId < 1)
    ? "Use a positive whole number within the safe integer range."
    : idValue && graphNodes.some(other => other.hid !== node.hid && other.typeName === node.typeName && Number(other.properties[idProperty]) === numericId)
      ? "This identifier is already used by another node of this type in this argument." : "";

  const createNode = () => {
    const temp = "gsn";
    const props = defaultGsnProps(newLabel, allGsnNodes);
    const rel = relationshipFor(node.typeName, newLabel, relType);
    if (!rel) return;
    onCommit([
      { op: "createNode", tempId: temp, label: newLabel, properties: props },
      { op: "createRelationship", type: rel, sourceHid: node.hid, targetHid: `$${temp}` },
    ]);
  };

  const save = () => {
    if (identifierError) return;
    onCommit([{ op: "updateNode", hid: node.hid, properties: { Name: edit.name, ...(idValue ? { [idProperty]: numericId } : {}), [statementProp(node.typeName)]: edit.statement, ...(["GsnGoal","GsnStrategy"].includes(node.typeName)?{Undeveloped:edit.undeveloped}:{}) } }]);
  };

  /** §6.5.11.11: warn before Commit when removing a relationship would leave
   *  GSN nodes unreachable from the Root Goal. */
  const removeRelationship = (type: string, targetHid: string) => {
    const ops: CommitOperation[] = [{ op: "deleteRelationship", type, sourceHid: node.hid, targetHid }];
    const orphans = unreachableAfterRemoval(rootHid, graphNodes, graphEdges, node.hid, type, targetHid);
    if (orphans.length > 0) {
      setConfirm({
        title: "Removing this relationship orphans nodes",
        body: `Deleting ${node.hid} -[:${type}]-> ${targetHid} leaves ${orphans.length} GSN node(s) unreachable from the Root Goal: ${orphans.slice(0, 5).join(", ")}${orphans.length > 5 ? ", …" : ""}. Commit anyway?`,
        onConfirm: () => onCommit(ops),
      });
    } else {
      onCommit(ops);
    }
  };

  /** §6.5.11.13: Root Goal deletion removes the certification argument —
   *  always behind a danger confirmation. */
  const deleteNode = () => {
    setConfirm({
      title: isRoot ? "Delete Root Goal" : `Delete ${node.typeName.replace("Gsn", "")}`,
      body: isRoot
        ? `Deleting Root Goal ${node.hid} removes its links. Descendant nodes remain in Core and may become unreachable. This cannot be undone.`
        : `Delete ${node.hid} (${String(node.properties.Name ?? "")}) and all of its relationships? Descendant nodes may become unreachable.`,
      onConfirm: () => onCommit([{ op: "deleteNode", hid: node.hid }]),
    });
  };

  return (
    <ResizablePane dock="right" storageKey="goalkeeper.detail" defaultWidth={330} style={{ padding: "var(--sstpa-sp-3)" }}>
      <div className="mono" style={{ fontSize: "0.72rem", color: "var(--sstpa-muted)" }}>{node.hid}</div>
      <h3 style={{ margin: "4px 0 8px" }}>{String(node.properties.Name ?? "")}</h3>
      <GsnBadge typeName={node.typeName} />
      {gsnId(node) !== "" && (
        <span className="mono" style={{ fontSize: "0.7rem", marginLeft: 6 }}>GSN ID: {gsnId(node)}</span>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        <button className="sstpa-button" disabled={drawerOpen || editDirty} onClick={() => onOpenDrawer(node.hid)}>Open Drawer</button>
        <button className="sstpa-button danger" disabled={editDirty} onClick={deleteNode}>Delete Node</button>
      </div>

      {/* Path-to-root display (§6.5.11.17). */}
      {rootPath.length > 1 && (
        <div style={{ marginTop: 10, fontSize: "0.7rem" }}>
          <div style={{ color: "var(--sstpa-muted)" }}>Path to root</div>
          {rootPath.map((hid, i) => (
            <span key={hid}>
              {i > 0 && " -> "}
              <button className="icon-button" onClick={() => onSelect(hid)}>{hid}</button>
            </span>
          ))}
        </div>
      )}

      {GSN_LABELS.includes(node.typeName as GsnLabel) && (
        <>
          <label style={labelStyle}>{node.typeName.slice(3)} identifier<input className="sstpa-input" aria-label="GSN identifier" type="number" min="1" step="1" value={edit.identifier} onChange={e=>{setEdit(x=>({...x,identifier:e.target.value}));onEditDirty(true);}}/></label>
          <small>Positive integer; a blank entry leaves the existing value unchanged.</small>
          {identifierError&&<p role="alert">{identifierError}</p>}
          <label style={labelStyle}>Name<input aria-label="Node name" className="sstpa-input" value={edit.name} onChange={(e) => {setEdit((x) => ({ ...x, name: e.target.value }));onEditDirty(true);}} /></label>
          <label style={labelStyle}>Statement<textarea className="sstpa-input" rows={4} value={edit.statement} onChange={(e) => {setEdit((x) => ({ ...x, statement: e.target.value }));onEditDirty(true);}} /></label>
          <label>{["GsnGoal","GsnStrategy"].includes(node.typeName)&&<><input type="checkbox" checked={edit.undeveloped} onChange={e=>{setEdit(x=>({...x,undeveloped:e.target.checked}));onEditDirty(true);}}/> Undeveloped</>}</label>
          <button className="sstpa-button" disabled={!!identifierError} onClick={save}>Commit Node</button>
          {editDirty&&<button className="sstpa-button secondary" onClick={()=>{setEdit({name:String(node.properties.Name??""),statement:statement(node),undeveloped:node.properties.Undeveloped===true,identifier:String(node.properties[idProperty]??"")});onEditDirty(false);}}>Revert node edit</button>}
          {editDirty&&<p>Commit or Revert this node edit before changing presentation or other Core records.</p>}
        </>
      )}

      {(canSupport || canContext) && (
        <>
          <h4>Add GSN Node</h4>
          <div style={{ display: "flex", gap: 6 }}>
            <select className="sstpa-input" value={newLabel} onChange={(e) => setNewLabel(e.target.value as GsnLabel)}>
              {GSN_LABELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <select className="sstpa-input" value={relType} onChange={(e) => setRelType(e.target.value as GsnRel)}>
              <option>SUPPORTED_BY</option>
              <option>IN_CONTEXT_OF</option>
            </select>
          </div>
          <button className="sstpa-button" style={{ marginTop: 6 }} disabled={editDirty || !relationshipFor(node.typeName, newLabel, relType)} onClick={createNode}>
            Create
          </button>
          <h4>Link Existing</h4>
          <select className="sstpa-input" value={existingTarget} onChange={(e) => setExistingTarget(e.target.value)}>
            <option value="">Select GSN node</option>
            {graphNodes.filter((n) => n.hid !== node.hid && relationshipFor(node.typeName, n.typeName, relType)).map((n) => (
              <option key={n.hid} value={n.hid}>{n.hid} - {String(n.properties.Name ?? "")}</option>
            ))}
          </select>
          <button className="sstpa-button" style={{ marginTop: 6 }} disabled={editDirty || !existingTarget} onClick={() => onCommit([{ op: "createRelationship", type: relType, sourceHid: node.hid, targetHid: existingTarget }])}>
            Link
          </button>
        </>
      )}

      {canEvidence && (
        <>
          <h4>Evidence</h4>
          <select className="sstpa-input" value={evidenceTarget} onChange={(e) => setEvidenceTarget(e.target.value)}>
            <option value="">Select evidence</option>
            {evidenceNodes.map((n) => (
              <option key={n.hid} value={n.hid}>{n.typeName} {n.hid} - {String(n.properties.Name ?? "")}</option>
            ))}
          </select>
          <button
            className="sstpa-button"
            style={{ marginTop: 6 }}
            disabled={editDirty || !evidenceTarget}
            onClick={() => {
              const target = evidenceNodes.find((n) => n.hid === evidenceTarget);
              const type = target?.typeName === "Validation" ? "HAS_VALIDATION" : target?.typeName === "Verification" ? "HAS_VERIFICATION" : "HAS_LOSS";
              onCommit([{ op: "createRelationship", type, sourceHid: node.hid, targetHid: evidenceTarget }]);
            }}
          >
            Add Evidence
          </button>
        </>
      )}

      <h4>Outgoing</h4>
      {outgoing.map((r) => (
        <div key={`${r.type}-${r.targetHID}`} style={{ borderBottom: "1px solid var(--sstpa-line-soft)", padding: "4px 0", fontSize: "0.72rem" }}>
          <button className="icon-button" onClick={() => onSelect(r.targetHID)}>{r.type} {r.targetHID}</button>
          <button className="icon-button danger" disabled={editDirty} onClick={() => removeRelationship(r.type, r.targetHID)}>Commit Remove</button>
        </div>
      ))}
      {isRoot && <div className="state-info" style={{ marginTop: 10, fontSize: "0.72rem" }}>Root Goal</div>}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          danger
          confirmLabel="Commit"
          onConfirm={() => {
            confirm.onConfirm();
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        >
          <p>{confirm.body}</p>
        </ConfirmDialog>
      )}
    </ResizablePane>
  );
}

/** Chain from the Root Goal to the target following SUPPORTED_BY and
 *  IN_CONTEXT_OF edges (§6.5.11.17 path-to-root display). */
function pathToRoot(rootHid: string, targetHid: string, edges: GsnEdge[]): string[] {
  if (!rootHid || rootHid === targetHid) return [rootHid].filter(Boolean);
  const children = new Map<string, string[]>();
  for (const e of edges) {
    children.set(e.source, [...(children.get(e.source) ?? []), e.target]);
  }
  const parent = new Map<string, string>();
  const queue = [rootHid];
  const seen = new Set([rootHid]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const c of children.get(cur) ?? []) {
      if (seen.has(c)) continue;
      seen.add(c);
      parent.set(c, cur);
      if (c === targetHid) {
        const path = [c];
        let p: string | undefined = cur;
        while (p) {
          path.unshift(p);
          p = parent.get(p);
        }
        return path;
      }
      queue.push(c);
    }
  }
  return [];
}

/** Nodes of the structure that become unreachable from the Root Goal if one
 *  relationship is removed (§6.5.11.11 deletion safety). */
function unreachableAfterRemoval(
  rootHid: string,
  nodes: SoINode[],
  edges: GsnEdge[],
  removeSource: string,
  removeType: string,
  removeTarget: string,
): string[] {
  const inStructure = new Set(nodes.map((n) => n.hid));
  const children = new Map<string, string[]>();
  for (const e of edges) {
    if (e.source === removeSource && e.type === removeType && e.target === removeTarget) continue;
    children.set(e.source, [...(children.get(e.source) ?? []), e.target]);
  }
  const reachable = new Set([rootHid]);
  const queue = [rootHid];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const c of children.get(cur) ?? []) {
      if (!reachable.has(c)) {
        reachable.add(c);
        queue.push(c);
      }
    }
  }
  return [...inStructure].filter((hid) => !reachable.has(hid));
}

const labelStyle = { display: "block", fontSize: "0.76rem", marginTop: 8 };

function buildStructures(assets: SoINode[], losses: SoINode[], goals: SoINode[], byHid: Map<string, SoINode>): StructureOption[] {
  const out: StructureOption[] = [];
  const assetsWithGoals = assets.filter((a) => (a.relationships ?? []).some((r) => r.type === "HAS_GOAL"));
  for (const asset of assetsWithGoals) {
    const assetLosses = (asset.relationships ?? []).filter((r) => r.type === "HAS_LOSS").map((r) => byHid.get(r.targetHID)).filter((n): n is SoINode => !!n);
    const assetGoals = (asset.relationships ?? []).filter((r) => r.type === "HAS_GOAL").map((r) => byHid.get(r.targetHID)).filter((n): n is SoINode => !!n);
    for (const root of assetGoals) {
      const paired = assetLosses.find((l) => sameCriticalityAssurance(l, root)) ?? assetLosses[0];
      out.push({ asset, loss: paired, root });
    }
  }
  for (const root of goals.filter((g) => g.typeName === "GsnGoal" && !goals.some(parent => parent.relationships?.some(r => r.type === "SUPPORTED_BY" && r.targetHID === g.hid)) && !out.some((s) => s.root.hid === g.hid))) {
    const asset = assets.find((a) => (a.relationships ?? []).some((r) => r.type === "HAS_GOAL" && r.targetHID === root.hid));
    const loss = losses.find((l) => asset?.relationships?.some((r) => r.type === "HAS_LOSS" && r.targetHID === l.hid));
    out.push({ asset, loss, root });
  }
  return out.sort((a, b) => a.root.hid.localeCompare(b.root.hid));
}

function gsnId(n: SoINode): string {
  return GSN_LABELS.includes(n.typeName as GsnLabel) ? displayIdFor(n) : "";
}

function evidenceFor(solution: SoINode, byHid: Map<string, SoINode>): { node: SoINode; relType: string }[] {
  return (solution.relationships ?? [])
    .filter((r) => EVIDENCE_RELS.includes(r.type as (typeof EVIDENCE_RELS)[number]))
    .map((r) => ({ node: byHid.get(r.targetHID), relType: r.type }))
    .filter((x): x is { node: SoINode; relType: string } => !!x.node);
}

/** Search per §6.5.11.17: HID, uuid, type, name, statement text, GSN ID,
 *  and referenced evidence HIDs. */
function filterGraphNodes(nodes: SoINode[], search: string): SoINode[] {
  if (!search.trim()) return nodes;
  const q = search.toLowerCase();
  return nodes.filter((n) => {
    const evidenceHids = (n.relationships ?? [])
      .filter((r) => EVIDENCE_RELS.includes(r.type as (typeof EVIDENCE_RELS)[number]))
      .map((r) => r.targetHID)
      .join(" ");
    return `${n.hid} ${n.uuid} ${n.typeName} ${gsnId(n)} ${String(n.properties.Name ?? "")} ${statement(n)} ${evidenceHids}`
      .toLowerCase()
      .includes(q);
  });
}

/** Resolve the Root Goal for any GSN node by walking incoming SUPPORTED_BY
 *  edges upward through Goals AND Strategies until no structural parent
 *  remains (§6.5.11.8). IN_CONTEXT_OF is ignored for root resolution, except
 *  as a single anchor hop for pure context nodes (Context / Justification /
 *  Assumption), which have no SUPPORTED_BY parents of their own. */
function rootForNode(hid: string, nodes: SoINode[]): string | null {
  const byHid = new Map(nodes.map((n) => [n.hid, n]));
  const supportParents = new Map<string, string[]>();
  const contextParents = new Map<string, string[]>();
  for (const n of nodes) {
    for (const rel of n.relationships ?? []) {
      if (rel.type === "SUPPORTED_BY") {
        supportParents.set(rel.targetHID, [...(supportParents.get(rel.targetHID) ?? []), n.hid]);
      } else if (rel.type === "IN_CONTEXT_OF") {
        contextParents.set(rel.targetHID, [...(contextParents.get(rel.targetHID) ?? []), n.hid]);
      }
    }
  }
  let cur = hid;
  if (!supportParents.has(cur)) {
    const anchor = (contextParents.get(cur) ?? [])[0];
    if (anchor) cur = anchor;
  }
  const visited = new Set<string>();
  while (!visited.has(cur)) {
    visited.add(cur);
    const structural = (supportParents.get(cur) ?? []).filter((p) => {
      const t = byHid.get(p)?.typeName;
      return t === "GsnGoal" || t === "GsnStrategy";
    });
    const next = structural.find((p) => !visited.has(p));
    if (!next) break;
    cur = next;
  }
  return byHid.has(cur) ? cur : null;
}

function relationshipFor(sourceType: string, targetType: string, requested: GsnRel): GsnRel | null {
  if (requested === "SUPPORTED_BY") {
    if (sourceType === "GsnGoal" && ["GsnGoal", "GsnStrategy", "GsnSolution"].includes(targetType)) return "SUPPORTED_BY";
    if (sourceType === "GsnStrategy" && targetType === "GsnGoal") return "SUPPORTED_BY";
  }
  if (requested === "IN_CONTEXT_OF") {
    if (["GsnGoal", "GsnStrategy"].includes(sourceType) && ["GsnContext", "GsnJustification", "GsnAssumption"].includes(targetType)) return "IN_CONTEXT_OF";
  }
  return null;
}

function defaultGsnProps(label: GsnLabel, nodes: SoINode[]): Record<string, unknown> {
  const prop = statementProp(label), idProperty = `${label.slice(3)}ID`;
  const used = new Set(nodes.filter(node => node.typeName === label).map(node => Number(node.properties[idProperty])));
  let id = 1; while (used.has(id)) id++;
  return { Name: label.replace("Gsn", "New "), [idProperty]: id, [prop]: "", ...(["GsnGoal", "GsnStrategy"].includes(label) ? { Undeveloped: true } : {}) };
}

function statementProp(typeName: string): string {
  switch (typeName) {
    case "GsnStrategy": return "StrategyStatement";
    case "GsnContext": return "ContextStatement";
    case "GsnJustification": return "JustificationStatement";
    case "GsnAssumption": return "AssumptionStatement";
    case "GsnSolution": return "SolutionStatement";
    default: return "GoalStatement";
  }
}

function statement(n: SoINode): string {
  return String(n.properties[statementProp(n.typeName)] ?? "");
}

function GsnBadge({ typeName }: { typeName: string }) {
  return <span className="type-badge" style={{ background: gsnColor(typeName) }}>{typeName.replace("Gsn", "")}</span>;
}

function gsnColor(typeName: string): string {
  if (typeName === "GsnGoal") return "var(--sstpa-status-info)";
  if (typeName === "GsnStrategy") return "var(--sstpa-node-interface)";
  if (typeName === "GsnSolution") return "var(--sstpa-status-ok)";
  if (typeName === "GsnAssumption") return "var(--sstpa-status-warn)";
  if (typeName === "GsnJustification") return "var(--sstpa-node-purpose)";
  return "var(--sstpa-node-muted)";
}

function sameCriticalityAssurance(loss: SoINode, goal: SoINode): boolean {
  const c = ["SafetyCritical", "MissionCritical", "FlightCritical", "SecurityCritical"].some((k) => loss.properties[k] === true && goal.properties[k] === true);
  const a = ["Confidentiality", "Availability", "Authenticity", "NonRepudiation", "Certifiable", "Privacy", "Trustworthy"].some((k) => loss.properties[k] === true && goal.properties[k] === true);
  return c && a;
}
