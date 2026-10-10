import { analysisHistory } from '@/lib/services/analysis';
import { mockEnabled } from '@/lib/server/analysis-env';
import { getSession } from '@/lib/better-auth/auth';
export async function GET(request: Request) {
  if (!mockEnabled() && !(await getSession())?.user) return Response.json({ error: '인증 필요' }, { status: 401 });
  const code = new URL(request.url).searchParams.get('code') ?? '005930';
  if (!/^(\d{6}|[A-Z]{1,5})$/.test(code)) return Response.json({ error: '종목코드 형식 오류' }, { status: 400 });
  try { return Response.json(await analysisHistory(code), { headers: { 'Cache-Control': 'private, no-store' } }); }
  catch { return Response.json({ error: '데이터 설정·권한·가용성을 확인하세요.' }, { status: 503 }); }
}
