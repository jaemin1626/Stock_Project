import 'server-only';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type {Bar} from '@/lib/domain/market';
export type StockDocument={schemaVersion:1;code:string;name:string;market:'KOSPI'|'KOSDAQ';currency:'KRW';source:string;priceBasis:'raw';updatedAt:string;bars:Bar[]};
export type StockEntry={code:string;name:string;market:'KOSPI'|'KOSDAQ';path:string;asOf:string;latest:Record<string,string>};
export async function stockIndex():Promise<StockEntry[]>{try{const data=JSON.parse(await readFile('stocks/index.json','utf8'));if(data.schemaVersion!==1)throw new Error('저장 버전 오류');return Object.values(data.entries);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}}
export async function stockDocument(entry:StockEntry):Promise<StockDocument>{const root=path.resolve('stocks');const file=path.resolve(root,entry.path);if(!file.startsWith(root+path.sep)||!file.endsWith('.json'))throw new Error('저장 경로 오류');const doc=JSON.parse(await readFile(file,'utf8')) as StockDocument;if(doc.schemaVersion!==1||doc.code!==entry.code||!Array.isArray(doc.bars))throw new Error('저장 형식 오류');return doc;}
