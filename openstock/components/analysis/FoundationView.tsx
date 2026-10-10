'use client';
import { useState } from 'react';
import AnalysisChart from '@/components/charts/AnalysisChart';
import type { PriceHistory } from '@/lib/domain/market';
export default function FoundationView({ history, title, next }: { history: PriceHistory; title: string; next: string }) {
  const [mode, setMode] = useState<'candles' | 'line' | 'normalized'>('candles');
  const [query, setQuery] = useState(''); const [ascending, setAscending] = useState(false);
  const rows = history.bars.filter(b => b.date.includes(query)).sort((a,b) => ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)).slice(0, 20);
  return <section className="foundation-card space-y-5">
    <div><p className="source-badge">OpenStock · 분석 기반</p><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm">현재 차트와 데이터 탐색 기반 화면입니다. {next}은 다음 구현 단계에서 추가합니다.</p></div>
    <p className="source-badge">{history.provenance.source} · 기준일 {history.provenance.asOf} · {history.instrument.currency}{history.provenance.sourceUrl && <> · <a className="underline" href={history.provenance.sourceUrl}>출처</a></>}</p>
    <div className="flex flex-wrap gap-2"><strong className="mr-auto">{history.instrument.name}</strong>{(['candles','line','normalized'] as const).map(m => <button className="ui-icon-button" aria-pressed={mode === m} key={m} onClick={() => setMode(m)}>{m === 'candles' ? '캔들·거래량' : m === 'line' ? '라인' : '기준값 100'}</button>)}</div>
    <AnalysisChart histories={[history]} mode={mode}/>
    <label className="block text-sm">날짜 필터 <input className="ml-2 ui-input" placeholder="2026-10" value={query} onChange={e => setQuery(e.target.value)}/></label>
    <div className="overflow-x-auto"><table className="ui-table"><thead><tr><th><button onClick={() => setAscending(!ascending)}>거래일 {ascending ? '↑' : '↓'}</button></th><th>종가 ({history.instrument.currency})</th><th>거래량 (주)</th></tr></thead><tbody>{rows.map(b => <tr className="border-t" key={b.date}><td className="py-2">{b.date}</td><td>{b.close.toLocaleString()}</td><td>{b.volume.toLocaleString()}</td></tr>)}</tbody></table>{!rows.length && <p className="py-4">조건에 맞는 자료가 없습니다.</p>}</div>
    <p className="text-xs">목업 시계열은 기능 확인용 합성 자료이며 실제 거래소 휴일을 반영하지 않습니다. 가격수익률은 분배금 재투자를 포함하지 않습니다.</p>
    <a className="text-xs underline" href="https://www.tradingview.com/">Charts by TradingView Lightweight Charts</a>
  </section>;
}

