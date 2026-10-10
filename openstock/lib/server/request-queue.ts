import 'server-only';
import { keyScope, locked, pause, redis } from './shared-store';
export async function kisQueued<T>(run: () => Promise<T>): Promise<T> {
  const rate = Number(process.env.KIS_REQUESTS_PER_SECOND ?? '2');
  if (!Number.isFinite(rate) || rate <= 0 || rate > 20) throw new Error('KIS 요청 제한 설정 오류');
  const scope = `kis:${keyScope()}`;
  return locked(`${scope}:queue`, async () => {
    const next = Number(await redis().get(`${scope}:next`) ?? 0);
    await pause(Math.max(0, next - Date.now()));
    await redis().set(`${scope}:next`, String(Date.now() + Math.ceil(1000 / rate)), 'PX', 60000);
    return run();
  });
}
