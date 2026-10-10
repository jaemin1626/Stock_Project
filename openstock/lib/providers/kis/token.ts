import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { required } from '@/lib/server/analysis-env';
import { keyScope, locked, pause, redis } from '@/lib/server/shared-store';
export const kisHost = () => {
  if (process.env.KIS_ENV === 'demo') return 'https://openapivts.koreainvestment.com:29443';
  if (process.env.KIS_ENV && process.env.KIS_ENV !== 'real') throw new Error('KIS_ENV는 real 또는 demo');
  return 'https://openapi.koreainvestment.com:9443';
};
function encryptionKey() {
  const key = Buffer.from(required('TOKEN_ENCRYPTION_KEY'), 'hex');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY는 64자리 hex');
  return key;
}
function seal(value: string) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}
function unseal(value: string) {
  const data = Buffer.from(value, 'base64'); const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString('utf8');
}
export async function kisToken(): Promise<string> {
  const scope = `kis:${process.env.KIS_ENV ?? 'real'}:${keyScope()}`;
  const read = async () => {
    const raw = await redis().get(`${scope}:token`);
    if (!raw) return null;
    const stored = JSON.parse(raw) as { encrypted: string; expiresAt: number };
    return stored.expiresAt > Date.now() + 300000 ? unseal(stored.encrypted) : null;
  };
  const existing = await read(); if (existing) return existing;
  return locked(`${scope}:token-lock`, async () => {
    const second = await read(); if (second) return second;
    const interval = Math.max(60000, Number(process.env.KIS_TOKEN_MIN_INTERVAL_SECONDS ?? '60') * 1000);
    if (!Number.isFinite(interval)) throw new Error('토큰 발급 간격 설정 오류');
    const last = Number(await redis().get(`${scope}:issued`) ?? 0);
    const wait = Math.max(0, last + interval - Date.now());
    if (wait > 15000) throw new Error('토큰 발급 대기 중입니다. 잠시 후 다시 시도하세요.');
    await pause(wait);
    await redis().set(`${scope}:issued`, String(Date.now()), 'EX', 86400);
    const response = await fetch(`${kisHost()}/oauth2/tokenP`, { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', appkey: required('KIS_APP_KEY'), appsecret: required('KIS_APP_SECRET') }) });
    if (!response.ok) throw new Error(`KIS 토큰 요청 실패 (${response.status})`);
    const data = await response.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token || !data.expires_in || data.expires_in <= 300) throw new Error('KIS 토큰 응답 형식 오류');
    await redis().set(`${scope}:token`, JSON.stringify({ encrypted: seal(data.access_token), expiresAt: Date.now() + data.expires_in * 1000 }), 'EX', data.expires_in);
    return data.access_token;
  });
}
