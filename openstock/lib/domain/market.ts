export type Instrument = { id: string; code: string; name: string; market: 'KOSPI' | 'KOSDAQ' | 'US'; currency: 'KRW' | 'USD'; kind: 'stock' | 'etf' };
export type Bar = { date: string; open: number; high: number; low: number; close: number; volume: number };
export type Provenance = { asOf: string; fetchedAt: string; source: string; sourceUrl: string; isMock: boolean };
export type PriceHistory = { instrument: Instrument; bars: Bar[]; provenance: Provenance };
export interface PriceProvider { history(instrument: Instrument): Promise<PriceHistory> }
