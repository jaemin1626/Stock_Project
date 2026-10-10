import CompanySearch from '@/components/analysis/CompanySearch';
import {companyCatalog} from '@/lib/services/company-catalog';
export default async function Page(){const data=await companyCatalog();const movers=data.rows.flatMap(r=>{const change=r.FLUC_RT?.trim()?Number(r.FLUC_RT.replaceAll(',','')):NaN;return Number.isFinite(change)?[{code:r.ISU_CD,name:r.ISU_NM,market:r.MKT_NM.includes('KOSDAQ')?'KOSDAQ':'KOSPI',change}]:[];});return <><p className="ui-note">출처: {data.source} · 기준일 {data.asOf||'자료 없음'}</p><CompanySearch companies={data.companies} movers={movers}/></>;}
