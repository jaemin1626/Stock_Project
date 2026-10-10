import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
const env = process.env;
if (!env.KIS_APP_KEY || !env.KIS_APP_SECRET) throw new Error('KIS 서버 키 설정이 필요합니다.');
if (!['real', 'demo'].includes(env.KIS_ENV ?? 'real')) throw new Error('KIS_ENV 설정 오류');
const base = env.KIS_ENV === 'demo' ? 'https://openapivts.koreainvestment.com:29443' : 'https://openapi.koreainvestment.com:9443';
// One-time diagnostic: token lives only in this process. No key or token is printed or saved.
async function verify() {
  const response = await fetch(`${base}/oauth2/tokenP`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET }) });
  if (!response.ok) { console.log(JSON.stringify({ step: 'token', ok: false, httpStatus: response.status })); return; }
  const token = await response.json();
  if (!token.access_token) { console.log(JSON.stringify({ step: 'token', ok: false, code: token.error_code ?? 'invalid_response' })); return; }
  console.log(JSON.stringify({ step: 'token', ok: true, expiresInSeconds: token.expires_in }));
  const tests = [
    { name: 'quote', path: 'inquire-price', tr: 'FHKST01010100', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930' } },
    { name: 'daily', path: 'inquire-daily-itemchartprice', tr: 'FHKST03010100', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930', FID_INPUT_DATE_1: '20261001', FID_INPUT_DATE_2: '20261009', FID_PERIOD_DIV_CODE: 'D', FID_ORG_ADJ_PRC: '0' } },
    { name: 'investor', path: 'inquire-investor', tr: 'FHKST01010900', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930' } },
  ];
  for (const test of tests) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = await fetch(`${base}/uapi/domestic-stock/v1/quotations/${test.path}?${new URLSearchParams(test.params)}`, { signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${token.access_token}`, appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET, tr_id: test.tr, custtype: 'P' } });
    if (!result.ok) { console.log(JSON.stringify({ step: test.name, ok: false, httpStatus: result.status })); continue; }
    const data = await result.json();
    const rows = test.name === 'daily' ? data.output2 : data.output;
    const validRows = Array.isArray(rows) ? rows.filter(row => row.stck_bsop_date) : [];
    console.log(JSON.stringify({ step: test.name, ok: data.rt_cd === '0', code: data.msg_cd, records: Array.isArray(rows) ? validRows.length : undefined, latestDate: validRows[0]?.stck_bsop_date, fields: test.name === 'investor' ? Object.keys(validRows[0] ?? {}) : undefined }));
  }
}
verify().catch(() => { console.error('KIS 연결 확인 실패: 네트워크·응답·서버 설정을 확인하세요. 비밀값은 출력하지 않았습니다.'); process.exitCode = 1; });
