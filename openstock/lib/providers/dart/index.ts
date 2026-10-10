import 'server-only';
import { required } from '@/lib/server/analysis-env';
export async function dartDisclosures(corpCode: string, begin: string, end: string, page = 1) {
  if (!/^\d{8}$/.test(corpCode) || !/^\d{8}$/.test(begin) || !/^\d{8}$/.test(end)) throw new Error('DART 입력 형식 오류');
  const url = new URL('https://opendart.fss.or.kr/api/list.json');
  url.search = new URLSearchParams({ crtfc_key: required('DART_API_KEY'), corp_code: corpCode, bgn_de: begin, end_de: end, page_no: String(page), page_count: '100' }).toString();
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`DART 요청 실패 (${response.status})`);
  const data = await response.json() as { status: string; total_page?: number; list?: { rcept_no: string; report_nm: string; rcept_dt: string }[] };
  if (data.status === '013') return { total_page: 0, list: [] };
  if (data.status !== '000') throw new Error(`DART 오류 (${data.status})`);
  return data;
}
