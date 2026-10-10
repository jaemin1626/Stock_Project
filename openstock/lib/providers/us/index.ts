import 'server-only';
import type { PriceProvider } from '@/lib/domain/market';
import { required } from '@/lib/server/analysis-env';
export const usProvider: PriceProvider = {
  async history(instrument) {
    const to = Math.floor(Date.now()/1000);
    const response = await fetch(`https://finnhub.io/api/v1/stock/candle?${new URLSearchParams({ symbol: instrument.code, resolution: 'D', from: String(to - 400*86400), to: String(to) })}`, { headers: { 'X-Finnhub-Token': required('FINNHUB_API_KEY') }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`미국 일봉 권한 또는 요청 오류 (${response.status})`);
    const d = await response.json() as { s: string; t: number[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[] };
    if (d.s !== 'ok' || !Array.isArray(d.t) || !d.t.length) throw new Error('미국 일봉 자료 없음');
    const bars = d.t.map((t,i) => ({ date: new Date(t*1000).toISOString().slice(0,10), open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v[i] }));
    if (bars.some(b => ![b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite))) throw new Error('미국 일봉 형식 오류');
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: new Date().toISOString(), source: 'Finnhub · 가격수익률', sourceUrl: 'https://finnhub.io/', isMock: false } };
  },
};
