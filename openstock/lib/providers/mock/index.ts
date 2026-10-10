import type { Instrument, PriceHistory, PriceProvider } from '@/lib/domain/market';
export const instruments: Instrument[] = [
  { id: 'KR:005930', code: '005930', name: '삼성전자', market: 'KOSPI', currency: 'KRW', kind: 'stock' },
  { id: 'KR:000660', code: '000660', name: 'SK하이닉스', market: 'KOSPI', currency: 'KRW', kind: 'stock' },
  { id: 'KR:069500', code: '069500', name: 'KODEX 200', market: 'KOSPI', currency: 'KRW', kind: 'etf' },
  { id: 'US:SPY', code: 'SPY', name: 'SPDR S&P 500 ETF', market: 'US', currency: 'USD', kind: 'etf' },
  ...[['012450','한화에어로스페이스'],['079550','LIG넥스원'],['034020','두산에너빌리티'],['052690','한전기술'],['277810','레인보우로보틱스'],['454910','두산로보틱스']].map(([code,name])=>({id:`KR:${code}`,code,name,market:(code==='277810'?'KOSDAQ':'KOSPI') as 'KOSPI'|'KOSDAQ',currency:'KRW' as const,kind:'stock' as const})),
];
export const mockProvider: PriceProvider = {
  async history(instrument) {
    const seed=[...instrument.code].reduce((s,c)=>s+c.charCodeAt(0),0);
    let close = instrument.currency === 'USD' ? 520 : instrument.kind === 'etf' ? 35000 : 30000+seed*120;
    const bars: PriceHistory['bars'] = [];
    for (let day = 0; day < 420; day++) {
      const date = new Date(Date.UTC(2025, 7, 15 + day));
      if ([0, 6].includes(date.getUTCDay())) continue;
      const open = close; close = open * (1 + (seed%11-4)*0.0006 + Math.sin(day * 1.7 + seed) * 0.012);
      bars.push({ date: date.toISOString().slice(0, 10), open: +open.toFixed(2), high: +(Math.max(open, close) * 1.008).toFixed(2), low: +(Math.min(open, close) * 0.992).toFixed(2), close: +close.toFixed(2), volume: Math.round(1500000 + Math.sin(day) * 600000) });
    }
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: '2026-10-09T10:00:00Z', source: '합성 목업 · 실제 시세 아님', sourceUrl: '', isMock: true } };
  },
};
