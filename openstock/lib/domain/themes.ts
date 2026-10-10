import type {PriceHistory} from './market';
export type Theme={id:string;name:string;description:string;codes:string[];version:number};
export type Period='1w'|'3m'|'6m';
export type Weighting='equal'|'cap';
export function periodStart(end:string,p:Period){const d=new Date(`${end}T00:00:00Z`);if(p==='1w')d.setUTCDate(d.getUTCDate()-7);else{const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-(p==='3m'?3:6));d.setUTCDate(Math.min(day,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));}return d.toISOString().slice(0,10);}
export function calculateTheme(theme:Theme,histories:PriceHistory[],period:Period,weighting:Weighting,caps:Record<string,Record<string,number>>={},commonEnd?:string){
 const series=theme.codes.map(code=>histories.find(h=>h.instrument.code===code));
 const endDate=commonEnd??series.flatMap(h=>h?.bars.at(-1)?.date?[h.bars.at(-1)!.date]:[]).sort()[0]??'';
 const empty={theme,startDate:'',endDate,members:[] as {code:string;name:string;returnPct:number;weight:number;contribution:number}[],index:[] as {date:string;value:number}[],returnPct:null as number|null,reason:''};
 if(!endDate||!series.length||new Set(theme.codes).size!==theme.codes.length||series.some(h=>!h?.bars.length))return {...empty,reason:'구성 종목 자료 부족 또는 중복'};
 const valid=series as PriceHistory[];const target=periodStart(endDate,period);
 const startDate=valid[0].bars.filter(b=>b.date<=target).map(b=>b.date).reverse().find(date=>valid.every(h=>h.bars.some(b=>b.date===date)));
 if(!startDate||valid.some(h=>!h.bars.some(b=>b.date===endDate)))return {...empty,reason:'공통 시작·종료 거래일 자료 부족'};
 const cap=valid.map(h=>caps[h.instrument.code]?.[startDate]);
 if(weighting==='cap'&&cap.some(c=>!Number.isFinite(c)||c<=0))return {...empty,startDate,reason:'시작일 시가총액 자료 없음'};
 const sum=cap.reduce((s,c)=>s+(c??0),0);
 const members=valid.map((h,i)=>{const start=h.bars.find(b=>b.date===startDate)!.close;const end=h.bars.find(b=>b.date===endDate)!.close;const weight=weighting==='equal'?1/valid.length:cap[i]/sum;const returnPct=(end/start-1)*100;return {code:h.instrument.code,name:h.instrument.name,returnPct,weight,contribution:returnPct*weight};});
 if(members.some(m=>!Number.isFinite(m.returnPct)))return {...empty,startDate,reason:'유효하지 않은 가격'};
 const dates=valid[0].bars.filter(b=>b.date>=startDate&&b.date<=endDate).map(b=>b.date);
 if(valid.some(h=>dates.some(date=>!h.bars.some(b=>b.date===date))))return {...empty,startDate,reason:'기간 중 일봉 누락'};
 const index=dates.map(date=>({date,value:100*valid.reduce((s,h,i)=>s+members[i].weight*h.bars.find(b=>b.date===date)!.close/h.bars.find(b=>b.date===startDate)!.close,0)}));
 return {theme,startDate,endDate,members,index,returnPct:members.reduce((s,m)=>s+m.contribution,0),reason:''};
}
