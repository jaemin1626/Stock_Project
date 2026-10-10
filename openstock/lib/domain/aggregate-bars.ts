import type {Bar} from './market';
export type CandlePeriod='day'|'week'|'month'|'year';
export function aggregateBars(input:Bar[],period:CandlePeriod):Bar[]{
 const sorted=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(period==='day')return sorted;
 const groups=new Map<string,Bar>();
 for(const bar of sorted){
  let key=bar.date.slice(0,period==='year'?4:7);
  if(period==='week'){
   const date=new Date(`${bar.date}T00:00:00Z`);
   date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));
   key=date.toISOString().slice(0,10);
  }
  const current=groups.get(key);
  if(current){current.high=Math.max(current.high,bar.high);current.low=Math.min(current.low,bar.low);current.close=bar.close;current.volume+=bar.volume;}
  else groups.set(key,{...bar});
 }
 return [...groups.values()];
}
