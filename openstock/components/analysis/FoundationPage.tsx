import FoundationView from './FoundationView';
import { analysisHistory } from '@/lib/services/analysis';
export default async function FoundationPage({ title, next, code = '005930' }: { title: string; next: string; code?: string }) {
  try { return <FoundationView history={await analysisHistory(code)} title={title} next={next}/>; }
  catch { return <section><h1 className="text-2xl">{title}</h1><p className="mt-4">데이터를 불러오지 못했습니다. USE_MOCK 또는 서버 API·DB·Redis 설정과 데이터 권한을 확인하세요.</p></section>; }
}
