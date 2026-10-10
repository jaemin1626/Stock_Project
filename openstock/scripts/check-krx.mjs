import dotenv from 'dotenv';
dotenv.config({path:'.env.local',quiet:true});
const key=process.env.KRX_API_KEY;
if(!key){console.log('KRX_API_KEY 설정 없음');process.exit(1);}
console.log('KRX_API_KEY 설정 확인 (값 비공개)');
for(const api of ['stk_bydd_trd','ksq_bydd_trd']) {
 try {
 const res=await fetch(`https://data-dbg.krx.co.kr/svc/apis/sto/${api}?basDd=20261008`,{headers:{AUTH_KEY:key},signal:AbortSignal.timeout(15000)});
 const body=await res.text();
 let parsed;try{parsed=JSON.parse(body);}catch{}
 const rows=parsed?.OutBlock_1;
 // Do not print raw bodies: upstream errors could echo credentials.
 console.log(JSON.stringify({api,httpStatus:res.status,records:Array.isArray(rows)?rows.length:null,responseType:res.headers.get('content-type'),valid:Array.isArray(rows)&&rows.length>0}));
 } catch {console.log(JSON.stringify({api,error:'네트워크 또는 응답 시간 초과'}));}
}
