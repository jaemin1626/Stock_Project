import 'server-only';
import {stockIndex} from './stock-files';
import {instruments} from '@/lib/providers/mock';
import type {Instrument,PriceHistory} from '@/lib/domain/market';
type Row={FLUC_RT?:string;ISU_CD:string;ISU_NM:string;MKT_NM:string;BAS_DD:string;TDD_OPNPRC:string;TDD_HGPRC:string;TDD_LWPRC:string;TDD_CLSPRC:string;ACC_TRDVOL:string};
export async function companyCatalog(){
 const entries=await stockIndex();
 if(!entries.length)return {asOf:'',source:'기본 등록 목록',companies:instruments.filter(i=>i.kind==='stock'&&i.market!=='US'),rows:[] as Row[]};
 const asOf=entries.map(e=>e.asOf).sort().at(-1)!;
 return {asOf:asOf.replaceAll('-',''),source:'KRX 종목별 저장 데이터',companies:entries.map(e=>({id:`KR:${e.code}`,code:e.code,name:e.name,market:e.market,currency:'KRW',kind:'stock'} as Instrument)),rows:entries.filter(e=>e.asOf===asOf).map(e=>e.latest as Row)};
}
export function krxHistory(company:Instrument,row:Row):PriceHistory {
 const n=(v:string)=>Number(v.replaceAll(',',''));
 const date=`${row.BAS_DD.slice(0,4)}-${row.BAS_DD.slice(4,6)}-${row.BAS_DD.slice(6,8)}`;
 return {instrument:company,bars:[{date,open:n(row.TDD_OPNPRC),high:n(row.TDD_HGPRC),low:n(row.TDD_LWPRC),close:n(row.TDD_CLSPRC),volume:n(row.ACC_TRDVOL)}],provenance:{asOf:date,fetchedAt:'',source:'KRX · 일별매매정보 (하루치)',sourceUrl:'https://openapi.krx.co.kr/',isMock:false}};
}


