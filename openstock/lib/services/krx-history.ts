import 'server-only';
import type {Instrument,PriceHistory} from '@/lib/domain/market';
import {stockIndex,stockDocument} from './stock-files';
export async function storedKrxHistory(instrument:Instrument):Promise<PriceHistory|null>{
 const entry=(await stockIndex()).find(e=>e.code===instrument.code);if(!entry)return null;
 const doc=await stockDocument(entry);const bars=doc.bars.filter(b=>b.close>0).sort((a,b)=>a.date.localeCompare(b.date));if(!bars.length)return null;
 return {instrument,bars,provenance:{asOf:bars.at(-1)!.date,fetchedAt:doc.updatedAt,source:'KRX · 원본 일봉 (수정주가 아님)',sourceUrl:'https://openapi.krx.co.kr/',isMock:false}};
}
