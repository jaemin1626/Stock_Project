import dotenv from 'dotenv';
import fs from 'node:fs/promises';
dotenv.config({path:'.env.local',quiet:true});
const themes=JSON.parse(await fs.readFile('config/themes.json','utf8'));
const key=process.env.KIS_APP_KEY,secret=process.env.KIS_APP_SECRET;
const host=process.env.KIS_ENV==='demo'?'https://openapivts.koreainvestment.com:29443':'https://openapi.koreainvestment.com:9443';
const names={'005930':'삼성전자','000660':'SK하이닉스','012450':'한화에어로스페이스','079550':'LIG넥스원','034020':'두산에너빌리티','052690':'한전기술','277810':'레인보우로보틱스','454910':'두산로보틱스'};
async function collect(){
 if(!key||!secret)throw new Error('키 설정 필요');
 const tokenResponse=await fetch(`${host}/oauth2/tokenP`,{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',appkey:key,appsecret:secret})});
 if(!tokenResponse.ok)throw new Error('토큰 요청 실패');
 const token=await tokenResponse.json();if(!token.access_token)throw new Error('토큰 형식 오류');
 const histories=[];
 for(const code of [...new Set(themes.flatMap(t=>t.codes))]){
  let end=new Date();const rows=new Map();
  for(let page=0;page<3;page++){
   const start=new Date(end);start.setUTCDate(start.getUTCDate()-180);
   const compact=d=>d.toISOString().slice(0,10).replaceAll('-','');
   await new Promise(resolve=>setTimeout(resolve,1200));
   const params=new URLSearchParams({FID_COND_MRKT_DIV_CODE:'J',FID_INPUT_ISCD:code,FID_INPUT_DATE_1:compact(start),FID_INPUT_DATE_2:compact(end),FID_PERIOD_DIV_CODE:'D',FID_ORG_ADJ_PRC:'0'});
   let data;
   for(let attempt=0;attempt<3;attempt++){
    const res=await fetch(`${host}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${params}`,{signal:AbortSignal.timeout(10000),headers:{authorization:`Bearer ${token.access_token}`,appkey:key,appsecret:secret,tr_id:'FHKST03010100',custtype:'P'}});
    if(res.ok){data=await res.json();if(data.rt_cd==='0')break;console.log(JSON.stringify({code,step:'daily',errorCode:data.msg_cd}));}else console.log(JSON.stringify({code,httpStatus:res.status}));
    await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));
   }
   if(!data||data.rt_cd!=='0')throw new Error('일봉 응답 오류');
   const valid=(data.output2??[]).filter(r=>/^\d{8}$/.test(r.stck_bsop_date??''));if(!valid.length)break;
   for(const r of valid){const raw=r.stck_bsop_date;const date=`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;const b={date,open:Number(r.stck_oprc),high:Number(r.stck_hgpr),low:Number(r.stck_lwpr),close:Number(r.stck_clpr),volume:Number(r.acml_vol)};if(![b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite)||b.close<=0)throw new Error('가격 검증 실패');rows.set(date,b);}
   end=new Date(`${[...rows.keys()].sort()[0]}T00:00:00Z`);end.setUTCDate(end.getUTCDate()-1);
  }
  const bars=[...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));if(!bars.length)throw new Error('일봉 없음');
  histories.push({instrument:{id:`KR:${code}`,code,name:names[code]??code,market:code==='277810'?'KOSDAQ':'KOSPI',currency:'KRW',kind:'stock'},bars,provenance:{asOf:bars.at(-1).date,fetchedAt:new Date().toISOString(),source:'KIS · 수정주가',sourceUrl:'https://apiportal.koreainvestment.com/',isMock:false}});
  console.log(JSON.stringify({code,records:bars.length,asOf:bars.at(-1).date}));
 }
 await fs.mkdir('data/local',{recursive:true});await fs.writeFile('data/local/theme-prices.json.tmp',JSON.stringify(histories));await fs.rename('data/local/theme-prices.json.tmp','data/local/theme-prices.json');
 console.log('KIS 테마 가격 스냅샷 저장 완료. 키·토큰은 저장하지 않았습니다.');
}
collect().catch(()=>{console.error('수집 실패: KIS 설정·네트워크·데이터 권한을 확인하세요. 기존 스냅샷은 유지됩니다.');process.exitCode=1;});
