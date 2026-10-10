import 'server-only';
import { required } from '@/lib/server/analysis-env';
import { kisQueued } from '@/lib/server/request-queue';
import { pause } from '@/lib/server/shared-store';
import { kisHost, kisToken } from './token';
export const endpoints = {
  quote: ['/uapi/domestic-stock/v1/quotations/inquire-price', 'FHKST01010100'],
  daily: ['/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', 'FHKST03010100'],
  investor: ['/uapi/domestic-stock/v1/quotations/inquire-investor', 'FHKST01010900'],
  etf: ['/uapi/etfetn/v1/quotations/inquire-price', 'FHPST02400000'],
  holdings: ['/uapi/etfetn/v1/quotations/inquire-component-stock-price', 'FHKST121600C0'],
} as const;
export async function kisRequest<T>(endpoint: keyof typeof endpoints, params: Record<string, string>): Promise<T> {
  const [path, trId] = endpoints[endpoint];
  const token = await kisToken();
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await kisQueued(() => fetch(`${kisHost()}${path}?${new URLSearchParams(params)}`, { cache: 'no-store', signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${token}`, appkey: required('KIS_APP_KEY'), appsecret: required('KIS_APP_SECRET'), tr_id: trId, custtype: 'P' } }));
    if ((response.status === 429 || response.status >= 500) && attempt < 2) { await pause(500 * 2 ** attempt + Math.random() * 200); continue; }
    if (!response.ok) throw new Error(`KIS 요청 실패 (${response.status})`);
    const data = await response.json() as T & { rt_cd: string };
    if (data.rt_cd !== '0') throw new Error('KIS 요청이 거절되었습니다. API 권한·파라미터를 확인하세요.');
    return data;
  }
  throw new Error('KIS 재시도 초과');
}
