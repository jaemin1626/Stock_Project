'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import {usePathname} from 'next/navigation';
import {ChartNoAxesCombined,Sun,Moon} from 'lucide-react';
export default function AnalysisNavigation({dark=false,onToggle}:{dark?:boolean;onToggle?:()=>void}) {
  const path=usePathname();
  useEffect(() => { if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {}); }, []);
  return <header className="analysis-topbar"><Link href="/themes?source=kis" className="analysis-brand"><span className="brand-mark"><ChartNoAxesCombined size={22}/></span>OpenStock</Link><nav className="analysis-tabs" aria-label="주식 분석">{[['/themes?source=kis','테마'],['/flows','수급'],['/etfs','ETF'],['/company','기업 분석']].map(([href,label])=><Link key={href} href={href} aria-current={path.startsWith(href.split('?')[0])?'page':undefined}>{label}</Link>)}</nav><button className="ui-icon-button" onClick={onToggle} aria-label={dark?'라이트 모드':'다크 모드'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button></header>;
}

