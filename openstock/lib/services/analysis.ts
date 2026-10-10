import 'server-only';
import { MongoClient } from 'mongodb';
import { instruments, mockProvider } from '@/lib/providers/mock';
import { kisProvider } from '@/lib/providers/kis';
import { usProvider } from '@/lib/providers/us';
import { mockEnabled, required } from '@/lib/server/analysis-env';
import { cached } from '@/lib/server/shared-store';
import type { PriceHistory } from '@/lib/domain/market';
let mongo: Promise<MongoClient> | undefined;
export async function analysisHistory(code: string): Promise<PriceHistory> {
  const instrument = instruments.find(i => i.code === code);
  if (!instrument) throw new Error('현재 기반 단계의 지원 종목이 아닙니다.');
  if (mockEnabled()) return mockProvider.history(instrument);
  return cached(`analysis:history:${instrument.id}`, 600, async () => {
    mongo ??= new MongoClient(required('MONGODB_URI')).connect();
    const collection = (await mongo).db().collection<{ _id: string; value: PriceHistory; updatedAt: Date }>('analysis_price_snapshots');
    const hit = await collection.findOne({ _id: instrument.id });
    if (hit && Date.now() - hit.updatedAt.getTime() < 3600000) return hit.value;
    const value = await (instrument.market === 'US' ? usProvider : kisProvider).history(instrument);
    await collection.updateOne({ _id: instrument.id }, { $set: { value, updatedAt: new Date() } }, { upsert: true });
    return value;
  });
}
