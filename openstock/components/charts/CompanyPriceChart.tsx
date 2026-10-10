'use client';
import {useMemo,useState} from 'react';
import type {PriceHistory} from '@/lib/domain/market';
import {aggregateBars,type CandlePeriod} from '@/lib/domain/aggregate-bars';
import AnalysisChart from './AnalysisChart';
export default function CompanyPriceChart({history}:{history:PriceHistory}){
 const [period,setPeriod]=useState<CandlePeriod>('day');
 const aggregated=useMemo(()=>({...history,bars:aggregateBars(history.bars,period)}),[history,period]);
 return <><div className="theme-toolbar"><div className="period-switch" aria-label="봉 주기">{([['day','일봉'],['week','주봉'],['month','월봉'],['year','년봉']] as const).map(([value,label])=><button key={value} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{label}</button>)}</div><span className="ui-muted">{aggregated.bars.length}개 봉</span></div><AnalysisChart histories={[aggregated]} mode="candles"/><p className="ui-note">주봉은 월요일 시작, 월봉·년봉은 달력 기준입니다. 봉 날짜는 구간의 첫 거래일이며 마지막 봉과 수집 경계의 봉은 일부 기간만 포함할 수 있습니다. 거래량은 구간 합계입니다.</p></>;
}
