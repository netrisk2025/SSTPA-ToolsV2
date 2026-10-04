// Explicit opt-in illustrative fixture; refuse deployed or non-verification targets.
import {readFileSync} from 'node:fs';
const base='http://127.0.0.1:18089';let token;
async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});const j=await r.json();if(!r.ok)throw Error(`${r.status} ${path}: ${JSON.stringify(j)}`);return j;}
if((await call('/api/capability')).environment!=='integration-verification')throw Error('Refusing a non-verification backend.');
token=(await call('/api/auth/login',{userName:'loss-verifier',password:'local-loss-verification-only'})).token;
const soiHid='SYS_1.1.2_0', data=await call(`/api/soi/${soiHid}`),name='Illustrative FireSat report authenticity';
const existing=data.nodes.find(n=>n.typeName==='GsnGoal'&&n.properties.Name===name);
if(existing){
  const fixture=JSON.parse(readFileSync(new URL('../tests/goalkeeper/fixtures/firesat-source.json',import.meta.url),'utf8'));
  const ops=fixture.nodes.flatMap(n=>{const node=data.nodes.find(x=>x.properties.ShortDescription?.startsWith(`Illustrative prototype source ${n.gsn_id}.`));const key=`${n.gk_type.slice(3)}ID`;return node&&node.properties[key]==null?[{op:'updateNode',hid:node.hid,properties:{[key]:Number(n.gsn_id.replace(/^[A-Za-z]+/,''))}}]:[];});
  if(ops.length)await call('/api/commit',{soiHid,toolId:'sstpa.goalkeeper',operations:ops});
  console.log(JSON.stringify({soiHid,rootHid:existing.hid,reused:true,assignedDisplayIds:ops.length}));process.exit(0);
}
const asset=data.nodes.find(n=>n.typeName==='Asset'&&n.properties.Name==='FireSat verification reports');
const loss=data.nodes.find(n=>n.typeName==='Loss'&&n.properties.Name==='FireSat verification: authentic fire reports');
if(!asset||!loss)throw Error('Load structural FireSat and the isolated Loss fixture first.');
const fixture=JSON.parse(readFileSync(new URL('../tests/goalkeeper/fixtures/firesat-source.json',import.meta.url),'utf8')),operations=[];
const link=(type,sourceHid,targetHid)=>operations.push({op:'createRelationship',type,sourceHid,targetHid});
for(const n of fixture.nodes){operations.push({op:'createNode',tempId:n.gsn_id,label:n.gk_type,properties:{[`${n.gk_type.slice(3)}ID`]:Number(n.gsn_id.replace(/^[A-Za-z]+/,'')),Name:n.is_root?name:n.name,ShortDescription:`Illustrative prototype source ${n.gsn_id}. ${n.provenance??''} ${fixture.status}`, [`${n.gk_type.slice(3)}Statement`]:n.statement,...(['GsnGoal','GsnStrategy'].includes(n.gk_type)?{Undeveloped:n.undeveloped??false}:{})}});}
for(const n of fixture.nodes){for(const t of n.supported_by??[])link('SUPPORTED_BY',`$${n.gsn_id}`,`$${t.slice(2,-2)}`);for(const t of n.in_context_of??[])link('IN_CONTEXT_OF',`$${n.gsn_id}`,`$${t.slice(2,-2)}`);}
link('HAS_GOAL',asset.hid,'$G1');link('HAS_LOSS','$Sn1',loss.hid);
operations.push({op:'createNode',tempId:'verification',label:'Verification',properties:{Name:'Illustrative verification plan — pending',ShortDescription:fixture.status,Procedure:'Planned firmware, key custody, anti-replay and access-control tests. No execution record exists; this reference is a plan only.'}});
link('HAS_VERIFICATION','$Sn2','$verification');
const result=await call('/api/commit',{soiHid,toolId:'sstpa.goalkeeper',operations});console.log(JSON.stringify({soiHid,rootHid:result.createdNodes.G1,createdNodes:result.createdNodes},null,2));
