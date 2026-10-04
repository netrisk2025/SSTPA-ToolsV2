// Integrated Loss Tool: authenticated Core projection, approved ELK canvas and guarded staged commits.
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { SoINode } from '../../api/types';
import { useDrawer, useToolWindows } from '../../state/stores';
import type { ToolLaunchContext, ToolManifest } from '../manifest';
import { ToolStatus, errorText } from '../shared';
import { LossCanvas } from './LossCanvas';
import { coreCandidates, fromCore, prepareCoreImport, toCoreCommit, type CoreTree } from './coreAdapter';
import type { AttackTree } from './domain/types';

export default function LossTool({ctx}: {ctx:ToolLaunchContext;manifest:ToolManifest}) {
  const qc=useQueryClient(), openTool=useToolWindows(s=>s.openTool), openDrawer=useDrawer(s=>s.openDrawer);
  const [lossHid,setLossHid]=useState(''),[dirty,setDirty]=useState(false),[coverage,setCoverage]=useState(false),[working,setWorking]=useState(false),[notice,setNotice]=useState(''),[generation,setGeneration]=useState(0);
  const [workspaceSoi,setWorkspaceSoi]=useState(ctx.soiHid);
  const focusSeen=useRef<string|null>(null);
  useEffect(()=>{if(!dirty&&!working)setWorkspaceSoi(ctx.soiHid);},[ctx.soiHid,dirty,working]);
  const soi=useQuery({queryKey:['soi',workspaceSoi],queryFn:()=>api.soi(workspaceSoi!),enabled:!!workspaceSoi});
  const nodes=useMemo(()=>soi.data?.nodes??[],[soi.data]);
  const losses=useMemo(()=>nodes.filter(n=>n.typeName==='Loss'),[nodes]);
  useEffect(()=>{
    if(dirty) return;
    const focus=ctx.focusHid??ctx.drawerNodeHid;
    const focused=losses.find(n=>n.hid===focus) ?? losses.find(n=>nodes.find(x=>x.hid===focus)?.relationships?.some(r=>r.type==='HAS_LOSS' && r.targetHID===n.hid));
    if(focused && focusSeen.current !== focus) {focusSeen.current=focus??null;setLossHid(focused.hid);}
    else if(!losses.some(n=>n.hid===lossHid)) setLossHid(losses[0]?.hid??'');
  },[ctx.focusHid,ctx.drawerNodeHid,losses,nodes,lossHid,dirty]);
  const tree=useQuery({queryKey:['loss-tree',lossHid],queryFn:()=>api.lossTree(lossHid) as Promise<CoreTree>,enabled:!!lossHid});
  const invalidate=useCallback(()=>{void qc.invalidateQueries({queryKey:['soi']});void qc.invalidateQueries({queryKey:['loss-tree',lossHid]});void qc.invalidateQueries({queryKey:['loss-paths',lossHid]});void qc.invalidateQueries({queryKey:['model']});},[qc,lossHid]);
  const rebuild=async(force:boolean)=>{
    setWorking(true);setNotice('');
    try {
      await api.lossAutoBuild(lossHid,force,Number(tree.data?.loss.AttackTreeVersion??0));
      await tree.refetch(); invalidate();setGeneration(g=>g+1);setDirty(false);setCoverage(false);setNotice('Attack tree built and committed.');
    } catch(e) {setNotice(errorText(e));} finally {setWorking(false);}
  };
  const reload=async()=>{setWorking(true);try{const r=await tree.refetch();if(r.error)throw r.error;setGeneration(g=>g+1);setNotice('Reloaded Core tree.');}catch(e){setNotice(errorText(e));}finally{setWorking(false);}};
  // Freeze the loaded baseline until an explicit reload or selection change. Background
  // cache refreshes must never replace or unmount an analyst's staged work.
  const workspaceKey=`${workspaceSoi}:${lossHid}:${generation}`;
  const [loaded,setLoaded]=useState<{key:string;response:CoreTree;tree:AttackTree|null;error:unknown}|null>(null);
  useEffect(()=>{
    if(!tree.data || loaded?.key===workspaceKey) return;
    try {setLoaded({key:workspaceKey,response:tree.data,tree:fromCore(tree.data,workspaceSoi??''),error:null});}
    catch(error){setLoaded({key:workspaceKey,response:tree.data,tree:null,error});}
  },[tree.data,workspaceKey,workspaceSoi,loaded?.key]);
  const projection=loaded?.key===workspaceKey?loaded:null;
  if(!workspaceSoi)return <ToolStatus needsSoI/>;
  if((soi.isLoading||soi.error)&&!soi.data)return <ToolStatus loading={soi.isLoading} error={soi.error} onRetry={()=>void soi.refetch()}/>;
  return <div className="sstpa-loss-host">
    <div className="sstpa-loss-hostbar">
      <label htmlFor="sstpa-loss-select" className="sr-only">Selected Loss</label>
      <select id="sstpa-loss-select" aria-label="Selected Loss" className="sstpa-input" value={lossHid} disabled={dirty||working} onChange={e=>{setLossHid(e.target.value);setNotice('');}}>
        {!losses.length && <option value="">No Loss in this SoI</option>}
        {losses.map(n=><option key={n.hid} value={n.hid}>{n.hid} · {String(n.properties.Name??'Loss')}</option>)}
      </select>
      <button className="sstpa-button secondary" disabled={!lossHid} onClick={()=>setCoverage(v=>!v)}>{coverage?'Attack tree':'Trace coverage'}</button>
      <button className="sstpa-button" disabled={!lossHid||dirty||working||tree.isLoading} onClick={()=>void rebuild(false)}>Auto-build</button>
      <button className="sstpa-button secondary" disabled={!lossHid||dirty||working||tree.isLoading} onClick={()=>void rebuild(true)}>Rebuild</button>
      <button className="sstpa-button secondary" disabled={!lossHid||dirty||working} onClick={()=>void reload()}>Reload / reconcile</button>
      <span style={{flex:1}}/>
      <select aria-label="Open related tool" className="sstpa-input" value="" onChange={e=>{if(e.target.value)openTool(e.target.value);}}>
        <option value="">Related tools…</option><option value="sstpa.trace">Trace</option><option value="sstpa.attack">Attack</option><option value="sstpa.assets">Asset Manager</option><option value="sstpa.context">Context</option><option value="sstpa.goalkeeper">Goal Keeper</option>
      </select>
    </div>
    {notice&&<div className="sstpa-alert-warning" role="status">{notice}<button className="icon-button" aria-label="Dismiss status" onClick={()=>setNotice('')}>×</button></div>}
    {workspaceSoi!==ctx.soiHid&&<div className="sstpa-alert-warning">This draft belongs to {workspaceSoi}. Commit or Revert before following the newly selected SoI.</div>}
    {dirty&&<div className="sstpa-loss-draft-hint">Commit or Revert staged changes before switching Loss, rebuilding, or reloading.</div>}
    {!losses.length?<ToolStatus empty="No Loss nodes in the current SoI." emptyHint="Use Asset Manager to define the Asset’s criticality and assurance properties, then establish its trace coverage."/>:
      !projection?<ToolStatus loading={tree.isLoading||!tree.error} error={tree.error} onRetry={()=>void tree.refetch()}/>:
      projection?.error?<ToolStatus error={projection.error}/>:
      projection?.tree&&<>
        {tree.error&&<div className="sstpa-alert-warning">Background refresh failed. Your workspace is retained. {errorText(tree.error)}</div>}
        {coverage&&<CoverageView tree={projection.response} loading={working} onBuild={()=>void rebuild(false)} disabled={dirty||working}/>}
        <div style={{display:coverage?'none':'flex',flex:1,minHeight:0,flexDirection:'column'}}>
          <CoreLossWorkspace key={workspaceKey} initial={projection.tree} response={projection.response} soiNodes={nodes} onDirtyChange={setDirty} onSaved={invalidate} onOpenNode={hid=>openDrawer({mode:'edit',hid})}/>
        </div>
      </>}
  </div>;
}
function CoreLossWorkspace({initial,response,soiNodes,onDirtyChange,onSaved,onOpenNode}:{initial:AttackTree;response:CoreTree;soiNodes:SoINode[];onDirtyChange:(v:boolean)=>void;onSaved:()=>void;onOpenNode:(hid:string)=>void}) {
  const baseline=useRef({tree:initial,response});
  const candidates=useMemo(()=>coreCandidates(soiNodes),[soiNodes]);
  const [findings,setFindings]=useState(response.validationFindings??[]);
  const needsRefresh=useRef(false);
  const save=async(draft:AttackTree)=>{
    if(needsRefresh.current) throw new Error("The previous transaction was committed. Revert and Reload / reconcile before another commit.");
    const request=toCoreCommit(draft,baseline.current.tree,baseline.current.response,soiNodes);
    try {await api.commit(request);} catch(error) {throw new Error(errorText(error));}
    needsRefresh.current=true;
    // Do not claim a saved snapshot or mint UUIDs until the committed model is reloaded.
    let saved:CoreTree;
    try { saved=await api.lossTree(draft.id) as CoreTree; }
    catch { throw new Error('The database COMMIT SUCCEEDED, but refresh failed. Your draft is retained for comparison. Export it if needed, then Revert and Reload / reconcile before further edits; do not repeat this transaction.'); }
    const tree=fromCore(saved,draft.root.soi);
    needsRefresh.current=false;
    baseline.current={tree,response:saved};setFindings(saved.validationFindings??[]);onSaved();return tree;
  };
  return <LossCanvas initialTree={initial} onCommit={save} onImport={t=>prepareCoreImport(t,baseline.current.tree,candidates)} candidates={candidates} onDirtyChange={onDirtyChange} onOpenNode={onOpenNode} findings={findings}/>;
}
function CoverageView({
  tree,
  loading,
  onBuild,
  disabled,
}: {
  tree?: { traceCoverage: Record<string, unknown>[] | null; statesCovered: number; statesTotal: number };
  loading: boolean;
  onBuild: () => void;
  disabled: boolean;
}) {
  const coverage = tree?.traceCoverage ?? [];
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "var(--sstpa-sp-3)" }}>
      {loading && <ToolStatus loading />}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <strong>{tree?.statesCovered ?? 0}</strong>
        <span>of</span>
        <strong>{tree?.statesTotal ?? 0}</strong>
        <span>Environment states have CURRENT trace coverage.</span>
        <span style={{ flex: 1 }} />
        <button className="sstpa-button" disabled={disabled} onClick={onBuild}>
          Auto-build
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid var(--sstpa-text)" }}>
            <th style={{ padding: "4px 6px" }}>State</th>
            <th>Name</th>
            <th>Sequence</th>
            <th>Traced entities</th>
          </tr>
        </thead>
        <tbody>
          {coverage.map((row) => {
            const traced = Number(row.tracedEntities ?? 0);
            return (
              <tr key={String(row.stateHid)} style={{ borderBottom: "1px solid var(--sstpa-line-soft)" }}>
                <td className="mono" style={{ padding: "4px 6px", fontSize: "0.68rem" }}>
                  {String(row.stateHid)}
                </td>
                <td>{String(row.stateName ?? "")}</td>
                <td>{String(row.seq ?? "—")}</td>
                <td>
                  <span className={traced > 0 ? "state-ok" : "state-warn"}>{traced}</span>
                </td>
              </tr>
            );
          })}
          {!loading && coverage.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 14, color: "var(--sstpa-muted)" }}>
                No coverage rows returned for this Loss.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
