import ThemesView from '@/components/analysis/ThemesView';
import {themeDataset} from '@/lib/services/themes';
export default async function Page({searchParams}:{searchParams:Promise<{source?:string}>}){const {source}=await searchParams;return <ThemesView data={await themeDataset(source==='kis')}/>;}
