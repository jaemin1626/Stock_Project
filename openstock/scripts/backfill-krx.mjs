import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import {readJson,atomicJson,saveRows} from './stock-store.mjs';
dotenv.config({path:'.env.local',quiet:true});
const [start='20100104',finish=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}).replaceAll('-',''),limitArg='100']=process.argv.slice(2);
const limit=Number(limitArg);const parse=s=>new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00Z`);
if(!/^\d{8}$/.test(start)||!/^\d{8}$/.test(finish)||!Number.isInteger(limit)||limit<1||limit>9000||!Number.isFinite(+parse(start))||parse(start)>parse(finish))throw new Error('시작일 종료일 YYYYMMDD, 최대 요청수 1~9000 필요');
if(!process.env.KRX_API_KEY)throw new Error('KRX_API_KEY 필요');
const root='stocks';await fs.mkdir(root,{recursive:true});
const lock=await fs.open(`${root}/collection.lock`,'wx');
try{
 const status=await readJson(`${root}/collection-status.json`,{schemaVersion:1,completed:{},failures:{}});let requests=0;
 for(let day=parse(start);day<=parse(finish)&&requests<limit;day.setUTCDate(day.getUTCDate()+1)){
  if([0,6].includes(day.getUTCDay()))continue;
  const date=day.toISOString().slice(0,10).replaceAll('-','');
  for(const api of ['stk_bydd_trd','ksq_bydd_trd']){
   const key=`${date}:${api}`;if(status.completed[key]||requests>=limit)continue;
   requests++;await new Promise(r=>setTimeout(r,1100));
   try{
    const res=await fetch(`https://data-dbg.krx.co.kr/svc/apis/sto/${api}?basDd=${date}`,{headers:{AUTH_KEY:process.env.KRX_API_KEY},signal:AbortSignal.timeout(20000)});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();const rows=data.OutBlock_1;if(!Array.isArray(rows)||rows.some(r=>r.BAS_DD!==date))throw new Error('응답 형식 오류');
    if(!rows.length){status.failures[key]='빈 응답: 휴장 또는 미공개, 재실행 시 재조회';}
    else{await saveRows(root,rows);status.completed[key]={records:rows.length};delete status.failures[key];}
    console.log(JSON.stringify({date,api,records:rows.length}));
   }catch{status.failures[key]='조회 또는 저장 실패';console.log(JSON.stringify({date,api,error:status.failures[key]}));}
   status.updatedAt=new Date().toISOString();await atomicJson(`${root}/collection-status.json`,status);
  }
 }
 console.log(JSON.stringify({requests,completed:Object.keys(status.completed).length,failed:Object.keys(status.failures).length}));
}finally{await lock.close();await fs.unlink(`${root}/collection.lock`);}
