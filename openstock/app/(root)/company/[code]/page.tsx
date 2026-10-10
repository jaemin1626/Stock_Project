import {storedKrxHistory} from '@/lib/services/krx-history';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {companyCatalog,krxHistory} from '@/lib/services/company-catalog';
import {themeDataset} from '@/lib/services/themes';
import {analysisHistory} from '@/lib/services/analysis';
import CompanyPriceChart from '@/components/charts/CompanyPriceChart';
export default async function Page({params}:{params:Promise<{code:string}>}) {
 const {code}=await params; const catalog=await companyCatalog(); const company=catalog.companies.find(i=>i.code===code&&i.kind==='stock'&&i.market!=='US');
 if(!company)notFound();
 const snapshot=await themeDataset(true);
 const krxRow=catalog.rows.find(r=>r.ISU_CD===code);
 const history=await storedKrxHistory(company)??(krxRow?krxHistory(company,krxRow):await analysisHistory(code).catch(()=>null));
 const latest=history?.bars.at(-1); const previous=history?.bars.at(-2);
 const change=latest&&previous?(latest.close/previous.close-1)*100:null;
 return <section><Link href="/company" className="ui-muted">← 기업 검색</Link><div className="analysis-heading mt-5"><div><h1>{company.name}</h1><p>{company.code} · {company.market} · {company.currency}</p></div><span className={`source-badge ${history?.provenance.isMock?'mock':''}`}>{history?.provenance.source??'자료 없음'} · {history?.provenance.asOf??'—'}</span></div>{history&&latest?<><div className="summary-grid"><div className="summary-card"><div><small>최근 거래일 종가</small><strong>{latest.close.toLocaleString()}원</strong></div></div><div className="summary-card"><div><small>전 거래일 대비</small><strong className={change!==null&&change<0?'ui-negative':'ui-positive'}>{change===null?'자료 없음':`${change>=0?'+':''}${change.toFixed(2)}%`}</strong></div></div><div className="summary-card"><div><small>거래량</small><strong>{latest.volume.toLocaleString()}주</strong></div></div></div><div className="ui-panel"><div className="panel-title"><h2>주가 · 거래량</h2><span className="ui-muted">데이터 출처 기준</span></div><p className="ui-note">저장 구간: {history.bars[0].date} ~ {history.provenance.asOf} · {history.bars.length}거래일 · 전체 기간 표시</p><CompanyPriceChart history={history}/></div><p className="ui-note">위 수치는 기준일 {history.provenance.asOf}의 일봉 기준입니다. 출처: {history.provenance.source}. 실시간 현재가가 아닙니다.</p></>:<p className="ui-empty">가격 자료를 불러오지 못했습니다.</p>}<div className="ui-panel mt-5"><h2>관련 테마</h2><p className="ui-note">{snapshot.themes.filter(t=>t.codes.includes(code)).map(t=>t.name).join(' · ')||'등록된 테마 없음'} · 수동 테마 구성 기준</p></div><p className="ui-note">재무제표·공시·AI 요약은 DART 연결 후 추가할 예정입니다.</p></section>;
}



