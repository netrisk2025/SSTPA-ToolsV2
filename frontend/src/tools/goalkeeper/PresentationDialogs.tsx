import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ModelTextPanel } from "../ModelTextPanel";
import { GsnCanvas } from "./GsnCanvas";
import { GSN_TYPES, type GoalStructure, type GsnType } from "./domain/model/types";
import { contrastRatio, getNodeStyle, type DiagramTheme, type GsnNodeStyles } from "./domain/presentation/colors";
import type { CoreView } from "./core-adapter";

function PresentationDialog({title,wide=false,onClose,children}:{title:string;wide?:boolean;onClose:()=>void;children:ReactNode}) {
  const dialog=useRef<HTMLDialogElement>(null),invoker=useRef(document.activeElement as HTMLElement|null);
  useLayoutEffect(()=>{const el=dialog.current,previous=invoker.current;el?.showModal();return()=>{el?.close();previous?.focus?.();};},[]);
  return <dialog ref={dialog} className={`sstpa-gk-dialog ${wide?"sstpa-gk-dialog-wide":""}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{
    if(e.key!=="Tab")return;
    const stops=[...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')];const first=stops[0],last=stops[stops.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }}><div className="sstpa-gk-dialog-header"><h2>{title}</h2><button autoFocus className="sstpa-button secondary" onClick={onClose}>Close</button></div>{children}</dialog>;
}

/** Same native type selector and four-channel controls as the approved Loss Tool. */
export function ColorsDialog({styles,theme,onChange,onClose}:{styles:GsnNodeStyles;theme:DiagramTheme;onChange:(styles:GsnNodeStyles)=>void;onClose:()=>void}) {
  const [type,setType]=useState<GsnType>("GsnGoal");
  const selected=getNodeStyle(type,theme,styles),ratio=contrastRatio(selected.font,selected.box);
  const names={font:"Font",box:"Fill",line:"Connector",border:"Boundary"};
  return <PresentationDialog title="Node type colors" onClose={onClose}><div className="sstpa-gk-color-body">
    <p>Four color channels per node type. Outgoing connectors use the source type’s color.</p>
    <label>Node type<select className="sstpa-input" aria-label="Color node type" value={type} onChange={e=>setType(e.target.value as GsnType)}>{GSN_TYPES.map(t=><option key={t} value={t}>{t.replace("Gsn","")}</option>)}</select></label>
    <div className="sstpa-gk-color-grid">{(["font","box","line","border"] as const).map(channel=><label key={channel}>{names[channel]} color<input type="color" aria-label={`${names[channel]} color`} value={selected[channel]} onInput={e=>onChange({...styles,[type]:{...selected,[channel]:e.currentTarget.value}})} onChange={e=>onChange({...styles,[type]:{...selected,[channel]:e.target.value}})}/><code>{selected[channel]}</code></label>)}</div>
    <p role="status">Text contrast {ratio.toFixed(1)}:1{ratio<4.5?" · Low contrast; choose clearer font and fill colors for customer documents.":""}</p>
    <p className="sstpa-gk-metadata">Colors are staged. Commit presentation to save them with this argument.</p>
    <div className="sstpa-gk-dialog-actions"><button className="sstpa-button secondary" onClick={()=>onChange({})}>Reset default colors</button><button className="sstpa-button" onClick={onClose}>Done</button></div>
  </div></PresentationDialog>;
}

export function ModelDialog({structure,view,theme,soiHid,onClose}:{structure:GoalStructure;view:CoreView;theme:DiagramTheme;soiHid:string;onClose:()=>void}) {
  const [tab,setTab]=useState<"graph"|"text">("graph");
  return <PresentationDialog title="SysML / KerML equivalent" wide onClose={onClose}>
    <div className="sstpa-gk-menubar"><button className="sstpa-button secondary" onClick={()=>setTab("graph")}>Model graph</button><button className="sstpa-button secondary" onClick={()=>setTab("text")}>Backend model text</button></div>
    <p className="sstpa-gk-model-scope">{tab==="graph"?"Read-only projection of the current argument · not parser-validated interchange":`Read-only Backend G2M · complete SoI ${soiHid} (not limited to this argument)`}</p>
    {tab==="graph"?<GsnCanvas structure={structure} positions={view.positions} viewport={view.viewport} setViewport={()=>{}} theme={theme} selectedId={null} errorIds={new Set()} revealToken={0} graphEpoch={0} onSelect={()=>{}} onDrag={()=>{}} onInteraction={()=>{}} projection/>:<div className="sstpa-gk-model-text"><ModelTextPanel toolId="sstpa.goalkeeper.popup" languages={["SYSML","KERML"]} soiHid={soiHid}/></div>}
  </PresentationDialog>;
}
