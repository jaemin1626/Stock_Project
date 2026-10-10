import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.mock('server-only', () => ({}));
const memory = new Map<string,string>();
const fakeRedis = { get: vi.fn(async (key: string) => memory.get(key) ?? null), set: vi.fn(async (key: string, value: string) => { memory.set(key,value); return 'OK'; }) };
vi.mock('@/lib/server/shared-store', () => ({ redis: () => fakeRedis, keyScope: () => 'test', pause: async () => {}, locked: async (_key: string, run: () => Promise<unknown>) => run() }));
import { kisToken } from '@/lib/providers/kis/token';
import { instruments, mockProvider } from '@/lib/providers/mock';
describe('foundation', () => {
  beforeEach(() => { memory.clear(); vi.stubEnv('KIS_APP_KEY','test'); vi.stubEnv('KIS_APP_SECRET','test'); vi.stubEnv('TOKEN_ENCRYPTION_KEY','ab'.repeat(32)); });
  it('stores encrypted tokens and reuses a valid token', async () => {
    const fetcher = vi.fn(async () => Response.json({ access_token:'secret-test-token', expires_in:86400 }));
    vi.stubGlobal('fetch',fetcher);
    expect(await kisToken()).toBe('secret-test-token');
    expect([...memory.values()].join('')).not.toContain('secret-test-token');
    expect(await kisToken()).toBe('secret-test-token');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects incomplete token responses', async () => {
    vi.stubGlobal('fetch',vi.fn(async () => Response.json({ access_token:'token' })));
    await expect(kisToken()).rejects.toThrow('형식');
  });
  it('has deterministic ascending OHLC bars in mock mode', async () => {
    const first = await mockProvider.history(instruments[0]);
    expect(first).toEqual(await mockProvider.history(instruments[0]));
    expect(first.bars.length).toBeGreaterThan(250);
    expect(first.bars.every((b,i,all) => b.low <= Math.min(b.open,b.close) && b.high >= Math.max(b.open,b.close) && (i === 0 || b.date > all[i-1].date))).toBe(true);
  });
});
