import {expect,it} from 'vitest';
import {calculateTheme,periodStart,type Theme} from '@/lib/domain/themes';
import type {PriceHistory} from '@/lib/domain/market';
const theme:Theme={id:'test',name:'test',description:'',codes:['a','b'],version:1};
function h(code:string,end:number):PriceHistory{return {instrument:{id:code,code,name:code,market:'KOSPI',currency:'KRW',kind:'stock'},bars:[['2026-01-01',100],['2026-04-01',end]].map(([date,price])=>({date:String(date),open:Number(price),high:Number(price),low:Number(price),close:Number(price),volume:1})),provenance:{asOf:'2026-04-01',fetchedAt:'',source:'test',sourceUrl:'',isMock:true}};}
it('equal weights and index',()=>{const r=calculateTheme(theme,[h('a',110),h('b',95)],'3m','equal');expect(r.returnPct).toBeCloseTo(2.5);expect(r.index[0].value).toBe(100);expect(r.index.at(-1)!.value).toBeCloseTo(102.5);});
it('start-cap weights and contribution sum',()=>{const r=calculateTheme(theme,[h('a',110),h('b',95)],'3m','cap',{a:{'2026-01-01':80},b:{'2026-01-01':20}});expect(r.returnPct).toBeCloseTo(7);expect(r.members.reduce((s,m)=>s+m.contribution,0)).toBeCloseTo(7);});
it('rejects missing caps',()=>{expect(calculateTheme(theme,[h('a',110),h('b',95)],'3m','cap').returnPct).toBeNull();});
it('never drops missing members',()=>{expect(calculateTheme(theme,[h('a',110)],'3m','equal').returnPct).toBeNull();});
it('clamps months',()=>{expect(periodStart('2026-05-31','3m')).toBe('2026-02-28');expect(periodStart('2026-04-01','1w')).toBe('2026-03-25');});
it('rejects zero initial prices',()=>{const a=h('a',110);a.bars[0].close=0;expect(calculateTheme(theme,[a,h('b',95)],'3m','equal').returnPct).toBeNull();});
