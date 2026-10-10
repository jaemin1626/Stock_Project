import 'server-only';
import type { Bar, PriceProvider } from '@/lib/domain/market';
import { kisRequest } from './client';
export const kisProvider: PriceProvider = {
  async history(instrument) {
    let end = new Date(); const rows = new Map<string, Bar>();
    for (let page = 0; page < 4; page++) {
      const start = new Date(end); start.setUTCDate(start.getUTCDate() - 150);
      const compact = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '');
      const data = await kisRequest<{ output2: Record<string, string>[] }>('daily', { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: instrument.code, FID_INPUT_DATE_1: compact(start), FID_INPUT_DATE_2: compact(end), FID_PERIOD_DIV_CODE: 'D', FID_ORG_ADJ_PRC: '0' });
      const items = data.output2.filter(r => /^\d{8}$/.test(r.stck_bsop_date ?? ''));
      if (!items.length) break;
      for (const row of items) {
        const raw = row.stck_bsop_date; const date = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
        const bar = { date, open: Number(row.stck_oprc), high: Number(row.stck_hgpr), low: Number(row.stck_lwpr), close: Number(row.stck_clpr), volume: Number(row.acml_vol) };
        if (![bar.open, bar.high, bar.low, bar.close, bar.volume].every(Number.isFinite) || bar.close <= 0) throw new Error('KIS 일봉 필드 검증 실패');
        rows.set(date, bar);
      }
      const earliest = [...rows.keys()].sort()[0]; end = new Date(`${earliest}T00:00:00Z`); end.setUTCDate(end.getUTCDate() - 1);
    }
    const bars = [...rows.values()].sort((a,b) => a.date.localeCompare(b.date));
    if (!bars.length) throw new Error('일봉 자료 없음');
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: new Date().toISOString(), source: 'KIS · 수정주가', sourceUrl: 'https://apiportal.koreainvestment.com/', isMock: false } };
  },
};
