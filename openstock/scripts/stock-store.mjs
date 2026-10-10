import fs from 'node:fs/promises';
import path from 'node:path';
export const safeName=name=>name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/g,'')||'종목';
export async function readJson(file,fallback){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
export async function atomicJson(file,value){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(`${file}.tmp`,JSON.stringify(value,null,2));await fs.rename(`${file}.tmp`,file);}
export async function saveRows(root,rows){
 const index=await readJson(path.join(root,'index.json'),{schemaVersion:1,entries:{}});
 for(const row of rows){
  if(!/^[0-9A-Z]{6}$/.test(row.ISU_CD)||!/^\d{8}$/.test(row.BAS_DD)||!row.ISU_NM)throw new Error('KRX 종목 형식 오류');
  const code=row.ISU_CD,key=`KR:${code}`,market=row.MKT_NM.includes('KOSDAQ')?'KOSDAQ':'KOSPI';
  const date=`${row.BAS_DD.slice(0,4)}-${row.BAS_DD.slice(4,6)}-${row.BAS_DD.slice(6,8)}`;
  const n=v=>v===undefined||v===''||v==='-'?null:Number(String(v).replaceAll(',',''));
  const bar={date,open:n(row.TDD_OPNPRC),high:n(row.TDD_HGPRC),low:n(row.TDD_LWPRC),close:n(row.TDD_CLSPRC),volume:n(row.ACC_TRDVOL),turnover:n(row.ACC_TRDVAL),marketCap:n(row.MKTCAP),listedShares:n(row.LIST_SHRS),changePct:n(row.FLUC_RT)};
  if(![bar.open,bar.high,bar.low,bar.close,bar.volume].every(v=>v!==null&&Number.isFinite(v)))throw new Error('OHLCV 형식 오류');
  const previous=index.entries[key];
  const relative=previous?.path??`KR/${market}/${safeName(row.ISU_NM)}_${code}.json`;
  const file=path.join(root,relative);
  const doc=await readJson(file,{schemaVersion:1,code,name:row.ISU_NM,market,currency:'KRW',source:'KRX',priceBasis:'raw',coverage:{requestedFrom:'2010-01-04'},bars:[]});
  const bars=new Map(doc.bars.map(b=>[b.date,b]));bars.set(date,bar);doc.bars=[...bars.values()].sort((a,b)=>a.date.localeCompare(b.date));
  const newest=!previous||date>=previous.asOf;
  if(newest){doc.name=row.ISU_NM;doc.market=market;}
  doc.updatedAt=new Date().toISOString();doc.coverage={...doc.coverage,collectedFrom:doc.bars[0]?.date,collectedThrough:doc.bars.at(-1)?.date,status:'partial'};
  // Keep all trade days in the document; chart reader filters non-trading zero prices.
  const newRelative=`KR/${doc.market}/${safeName(doc.name)}_${code}.json`;
  await atomicJson(path.join(root,newRelative),doc);
  index.entries[key]=newest?{code,name:doc.name,market:doc.market,path:newRelative,asOf:date,latest:row}:{...previous,path:newRelative};
  if(newRelative!==relative)await fs.unlink(file);
 }
 await atomicJson(path.join(root,'index.json'),index);
}
