import 'server-only';
import themes from '@/config/themes.json';
import {analysisHistory} from './analysis';
import {mockEnabled} from '@/lib/server/analysis-env';
import type {PriceHistory} from '@/lib/domain/market';
import {readFile} from 'node:fs/promises';
export async function themeDataset(useKisSnapshot=false){
 if(useKisSnapshot){try{const histories=JSON.parse(await readFile('data/local/theme-prices.json','utf8')) as PriceHistory[];return {themes,histories,caps:{},failures:[],isMock:false};}catch{return {themes,histories:[],caps:{},failures:themes.flatMap(t=>t.codes),isMock:false};}}
 const histories:PriceHistory[]=[];const failures:string[]=[];
 for(const code of [...new Set(themes.flatMap(t=>t.codes))]){try{histories.push(await analysisHistory(code));}catch{failures.push(code);}}
 const caps:Record<string,Record<string,number>>={};
 if(mockEnabled())for(const h of histories)caps[h.instrument.code]=Object.fromEntries(h.bars.map(b=>[b.date,b.close*(100000000+Number(h.instrument.code)*1000)]));
 return {themes,histories,caps,failures,isMock:mockEnabled()};
}
