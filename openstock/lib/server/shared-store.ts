import 'server-only';
import Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import { required } from './analysis-env';
let connection: Redis | undefined;
export const redis = () => connection ??= new Redis(required('REDIS_URL'), { maxRetriesPerRequest: 2, connectTimeout: 5000, lazyConnect: false });
export const keyScope = () => createHash('sha256').update(required('KIS_APP_KEY')).digest('hex').slice(0, 20);
export const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export async function locked<T>(key: string, run: () => Promise<T>): Promise<T> {
  const owner = randomUUID();
  for (let i = 0; i < 100; i++) {
    if (await redis().set(key, owner, 'PX', 30000, 'NX')) {
      try { return await run(); }
      finally { await redis().eval("if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", 1, key, owner); }
    }
    await pause(300);
  }
  throw new Error('공유 작업 잠금 대기 시간 초과');
}
export async function cached<T>(key: string, seconds: number, load: () => Promise<T>): Promise<T> {
  const hit = await redis().get(key);
  if (hit) return JSON.parse(hit) as T;
  return locked(`${key}:lock`, async () => {
    const second = await redis().get(key);
    if (second) return JSON.parse(second) as T;
    const value = await load();
    await redis().set(key, JSON.stringify(value), 'EX', seconds);
    return value;
  });
}
