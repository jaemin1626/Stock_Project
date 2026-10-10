'use client';
import {useEffect,useState} from 'react';
import AnalysisNavigation from './AnalysisNavigation';
import './analysis.css';
export default function AnalysisFrame({children}:{children:React.ReactNode}){
 const [dark,setDark]=useState(false);
 useEffect(()=>{document.documentElement.classList.toggle('analysis-light',!dark);return()=>document.documentElement.classList.remove('analysis-light');},[dark]);
 return <div className={`analysis-shell ${dark?'is-dark':''}`}><div className="analysis-container"><AnalysisNavigation dark={dark} onToggle={()=>setDark(!dark)}/>{children}<footer className="analysis-footer"><span>본 서비스는 정보 제공 목적이며 투자 권유가 아닙니다</span><span>OpenStock · Research workspace</span></footer></div></div>;
}
