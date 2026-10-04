// Loss projection and staged Core delta. Authoritative identity never comes from imported JSON.
import type { AttackTreeNode, CommitOperation, CommitRequest, LossTreeResponse, SoINode } from '../../api/types';
import { parseTree } from './domain/storage';
import { defaultView } from './defaults';
import { defaultAnalysisProfile, defaultMetricRules, validateMetricConfiguration, validateLeafMetrics } from './domain/metrics';
import { isUnsafeIdentity, validateGraph } from './domain/graph';
import type { AttackTree, MetricRule, NodeType, TreeEdge, TreeNode, ViewState } from './domain/types';

export interface CoreTree extends LossTreeResponse {
  validationFindings?: {severity:string;type:string;nodeHid?:string;message:string}[];
}
function object(value: unknown): Record<string, unknown> {
  if (typeof value === 'string' && value.trim()) {
    try { value = JSON.parse(value); } catch { throw new Error('Saved Loss JSON is malformed. Repair the Core record before saving.'); }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
}
export function savedEnvelope(response: CoreTree) { return object(response.loss.AttackTreeJSON); }
function mapType(type: string): NodeType {
  if(type === 'DerivedAsset') return 'Asset';
  if(['Loss','Environment','State','Interface','SystemFunction','Component','Attack','Countermeasure','Asset'].includes(type)) return type as NodeType;
  throw new Error(`Unsupported Attack Tree Core type: ${type}`);
}
function metricRules(raw: unknown): MetricRule[] {
  if(!raw || raw === '[]') return defaultMetricRules();
  const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if(!Array.isArray(parsed)) throw new Error('MetricDefinitionsJSON must be an array.');
  const legacy=parsed.some(r=>!r.id);
  const mapped=parsed.map(r => r.id ? r as MetricRule : ({
    ...r, id:r.MetricName, label:r.MetricName, unit:'', and:r.ANDFormula ?? 'SUM', or:r.ORFormula ?? 'MIN', sand:r.SANDFormula ?? 'SUM',
    defaultValue:r.LeafDefault ?? null, description:r.Description ?? '',
    ...(typeof r.AcceptanceThreshold === 'number' ? {threshold:r.AcceptanceThreshold,thresholdDirection:r.ThresholdDirection ?? 'BELOW'} : {}),
  }));
  return legacy ? [...mapped,...defaultMetricRules().filter(r=>!mapped.some(m=>m.id===r.id))] : mapped;
}
export function fromCoreNode(n: AttackTreeNode, id = `n-${n.uuid || n.hid}`): TreeNode {
  return {id, authoritativeUuid:n.uuid || null, hid:n.hid, label:n.name || String(n.props.Name ?? n.hid), type:mapType(n.typeName),
    description:String(n.props.ShortDescription ?? ''), provenance:n.uuid ? 'Core database' : 'Not yet committed',
    metrics:object(n.props.MetricsJSON) as TreeNode['metrics'],
    ...(n.typeName === 'Attack' ? {eventKind:n.props.AttackEventKind === 'stochastic' ? 'stochastic' as const : 'hostile' as const} : {}),
    ...(['DerivedAsset','Asset'].includes(n.typeName) ? {derived:true} : {}),
  };
}
export function coreCandidates(nodes: SoINode[]): TreeNode[] {
  return nodes.filter(n => ['State','Environment','Interface','SystemFunction','Component','Attack','Countermeasure','DerivedAsset','Asset'].includes(n.typeName)).map(n => fromCoreNode({hid:n.hid,uuid:n.uuid,typeName:n.typeName,name:String(n.properties.Name ?? n.hid),tier:0,props:n.properties}));
}
export function fromCore(response: CoreTree, soiHid: string): AttackTree {
  const root = response.loss, hid = String(root.HID), envelope=savedEnvelope(response), extension=object(envelope.lossToolView);
  if(envelope.schema !== undefined && envelope.schema !== 'SSTPA-ATF-2.0') throw new Error('Unsupported saved attack tree schema. Upgrade before editing.');
  if(envelope.schemaVersion !== undefined && envelope.schemaVersion !== '1.0') throw new Error('Unsupported saved attack tree schema version. Upgrade before editing.');
  if(extension.version !== undefined && extension.version !== 1) throw new Error('This Loss was saved by a newer canvas version. Upgrade before editing.');
  const ids=object(extension.nodeIds), used=new Set<string>();
  const nodes=(response.nodes ?? []).map(n => {
    const stored=ids[n.hid], id=typeof stored === 'string' && stored.trim() && !isUnsafeIdentity(stored) ? stored : `n-${n.uuid || n.hid}`;
    if(used.has(id)) throw new Error('Saved tree node IDs are not unique.');
    used.add(id); return fromCoreNode(n,id);
  });
  if(!nodes.some(n => n.hid === hid)) nodes.unshift(fromCoreNode({hid,uuid:String(root.uuid ?? ''),typeName:'Loss',name:String(root.Name ?? hid),tier:0,props:root}));
  const byHid=new Map(nodes.map(n => [n.hid,n]));
  const rootId=byHid.get(hid)!.id;
  used.add(rootId);
  const edges:TreeEdge[]=(response.edges ?? []).map(e => {
    const source=byHid.get(e.sourceHid), target=byHid.get(e.targetHid);
    if(!source || !target) throw new Error('Core tree contains a missing relationship endpoint.');
    const tailored=e.tailoredOut === true, blocked=e.props.CompleteBlock === true, allowed=e.props.AllowedRV === true;
    // A tuple encoding stays unique even when tree-local IDs contain separators.
    return {id:JSON.stringify([source.id,target.id]),source:source.id,target:target.id,lossId:rootId,
      gate:e.logicOperator,sequence:e.logicOperator === 'SAND' ? e.sandSequence ?? null : null,
      tailoredOut:tailored,tailoredReason:tailored ? String(e.props.TailorReason ?? '') : '',
      completeBlock:blocked,blockReason:blocked ? String(e.props.CompleteBlockReason ?? '') : '',
      allowedRV:allowed ? 1 : null,allowedReason:allowed ? String(e.props.AllowedRVReason ?? '') : ''};
  });
  const view=defaultView();
  if(extension.version === 1) {
    for(const k of ['positions','collapsed','viewport','direction','theme','selectedProperties','selectedNodeProperties','nodeStyles'] as const) {
      if(extension[k] !== undefined && k !== 'nodeStyles') (view as unknown as Record<string,unknown>)[k]=structuredClone(extension[k]);
    }
    const styles=object(extension.nodeStyles);
    for(const type of Object.keys(view.nodeStyles) as NodeType[]) view.nodeStyles[type]={...view.nodeStyles[type],...object(styles[type])};
  } else {
    // Older layout coordinates remain readable without changing the enclosing schema/snapshot.
    const layout=object(envelope.layout), positions=object(layout.positions ?? layout);
    if(Array.isArray(layout.nodes)) for(const row of layout.nodes) {
      const saved=object(row),n=nodes.find(n=>n.hid===saved.nodeKey);
      if(n && Number.isFinite(saved.xPosition)) {
        view.positions[n.id]={x:Number(saved.xPosition),y:Number.isFinite(saved.yPosition)?Number(saved.yPosition):Number(saved.tier??0)*240};
        if(saved.isExpanded===false)view.collapsed.push(n.id);
      }
    }
    const camera=object(layout.viewport);
    if(Number.isFinite(camera.zoom) && Number(camera.zoom)>0) {
      const x=Number(camera.centerX??0),y=Number(camera.centerY??0);
      if(!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Saved legacy camera center is malformed. Repair the Core record before saving.');
      view.legacyCenter={x,y,zoom:Number(camera.zoom)};
    }
    for(const n of nodes) { const p=object(positions[n.hid] ?? positions[n.id]); if(Number.isFinite(p.x) && Number.isFinite(p.y)) view.positions[n.id]={x:Number(p.x),y:Number(p.y)}; }
  }
  // Stale view references never hide or create semantic data.
  view.collapsed=Array.isArray(view.collapsed) ? view.collapsed.filter(id => used.has(id)) : [];
  view.positions=Object.fromEntries(Object.entries(view.positions ?? {}).filter(([id,p]) => used.has(id) && p && Number.isFinite(p.x) && Number.isFinite(p.y)));
  const rules=metricRules(root.MetricDefinitionsJSON);
  const profile=root.AnalysisProfileJSON ? object(root.AnalysisProfileJSON) : {...defaultAnalysisProfile(),actorName:'Analyst-defined adversary',victimName:'System operator',mode:root.MetricDefinitionsJSON && root.MetricDefinitionsJSON !== '[]' ? 'scalar' : 'scenario'};
  const label=(r:Record<string,unknown>|null) => r ? `${r.HID ?? ''} · ${r.Name ?? ''}` : 'Not assigned';
  const assurances=['Confidentiality','Availability','Authenticity','NonRepudiation','Certifiable','Privacy','Trustworthy'] as const;
  const result:AttackTree={schemaVersion:1,revision:Number(root.AttackTreeVersion ?? 0),id:hid,name:String(root.Name ?? hid),rootId,
    core:{status:String(root.AttackTreeStatus ?? 'NOT_BUILT'),loadedVersion:Number(root.AttackTreeVersion??0),attackTreeJSON:structuredClone(envelope),findings:structuredClone(response.validationFindings??[])},
    createdAt:String(root.Created ?? root.LastTouch ?? ''),updatedAt:String(root.AttackTreeLastModified ?? root.LastTouch ?? ''),nodes,edges,
    root:{MetricDefinitionsJSON:rules,AnalysisProfileJSON:profile as unknown as AttackTree['root']['AnalysisProfileJSON'],AttackTreeJSON:view,
      asset:label(response.asset),environment:label(response.environment),soi:soiHid,
      criticality:['SafetyCritical','MissionCritical','FlightCritical','SecurityCritical'].filter(k=>root[k] === true).join(', ') || 'Not assigned',
      assurance:assurances.find(k=>root[k] === true) ?? 'Authenticity'}};
  const graphErrors=validateGraph(result).filter(f=>f.severity==='error');
  if(graphErrors.length) throw new Error(`Core attack tree needs repair: ${graphErrors.map(f=>f.message).join(' ')}`);
  parseTree(JSON.stringify(result));
  return result;
}
function edgeProperties(e:TreeEdge, lossHid:string) {
  return {LossHID:lossHid,LogicOperator:e.gate,SANDSequence:e.sequence,TailoredOut:e.tailoredOut,TailorReason:e.tailoredOut ? e.tailoredReason : null,
    CompleteBlock:e.completeBlock,CompleteBlockReason:e.completeBlock ? e.blockReason : null,AllowedRV:e.allowedRV === 1,AllowedRVReason:e.allowedRV === 1 ? e.allowedReason : null};
}
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function prepareCoreImport(imported:AttackTree, committed:AttackTree, candidates:TreeNode[]):AttackTree {
  if(imported.id !== committed.id || imported.nodes.find(n=>n.id===imported.rootId)?.hid !== committed.id) throw new Error('Import must belong to the selected Loss.');
  const authority=new Map([...candidates,...committed.nodes].filter(n=>n.authoritativeUuid).map(n=>[n.hid,n]));
  const next=structuredClone(imported);
  for(const n of next.nodes) {
    const actual=authority.get(n.hid);
    if(actual) {
      if(actual.type !== n.type || (n.authoritativeUuid && n.authoritativeUuid !== actual.authoritativeUuid)) throw new Error(`Imported identity does not match Core: ${n.hid}`);
      n.authoritativeUuid=actual.authoritativeUuid; n.provenance='Core database';
    } else {
      if(!n.hid.startsWith('LOCAL_') || n.authoritativeUuid || !['Attack','Countermeasure'].includes(n.type)) throw new Error(`Unknown Core identity: ${n.hid}. Create or associate the element in SSTPA first.`);
      n.authoritativeUuid=null; n.provenance='Not yet committed';
    }
  }
  next.revision=committed.revision; next.core=structuredClone(committed.core);
  for(const key of ['asset','environment','soi','criticality','assurance'] as const) next.root[key]=committed.root[key] as never;
  return next;
}
export function toCoreCommit(draft:AttackTree, baseline:AttackTree, response:CoreTree, soiNodes:SoINode[]):CommitRequest {
  const errors=validateGraph(draft).filter(f=>f.severity==='error').map(f=>f.message);
  errors.push(...validateMetricConfiguration(draft.root.MetricDefinitionsJSON,draft.root.AnalysisProfileJSON));
  const parents=new Set(draft.edges.map(e=>e.source));
  for(const n of draft.nodes) if(!parents.has(n.id)) errors.push(...validateLeafMetrics(n.metrics,draft.root.MetricDefinitionsJSON));
  if(errors.length) throw new Error(errors.join('\n'));
  const candidates=coreCandidates(soiNodes);
  const checked=prepareCoreImport(draft,baseline,candidates);
  const ops:CommitOperation[]=[], byId=new Map(checked.nodes.map(n=>[n.id,n])), before=new Map([...candidates,...baseline.nodes].map(n=>[n.hid,n]));
  const refs=new Map<string,string>(), security=soiNodes.find(n=>n.typeName==='Security');
  for(const n of checked.nodes) {
    if(n.authoritativeUuid) refs.set(n.id,n.hid);
    else {
      const tempId=`loss-${n.id}`; refs.set(n.id,`$${tempId}`);
      ops.push({op:'createNode',tempId,label:n.type,properties:{Name:n.label,ShortDescription:n.description,
        ...(n.type === 'Attack' ? {AttackLevel:'TACTIC',AttackEventKind:n.eventKind ?? 'hostile',MetricsJSON:JSON.stringify(n.metrics)} : {})}});
      if(n.type === 'Countermeasure' && security) ops.push({op:'createRelationship',type:'HAS_COUNTERMEASURE',sourceHid:security.hid,targetHid:`$${tempId}`});
    }
    const old=before.get(n.hid);
    if(old) {
      const properties:Record<string,unknown>={};
      if(n.label!==old.label) properties.Name=n.label;
      if(n.description!==old.description) properties.ShortDescription=n.description;
      if(!same(n.metrics,old.metrics)) properties.MetricsJSON=JSON.stringify(n.metrics);
      if(n.type==='Attack' && n.eventKind!==old.eventKind) properties.AttackEventKind=n.eventKind ?? 'hostile';
      if(Object.keys(properties).length) ops.push({op:'updateNode',hid:n.hid,properties});
    }
  }
  const pair=(e:TreeEdge,t:AttackTree)=>`${t.nodes.find(n=>n.id===e.source)?.hid}\0${t.nodes.find(n=>n.id===e.target)?.hid}`;
  const priorEdges=new Map(baseline.edges.map(e=>[pair(e,baseline),e]));
  const afterEdges=new Map(checked.edges.map(e=>[pair(e,checked),e]));
  for(const [key,old] of priorEdges) {
    const current=afterEdges.get(key);
    if(!current || !same(edgeProperties(old,draft.id),edgeProperties(current,draft.id))) {
      ops.push({op:'deleteRelationship',type:'AT_RELATES_TO',sourceHid:baseline.nodes.find(n=>n.id===old.source)!.hid,targetHid:baseline.nodes.find(n=>n.id===old.target)!.hid,properties:{LossHID:draft.id}});
    }
  }
  const canonical=new Set<string>();
  const addCanonical=(type:string,source:string,target:string)=>{
    const key=`${type}:${source}:${target}`;
    if(!canonical.has(key) && !soiNodes.find(n=>n.hid===source)?.relationships?.some(r=>r.type===type && r.targetHID===target)) {canonical.add(key);ops.push({op:'createRelationship',type,sourceHid:source,targetHid:target});}
  };
  for(const [key,e] of afterEdges) {
    const old=priorEdges.get(key); if(old && same(edgeProperties(old,draft.id),edgeProperties(e,draft.id))) continue;
    const source=refs.get(e.source)!,target=refs.get(e.target)!,a=byId.get(e.source)!,b=byId.get(e.target)!;
    if(!old) {
      if(['Interface','SystemFunction','Component'].includes(a.type) && b.type==='Attack') addCanonical('EXPLOITS',target,source);
      if(a.type==='Countermeasure' && b.type==='Attack') addCanonical('DEFEATS',target,source);
      if(a.type==='Attack' && b.type==='Countermeasure') addCanonical('BLOCKS',target,source);
      if(a.type==='Attack' && b.type==='Attack') addCanonical('SUBORDINATE_TO',target,source);
      if(a.type==='Countermeasure' && b.type==='Asset' && !soiNodes.find(n=>n.hid===b.hid)?.relationships.some(r=>r.type==='DERIVED_FROM' && r.targetHID===String(response.asset?.HID ?? ''))) throw new Error('Associate a canonical derived Asset through Asset Manager before linking it here.');
    }
    ops.push({op:'createRelationship',type:'AT_RELATES_TO',sourceHid:source,targetHid:target,properties:edgeProperties(e,draft.id)});
  }
  const envelope=savedEnvelope(response), oldView=object(envelope.lossToolView);
  const nodeIds=Object.fromEntries(checked.nodes.map(n=>[refs.get(n.id)!,n.id]));
  const view:ViewState=checked.root.AttackTreeJSON;
  const definitions=checked.root.MetricDefinitionsJSON.map(r=>({...r,MetricName:r.id,MetricDirection:(r as MetricRule & {MetricDirection?:string}).MetricDirection ?? (r.or==='MAX'?'MAXIMIZE':'MINIMIZE'),LeafDefault:r.defaultValue,ANDFormula:r.and,ORFormula:r.or,SANDFormula:r.sand,Description:r.description ?? '',...(r.threshold!==undefined?{AcceptanceThreshold:r.threshold,ThresholdDirection:r.thresholdDirection}:{} )}));
  ops.push({op:'updateNode',hid:draft.id,properties:{AttackTreeJSON:JSON.stringify({...envelope,lossToolView:{...oldView,version:1,...view,nodeIds}}),MetricDefinitionsJSON:JSON.stringify(definitions),AnalysisProfileJSON:JSON.stringify(checked.root.AnalysisProfileJSON),AttackTreeStatus:'ANALYST_REFINED'}});
  return {toolId:'sstpa.loss',soiHid:draft.root.soi,lossPreconditions:[{lossHid:draft.id,attackTreeVersion:baseline.revision}],operations:ops};
}
