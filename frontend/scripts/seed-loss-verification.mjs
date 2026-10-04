// Opt-in fixture for a disposable localhost verification backend; never targets a deployment.
const base = process.argv[2] ?? 'http://127.0.0.1:18089';
if (base !== 'http://127.0.0.1:18089') throw new Error('Only the disposable verification API on 127.0.0.1:18089 is permitted.');
let token;
async function call(path,body,method=body?'POST':'GET') {
  const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json(); if(!r.ok)throw new Error(`${r.status} ${path}: ${JSON.stringify(j)}`);return j;
}
const capability=await call('/api/capability');
if(capability.environment!=='integration-verification')throw new Error('Refusing a backend not explicitly configured as integration-verification.');
const credentials={userName:'loss-verifier',password:'local-loss-verification-only',email:'loss-verifier@example.test'};
const status=await call('/api/auth/status');
if(!status.rootAdminExists)await call('/api/auth/bootstrap',credentials);
token=(await call('/api/auth/login',credentials)).token;
const soiHid='SYS_1.1.2_0';
let data=await call(`/api/soi/${soiHid}`);
const existing=data.nodes?.find(n=>n.typeName==='Loss' && n.properties.Name==='FireSat verification: authentic fire reports');
if(existing){await call('/api/commit',{toolId:'gui',soiHid,operations:['ST_1.1.2_1','ST_1.1.2_2'].map(hid=>({op:'createRelationship',type:'VALID_IN',sourceHid:hid,targetHid:'ENV_1.1.2_1'}))});const t=await call(`/api/loss/${existing.hid}/tree`);await call(`/api/loss/${existing.hid}/auto-build?rebuild=true&expectedVersion=${t.loss.AttackTreeVersion??0}`,{});console.log(JSON.stringify({soiHid,lossHid:existing.hid,reused:true}));process.exit(0);}
if(!data.nodes?.some(n=>n.hid==='EL_1.1.2_3'))throw new Error('Load the shipped FireSat package into the disposable database first.');
const make=(tempId,label,Name,extra={})=>({op:'createNode',tempId,label,properties:{Name,...extra}});
const rel=(type,sourceHid,targetHid,properties={})=>({op:'createRelationship',type,sourceHid,targetHid,properties});
const metrics=(cost)=>JSON.stringify({AttackCost:cost,TechnicalAbility:30,AttackTime:2,Noticeability:.2,PhysicalPresenceRequired:false,BreachOfTrustRequired:false,AttackerMoneyGain:4000,AttackerDestructionGain:.2,AttackerDetriment:.005,VictimFinancialLoss:200000,VictimSafetyImpact:.2,VictimMissionImpact:.8,RandomEventProbability:1,RandomEventDuration:0,RandomEventFrequency:0,BenefitASE:.9,EncounterASE:1,AttackProbability:.2});
const result=await call('/api/commit',{toolId:'gui',soiHid,operations:[
  make('asset','Asset','FireSat verification reports',{AssetType:'Organic',MissionCritical:true,Authenticity:true}),
  rel('HAS_ASSET',soiHid,'$asset'),
  make('loss','Loss','FireSat verification: authentic fire reports',{MissionCritical:true,Authenticity:true}),
  rel('HAS_LOSS','$asset','$loss'),rel('HAS_ENVIRONMENT','$loss','ENV_1.1.2_1'),
  make('goal','GsnGoal','FireSat verification reports are authentic'),rel('HAS_GOAL','$asset','$goal'),
  make('attack','Attack','Inject fabricated fire detections',{AttackLevel:'TACTIC'}),rel('EXPLOITS','$attack','EL_1.1.2_3'),
  make('cm','Countermeasure','Authenticate processor reports'),rel('BLOCKS','$cm','$attack'),
  make('counter','Attack','Steal the report signing key',{AttackLevel:'PROCEDURE',MetricsJSON:metrics(7000)}),rel('DEFEATS','$counter','$cm'),
  make('radio','Attack','Replay payload downlink',{AttackLevel:'TACTIC',MetricsJSON:metrics(3000)}),rel('EXPLOITS','$radio','INT_1.1.2_1'),
  rel('VALID_IN','ST_1.1.2_1','ENV_1.1.2_1'),rel('VALID_IN','ST_1.1.2_2','ENV_1.1.2_1'),
  rel('HOLDS','EL_1.1.2_3','$asset',{TraceStateHID:'ST_1.1.2_1'}),rel('TRANSPORTS','INT_1.1.2_1','$asset',{TraceStateHID:'ST_1.1.2_2'}),
]});
const lossHid=result.createdNodes.loss;
const current=await call(`/api/loss/${lossHid}/tree`);
await call(`/api/loss/${lossHid}/auto-build?expectedVersion=${current.loss.AttackTreeVersion??0}`,{});
const tree=await call(`/api/loss/${lossHid}/tree`);
console.log(JSON.stringify({soiHid,lossHid,nodes:tree.nodes.length,edges:tree.edges.length,createdNodes:result.createdNodes}));
