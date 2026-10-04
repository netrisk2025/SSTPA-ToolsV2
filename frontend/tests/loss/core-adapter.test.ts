import {describe,it,expect} from 'vitest';
import {fromCore,prepareCoreImport,toCoreCommit,coreCandidates,type CoreTree} from '../../src/tools/loss/coreAdapter';
import {defaultAnalysisProfile,defaultMetricRules,validateMetricConfiguration} from '../../src/tools/loss/domain/metrics';
import {makeEdge} from '../../src/tools/loss/domain/graph';
import {defaultView,defaultStyles} from '../../src/tools/loss/defaults';
import type {SoINode} from '../../src/api/types';
const uuid=(i:number)=>`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
function fixture():CoreTree {
  const rows=[['LOS_1_1','Loss','Loss of authentic reports'],['ENV_1_1','Environment','Orbit'],['ST_1_1','State','Observing'],['EL_1_1','Component','Processor'],['ATK_1_1','Attack','Spoof report']];
  const nodes=rows.map(([hid,typeName,name],i)=>({hid,typeName,name,uuid:uuid(i),tier:i,props:{HID:hid,uuid:uuid(i),Name:name,MetricsJSON:typeName==='Attack'?JSON.stringify({AttackCost:100}):null}}));
  const pairs=[[0,1],[0,2],[2,3],[3,4]];
  return {loss:{...nodes[0].props,AttackTreeVersion:7,Authenticity:true,MissionCritical:true,AttackTreeJSON:JSON.stringify({schemaVersion:'1.0',validationSnapshot:{nodes:[{HID:'LOS_1_1'}]},unknown:{retain:true},layout:{}})},
    asset:{HID:'AST_1_1',Name:'Fire reports'},environment:nodes[1].props,nodes,
    edges:pairs.map(([a,b])=>({sourceHid:nodes[a].hid,targetHid:nodes[b].hid,logicOperator:b===1?'AND':'OR',tailoredOut:false,props:{LossHID:'LOS_1_1'}})),traceCoverage:[],statesCovered:1,statesTotal:1};
}
function soi(response:CoreTree):SoINode[] {return response.nodes!.map(n=>({hid:n.hid,uuid:n.uuid,typeName:n.typeName,properties:n.props,soi:'1',labels:[n.typeName],relationships:[]}));}
function lastProperties(request:ReturnType<typeof toCoreCommit>){return request.operations.at(-1)!.properties!;}
describe('production Core adapter and identity boundary',()=>{
  it('projects the actual Core UUID independently from stable tree-local ID',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,nodeIds:{ATK_1_1:'attack-local-44'}}});
    const t=fromCore(r,'SYS_1_0'),n=t.nodes.find(n=>n.hid==='ATK_1_1')!;
    expect(n.id).toBe('attack-local-44');expect(n.authoritativeUuid).toBe(uuid(4));expect(n.provenance).toBe('Core database');
  });
  it('preserves legacy snapshot/schema/unknown fields when staging the additive view',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),draft=structuredClone(t);draft.root.AttackTreeJSON.collapsed=[draft.rootId];
    const req=toCoreCommit(draft,t,r,soi(r));expect(req.lossPreconditions).toEqual([{lossHid:'LOS_1_1',attackTreeVersion:7}]);
    const saved=JSON.parse(lastProperties(req).AttackTreeJSON as string);
    expect(saved).toMatchObject({schemaVersion:'1.0',validationSnapshot:{nodes:[{HID:'LOS_1_1'}]},unknown:{retain:true},layout:{},lossToolView:{version:1,collapsed:[draft.rootId]}});
    expect(req.operations.some(o=>o.type==='AT_RELATES_TO')).toBe(false);
  });
  it('migrates ATF-2.0 nodeKey coordinates, folds and camera without replacing envelope',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({schema:'SSTPA-ATF-2.0',layout:{nodes:[{nodeKey:'ATK_1_1',xPosition:42,yPosition:900,isExpanded:false}],viewport:{centerX:100,centerY:200,zoom:.5}}});
    const t=fromCore(r,'SYS_1_0'),n=t.nodes.find(n=>n.hid==='ATK_1_1')!;
    expect(t.root.AttackTreeJSON.positions[n.id]).toEqual({x:42,y:900});expect(t.root.AttackTreeJSON.collapsed).toContain(n.id);expect(t.root.AttackTreeJSON.legacyCenter).toEqual({x:100,y:200,zoom:.5});
    expect(JSON.parse(lastProperties(toCoreCommit(t,t,r,soi(r))).AttackTreeJSON as string).schema).toBe('SSTPA-ATF-2.0');
  });
  it('retains inserted root coordinates when API has no built tree yet',()=>{
    const r=fixture();r.nodes=[];r.edges=[];r.loss.AttackTreeJSON=JSON.stringify({layout:{LOS_1_1:{x:1,y:2}}});
    const t=fromCore(r,'SYS_1_0');expect(t.root.AttackTreeJSON.positions[t.rootId]).toEqual({x:1,y:2});
  });
  it('rejects a future view version before editing',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:8}});expect(()=>fromCore(r,'SYS_1_0')).toThrow(/newer/);
  });
  it('rejects duplicate local IDs from a saved view',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,nodeIds:{LOS_1_1:'same',ATK_1_1:'same'}}});expect(()=>fromCore(r,'SYS_1_0')).toThrow(/not unique/);
  });
  it('retains legacy formulas/defaults and selects explicit scalar bounds on migration',()=>{
    const r=fixture();r.loss.MetricDefinitionsJSON=JSON.stringify([{MetricName:'AttackCost',LeafDefault:123,ANDFormula:'MAX',ORFormula:'MIN',SANDFormula:'SUM'}]);
    const t=fromCore(r,'SYS_1_0');expect(t.root.MetricDefinitionsJSON.find(m=>m.id==='AttackCost')).toMatchObject({defaultValue:123,and:'MAX',or:'MIN'});expect(t.root.AnalysisProfileJSON.mode).toBe('scalar');
    expect(validateMetricConfiguration(t.root.MetricDefinitionsJSON,t.root.AnalysisProfileJSON)).toEqual([]);
  });
  it('retains explicit production profile and all seven assurances',()=>{
    const r=fixture();r.loss.Authenticity=false;r.loss.NonRepudiation=true;r.loss.AnalysisProfileJSON=JSON.stringify({...defaultAnalysisProfile(),actorName:'Analyst actor'});r.loss.MetricDefinitionsJSON=JSON.stringify(defaultMetricRules());
    const t=fromCore(r,'SYS_1_0');expect(t.root.assurance).toBe('NonRepudiation');expect(t.root.AnalysisProfileJSON.actorName).toBe('Analyst actor');
  });
  it('creates a staged Countermeasure with canonical BLOCKS and temp identity resolution',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t),a=d.nodes.find(n=>n.type==='Attack')!;
    d.nodes.push({id:'new-cm',hid:'LOCAL_new-cm',authoritativeUuid:null,label:'Sign report',type:'Countermeasure',description:'',provenance:'Not yet committed',metrics:{}});d.edges.push(makeEdge(d,a.id,'new-cm'));
    const req=toCoreCommit(d,t,r,soi(r)),view=JSON.parse(lastProperties(req).AttackTreeJSON as string).lossToolView;
    expect(req.operations).toContainEqual(expect.objectContaining({op:'createNode',tempId:'loss-new-cm',label:'Countermeasure'}));
    expect(req.operations).toContainEqual({op:'createRelationship',type:'BLOCKS',sourceHid:'$loss-new-cm',targetHid:'ATK_1_1'});
    expect(view.nodeIds['$loss-new-cm']).toBe('new-cm');expect(req.operations.some(o=>o.properties?.uuid)).toBe(false);
    expect(d.nodes.at(-1)!.authoritativeUuid).toBeNull();
  });
  it('removes only Loss-scoped tree edges and preserves canonical Core entities',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);d.nodes=d.nodes.filter(n=>n.type!=='Attack');d.edges=d.edges.filter(e=>d.nodes.some(n=>n.id===e.target));
    const req=toCoreCommit(d,t,r,soi(r));expect(req.operations.filter(o=>o.op==='deleteRelationship')).toEqual([{op:'deleteRelationship',type:'AT_RELATES_TO',sourceHid:'EL_1_1',targetHid:'ATK_1_1',properties:{LossHID:'LOS_1_1'}}]);expect(req.operations.some(o=>o.op==='deleteNode')).toBe(false);
  });
  it('validates imported UUID against authenticated identity rather than trusting a syntactically valid value',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);d.nodes.at(-1)!.authoritativeUuid=uuid(999);
    expect(()=>prepareCoreImport(d,t,coreCandidates(soi(r)))).toThrow(/does not match Core/);
  });
  it('resolves missing imported authority from actual Core only',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);d.nodes.at(-1)!.authoritativeUuid=null;
    expect(prepareCoreImport(d,t,[]).nodes.at(-1)!.authoritativeUuid).toBe(uuid(4));
  });
  it('rejects another Loss and foreign fake reference nodes',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);d.id='LOS_2_1';expect(()=>prepareCoreImport(d,t,[])).toThrow(/selected Loss/);
    d.id=t.id;d.nodes.at(-1)!.hid='DEMO_FAKE';d.nodes.at(-1)!.authoritativeUuid=null;expect(()=>prepareCoreImport(d,t,[])).toThrow(/Unknown Core/);
  });
  it('revalidates an invalid candidate atomically before producing any operation',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);d.edges.push({...d.edges[0],id:'cycle',source:d.nodes.at(-1)!.id,target:d.rootId});
    expect(()=>toCoreCommit(d,t,r,soi(r))).toThrow(/Cycles/);expect(t.edges).toHaveLength(4);
  });
  it('keeps distinct relationships unique when local IDs contain the former edge separator',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,nodeIds:{LOS_1_1:'a',ENV_1_1:'b--c',ST_1_1:'a--b',EL_1_1:'c'}}});
    const t=fromCore(r,'SYS_1_0');
    const environmentEdge=t.edges.find(e=>e.source==='a'&&e.target==='b--c')!;
    const elementEdge=t.edges.find(e=>e.source==='a--b'&&e.target==='c')!;
    expect(environmentEdge.id).not.toBe(elementEdge.id);
    expect(new Set(t.edges.map(e=>e.id)).size).toBe(t.edges.length);
    const d=structuredClone(t);d.edges.find(e=>e.id===elementEdge.id)!.gate='AND';
    const req=toCoreCommit(d,t,r,soi(r));
    expect(req.operations.filter(o=>o.op==='deleteRelationship')).toEqual([{op:'deleteRelationship',type:'AT_RELATES_TO',sourceHid:'ST_1_1',targetHid:'EL_1_1',properties:{LossHID:'LOS_1_1'}}]);
    expect(req.operations.filter(o=>o.op==='createRelationship')).toEqual([expect.objectContaining({type:'AT_RELATES_TO',sourceHid:'ST_1_1',targetHid:'EL_1_1',properties:expect.objectContaining({LogicOperator:'AND'})})]);
    const reload=structuredClone(r);Object.assign(reload.loss,lastProperties(req));reload.edges!.find(e=>e.sourceHid==='ST_1_1')!.logicOperator='AND';
    const restored=fromCore(reload,'SYS_1_0');
    expect(restored.edges.map(e=>e.id)).toEqual(t.edges.map(e=>e.id));
    expect(restored.edges.find(e=>e.id===environmentEdge.id)!.gate).toBe('AND');
    expect(toCoreCommit(restored,restored,reload,soi(reload)).operations.some(o=>o.type==='AT_RELATES_TO')).toBe(false);
  });
  it('stages edits made to an existing candidate after linking it into this Loss',()=>{
    const r=fixture(),t=fromCore(r,'SYS_1_0'),d=structuredClone(t);
    const existing:SoINode={hid:'ATK_1_2',uuid:uuid(8),typeName:'Attack',properties:{HID:'ATK_1_2',Name:'Candidate attack',ShortDescription:'Original description',MetricsJSON:JSON.stringify({AttackCost:50}),AttackEventKind:'hostile'},soi:'1',labels:['Attack'],relationships:[]};
    const candidate=coreCandidates([existing])[0];
    d.nodes.push({...candidate,label:'Edited candidate',description:'Edited before first Commit',metrics:{AttackCost:250},eventKind:'stochastic'});
    d.edges.push(makeEdge(d,d.nodes.find(n=>n.type==='Component')!.id,candidate.id));
    const req=toCoreCommit(d,t,r,[...soi(r),existing]);
    expect(req.operations).toContainEqual({op:'updateNode',hid:'ATK_1_2',properties:{Name:'Edited candidate',ShortDescription:'Edited before first Commit',MetricsJSON:JSON.stringify({AttackCost:250}),AttackEventKind:'stochastic'}});
    expect(req.operations).toContainEqual({op:'createRelationship',type:'EXPLOITS',sourceHid:'ATK_1_2',targetHid:'EL_1_1'});
    expect(req.operations.some(o=>o.op==='createNode')).toBe(false);
    expect(existing.properties.Name).toBe('Candidate attack');expect(t.nodes.some(n=>n.hid==='ATK_1_2')).toBe(false);
  });
  it('restores imported authoritative context and revision while retaining analyst view and rules',()=>{
    const r=fixture();r.validationFindings=[{severity:'warning',type:'TRACE',message:'Actual Core finding'}];
    const t=fromCore(r,'SYS_1_0'),d=structuredClone(t);
    d.revision=999;d.core={status:'FORGED',loadedVersion:999,attackTreeJSON:{validationSnapshot:'forged'},findings:[]};
    d.root.asset='forged asset';d.root.environment='forged environment';d.root.soi='SYS_9_0';d.root.criticality='forged criticality';d.root.assurance='Privacy';
    d.root.AttackTreeJSON.direction='RIGHT';d.root.AttackTreeJSON.positions[d.rootId]={x:88,y:99};
    d.root.MetricDefinitionsJSON[0].defaultValue=321;d.root.AnalysisProfileJSON.actorName='Imported analyst profile';
    const prepared=prepareCoreImport(d,t,coreCandidates(soi(r)));
    expect(prepared.revision).toBe(7);expect(prepared.core).toEqual(t.core);expect(prepared.core).not.toBe(t.core);
    for(const key of ['asset','environment','soi','criticality','assurance'] as const) expect(prepared.root[key]).toEqual(t.root[key]);
    expect(prepared.root.AttackTreeJSON.direction).toBe('RIGHT');expect(prepared.root.AttackTreeJSON.positions[prepared.rootId]).toEqual({x:88,y:99});
    expect(prepared.root.MetricDefinitionsJSON[0].defaultValue).toBe(321);expect(prepared.root.AnalysisProfileJSON.actorName).toBe('Imported analyst profile');
    expect(toCoreCommit(prepared,t,r,soi(r)).soiHid).toBe('SYS_1_0');
  });
  it.each([['MAXIMIZE','MIN'],['MINIMIZE','MAX']])('preserves explicit legacy MetricDirection %s independently from OR %s through successive saves',(direction,or)=>{
    const r=fixture();r.loss.MetricDefinitionsJSON=JSON.stringify([{MetricName:'AttackCost',MetricDirection:direction,LeafDefault:12,ANDFormula:'MAX',ORFormula:or,SANDFormula:'SUM'}]);
    let t=fromCore(r,'SYS_1_0');
    for(let save=0;save<2;save++) {
      const props=lastProperties(toCoreCommit(t,t,r,soi(r)));
      expect(JSON.parse(props.MetricDefinitionsJSON as string).find((m:{MetricName:string})=>m.MetricName==='AttackCost')).toMatchObject({MetricDirection:direction,ORFormula:or,LeafDefault:12,ANDFormula:'MAX',SANDFormula:'SUM'});
      Object.assign(r.loss,props);t=fromCore(r,'SYS_1_0');
    }
  });
  it.each([{}, {Attack:{box:'#123456'}}, {Attack:{font:'#abcdef',border:'#fedcba'},Loss:{line:'#010203'}}])('merges partial saved palettes over complete defaults: %j',(styles)=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,nodeStyles:styles}});
    const t=fromCore(r,'SYS_1_0'),expected=defaultStyles();
    for(const [type,style] of Object.entries(styles)) Object.assign(expected[type as keyof typeof expected],style);
    expect(t.root.AttackTreeJSON.nodeStyles).toEqual(expected);
    const reload=structuredClone(r);Object.assign(reload.loss,lastProperties(toCoreCommit(t,t,r,soi(r))));
    expect(fromCore(reload,'SYS_1_0').root.AttackTreeJSON.nodeStyles).toEqual(expected);
  });
  it.each([
    {direction:'UP'}, {theme:'unknown'}, {viewport:{x:0,y:0,zoom:'1'}}, {viewport:{x:0,y:0,zoom:0}},
    {selectedProperties:null}, {selectedNodeProperties:['unknown']}, {nodeStyles:{Attack:{box:'red'}}},
  ])('rejects malformed saved presentation before canvas mounting: %j',(view)=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,...view}});
    expect(()=>fromCore(r,'SYS_1_0')).toThrow(/Invalid root context or presentation properties|Invalid node type colors/);
  });
  it('discards stale or nonfinite saved position and fold references without changing the graph',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({lossToolView:{version:1,nodeIds:{ATK_1_1:'leaf'},collapsed:['gone','leaf'],positions:{gone:{x:1,y:2},leaf:{x:null,y:30}}}});
    const t=fromCore(r,'SYS_1_0');expect(t.root.AttackTreeJSON.collapsed).toEqual(['leaf']);expect(t.root.AttackTreeJSON.positions).toEqual({});expect(t.nodes).toHaveLength(5);expect(t.edges).toHaveLength(4);
  });
  it('rejects a cyclic Core projection before layout or route analysis begins',()=>{
    const r=fixture();r.edges!.push({sourceHid:'ATK_1_1',targetHid:'ATK_1_1',logicOperator:'OR',tailoredOut:false,props:{LossHID:'LOS_1_1'}});
    expect(()=>fromCore(r,'SYS_1_0')).toThrow(/Core attack tree needs repair:.*Cycles/);
  });
  it('keeps a legacy world-space center separate from screen-space viewport translation',()=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({schema:'SSTPA-ATF-2.0',layout:{viewport:{centerX:100,centerY:-200,zoom:.5}}});
    const t=fromCore(r,'SYS_1_0');expect(t.root.AttackTreeJSON.legacyCenter).toEqual({x:100,y:-200,zoom:.5});
    expect(t.root.AttackTreeJSON.viewport).toEqual(defaultView().viewport);
    // React Flow resolves center using the actual canvas dimensions; only its resulting viewport is persisted subsequently.
    t.root.AttackTreeJSON.viewport={x:350,y:400,zoom:.5};delete t.root.AttackTreeJSON.legacyCenter;
    const reload=structuredClone(r);Object.assign(reload.loss,lastProperties(toCoreCommit(t,t,r,soi(r))));
    const restored=fromCore(reload,'SYS_1_0');expect(restored.root.AttackTreeJSON.viewport).toEqual({x:350,y:400,zoom:.5});expect(restored.root.AttackTreeJSON.legacyCenter).toBeUndefined();
  });
  it.each(['bad', {not:'a coordinate'}])('rejects a nonfinite legacy camera center: %j',(centerX)=>{
    const r=fixture();r.loss.AttackTreeJSON=JSON.stringify({layout:{viewport:{centerX,centerY:0,zoom:.5}}});
    expect(()=>fromCore(r,'SYS_1_0')).toThrow(/legacy camera center is malformed/);
  });

});
