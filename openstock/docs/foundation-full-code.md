# 2단계 생성·수정 파일 전체

원본 upstream: 38da6d45e714b36b1cf56e945c290b70684eb03b

package-lock.json 전체는 ../package-lock.json 파일에 포함됩니다.

## .env.example

```
USE_MOCK=true
MONGODB_URI=
REDIS_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
KIS_ENV=real
KIS_APP_KEY=
KIS_APP_SECRET=
KIS_REQUESTS_PER_SECOND=2
KIS_TOKEN_MIN_INTERVAL_SECONDS=60
# 32-byte encryption key, represented by 64 hexadecimal characters
TOKEN_ENCRYPTION_KEY=
DART_API_KEY=
FINNHUB_API_KEY=
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

KRX_API_KEY=

```

## .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

data/local/

```

## app/(root)/company/[code]/page.tsx

```
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




```

## app/(root)/company/page.tsx

```
import CompanySearch from '@/components/analysis/CompanySearch';
import {companyCatalog} from '@/lib/services/company-catalog';
export default async function Page(){const data=await companyCatalog();const movers=data.rows.flatMap(r=>{const change=r.FLUC_RT?.trim()?Number(r.FLUC_RT.replaceAll(',','')):NaN;return Number.isFinite(change)?[{code:r.ISU_CD,name:r.ISU_NM,market:r.MKT_NM.includes('KOSDAQ')?'KOSDAQ':'KOSPI',change}]:[];});return <><p className="ui-note">출처: {data.source} · 기준일 {data.asOf||'자료 없음'}</p><CompanySearch companies={data.companies} movers={movers}/></>;}

```

## app/(root)/etfs/page.tsx

```
import FoundationPage from '@/components/analysis/FoundationPage';
export default function Page() { return <FoundationPage title="국내·미국 ETF 비교" next="ETF 메타데이터·5종목 비교·환율 변환" code="069500"/>; }

```

## app/(root)/flows/page.tsx

```
import FoundationPage from '@/components/analysis/FoundationPage';
export default function Page() { return <FoundationPage title="외국인·기관 수급 분석" next="5·20·60거래일 랭킹·기관 연속 순매수"/>; }

```

## app/(root)/layout.tsx

```
import { getSession } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import DonatePopup from "@/components/DonatePopup";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
export const dynamic = 'force-dynamic';


import AnalysisFrame from '@/components/analysis/AnalysisFrame';
import { mockEnabled } from '@/lib/server/analysis-env';
const Layout = async ({ children }: { children: React.ReactNode }) => {
    if (mockEnabled()) return <AnalysisFrame>{children}</AnalysisFrame>;
    const session = await getSession();

    if (!session?.user) redirect('/sign-in');

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    }

    const [initialStocks, watchlist] = await Promise.all([
        searchStocks(),
        getUserWatchlist(),
    ]);

    return (
        <>
            <AppShell
                user={user}
                watchlist={watchlist.map(({ symbol, company }: { symbol: string; company: string }) => ({ symbol, company }))}
                initialStocks={initialStocks}
            >
                <AnalysisFrame>{children}</AnalysisFrame>
            </AppShell>
            <DonatePopup />
        </>
    )
}
export default Layout


```

## app/(root)/loading.tsx

```
export default function Loading() { return <p role="status" className="p-6">데이터를 불러오는 중입니다…</p>; }

```

## app/(root)/profile/page.tsx

```
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, KeyRound, ShieldCheck, Star } from "lucide-react";
import Panel from "@/components/Panel";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import { getAuth, getSession } from "@/lib/better-auth/auth";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
import { getUserAlerts } from "@/lib/actions/alert.actions";
import { alertsEnabled } from "@/lib/market-data";

export const metadata = { title: 'Profile | OpenStock' };

const METHOD_LABELS: Record<string, string> = {
    credential: 'Email and password',
    google: 'Google',
    github: 'GitHub',
};

export default async function ProfilePage() {
    const session = await getSession();
    if (!session?.user) redirect('/sign-in');
    const { user } = session;

    const [accounts, watchlist, alerts] = await Promise.all([
        (await getAuth()).api.listUserAccounts({ headers: await headers() }).catch(() => []),
        getUserWatchlist(),
        getUserAlerts(),
    ]);
    const linked = new Set(accounts.map((a: { providerId: string }) => a.providerId));
    const activeAlerts = alerts.filter((a: { triggered?: boolean }) => !a.triggered).length;
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const stats = [
        { label: 'Watching', value: watchlist.length, icon: Star },
        { label: alertsEnabled ? 'Active alerts' : 'Paused alerts', value: activeAlerts, icon: Bell },
        { label: 'Sign-in methods', value: linked.size, icon: ShieldCheck },
    ];

    return (
        <>
            <section className="hatch">
                <div className="card flex flex-wrap items-center gap-4 p-5">
                    <span className="grid size-14 flex-none place-items-center rounded-full bg-brand-soft text-[22px] font-bold text-brand-ink">
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-[22px] font-bold tracking-[-0.03em]">{user.name}</h1>
                        <p className="truncate text-faint">{user.email} · member since {memberSince}</p>
                    </div>
                </div>
                <div className="bento mt-[3px]">
                    {stats.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bento-tile col-span-4 gap-2.5 max-lg:col-span-12">
                            <div className="bento-head"><span className="bento-ico"><Icon /></span>{label}</div>
                            <p className="bento-value text-[26px]">{value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
                <Panel title="Details" sub="Your name and what your welcome email is tailored to">
                    <ProfileForm
                        initial={{
                            name: user.name,
                            country: user.country ?? 'US',
                            investmentGoals: user.investmentGoals ?? 'Growth',
                            riskTolerance: user.riskTolerance ?? 'Medium',
                            preferredIndustry: user.preferredIndustry ?? 'Technology',
                        }}
                    />
                </Panel>

                <div className="flex min-w-0 flex-col gap-3">
                    <Panel title="Sign-in methods" sub="Ways you can get into this account">
                        <ul className="row-list">
                            {[...linked].map((id) => (
                                <li key={id} className="flex items-center gap-3 px-3.5 py-3">
                                    <span className="bento-ico"><KeyRound /></span>
                                    <span className="flex-1 font-semibold">{METHOD_LABELS[id] ?? id}</span>
                                    <span className="pill is-up">Connected</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    {linked.has('credential') && (
                        <Panel title="Password" sub="Changing it signs out your other devices">
                            <PasswordForm />
                        </Panel>
                    )}
                </div>
            </div>
        </>
    );
}

```

## app/(root)/themes/page.tsx

```
import ThemesView from '@/components/analysis/ThemesView';
import {themeDataset} from '@/lib/services/themes';
export default async function Page({searchParams}:{searchParams:Promise<{source?:string}>}){const {source}=await searchParams;return <ThemesView data={await themeDataset(source==='kis')}/>;}

```

## app/api/analysis/history/route.ts

```
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

```

## app/api/auth/[...all]/route.ts

```
import { getAuth } from '@/lib/better-auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';
export async function GET(request: Request) { return toNextJsHandler(await getAuth()).GET(request); }
export async function POST(request: Request) { return toNextJsHandler(await getAuth()).POST(request); }

```

## app/globals.css

```
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
 * Design language: dashboard-craft (floated shell, dark chrome, browser tabs,
 * hatch shells, bento tiles) in a dark warm workspace.
 * Two hues carry everything: neutral hue 95 (warm) and accent hue 176 (OpenStock teal).
 * Up/down share one lightness (0.70) and chroma % so neither shouts louder.
 */
:root {
    --page:        oklch(0.13 0.006 95);    /* near-black behind the floated app */
    --side:        oklch(0.165 0.007 95);   /* sidebar + tab chrome */
    --frame:       oklch(0.185 0.007 95);   /* hatch shell frame (recessed) */
    --canvas:      oklch(0.205 0.007 95);   /* workspace; active tab = canvas */
    --card:        oklch(0.235 0.008 95);   /* inner card (raised) */
    --hover:       oklch(0.27 0.008 95);
    --line:        oklch(0.29 0.008 95);
    --line-strong: oklch(0.36 0.01 95);
    --text:        oklch(0.95 0.006 95);
    --muted:       oklch(0.74 0.012 95);
    --faint:       oklch(0.62 0.012 95);

    --brand:        oklch(0.80 0.13 176);   /* fills + icons */
    --brand-strong: oklch(0.72 0.12 176);
    --brand-ink:    oklch(0.85 0.12 176);   /* the only brand colour allowed as text */
    --brand-soft:   oklch(0.31 0.05 176);   /* brand as a fill behind text */
    --on-brand:     oklch(0.22 0.04 176);

    --up:        oklch(0.70 0.164 150);
    --up-soft:   oklch(0.30 0.055 150);
    --down:      oklch(0.70 0.162 25);
    --down-soft: oklch(0.30 0.055 25);
    --warn:      oklch(0.76 0.119 70);

    --tab-ease: cubic-bezier(0.32, 0.72, 0, 1);
    --ui-ease:  cubic-bezier(0.2, 0, 0, 1);

    /* shadcn tokens, repointed onto the palette above */
    --radius: 0.75rem;
    --background: var(--canvas);
    --foreground: var(--text);
    --card-foreground: var(--text);
    --popover: var(--card);
    --popover-foreground: var(--text);
    --primary: var(--brand);
    --primary-foreground: var(--on-brand);
    --secondary: var(--hover);
    --secondary-foreground: var(--text);
    --muted-foreground: var(--muted);
    --accent: var(--hover);
    --accent-foreground: var(--text);
    --destructive: var(--down);
    --border: var(--line);
    --input: var(--line-strong);
    --ring: var(--brand);
}

@theme inline {
    --font-sans: var(--font-jakarta);
    --font-mono: var(--font-plex-mono);

    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--hover);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);

    --color-page: var(--page);
    --color-side: var(--side);
    --color-frame: var(--frame);
    --color-canvas: var(--canvas);
    --color-hover: var(--hover);
    --color-line: var(--line);
    --color-line-strong: var(--line-strong);
    --color-faint: var(--faint);
    --color-brand: var(--brand);
    --color-brand-strong: var(--brand-strong);
    --color-brand-ink: var(--brand-ink);
    --color-brand-soft: var(--brand-soft);
    --color-on-brand: var(--on-brand);
    --color-up: var(--up);
    --color-up-soft: var(--up-soft);
    --color-down: var(--down);
    --color-down-soft: var(--down-soft);
    --color-warn: var(--warn);

    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
}

/* Legacy utility scales, repointed so older pages (about, help, terms, api-docs)
   pick up the warm palette without a rewrite. */
@theme {
    --color-gray-50:  oklch(0.97 0.004 95);
    --color-gray-100: oklch(0.95 0.006 95);
    --color-gray-200: oklch(0.90 0.007 95);
    --color-gray-300: oklch(0.83 0.009 95);
    --color-gray-400: oklch(0.80 0.01 95);
    --color-gray-500: oklch(0.66 0.012 95);
    --color-gray-600: oklch(0.36 0.01 95);
    --color-gray-700: oklch(0.27 0.008 95);
    --color-gray-800: oklch(0.205 0.007 95);
    --color-gray-900: oklch(0.13 0.006 95);
    --color-gray-950: oklch(0.10 0.005 95);

    --color-teal-300: oklch(0.88 0.10 176);
    --color-teal-400: oklch(0.85 0.12 176);
    --color-teal-500: oklch(0.80 0.13 176);
    --color-teal-600: oklch(0.72 0.12 176);
    --color-teal-700: oklch(0.58 0.10 176);
    --color-teal-800: oklch(0.42 0.07 176);
    --color-teal-900: oklch(0.31 0.05 176);

    --color-green-400: oklch(0.74 0.16 150);
    --color-green-500: oklch(0.70 0.164 150);
    --color-red-400: oklch(0.74 0.15 25);
    --color-red-500: oklch(0.70 0.162 25);
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }
    html {
        font-size: 14px;
    }
    body {
        background: var(--page);
        color: var(--text);
        line-height: 1.45;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    h1, h2, h3 {
        text-wrap: balance;
        letter-spacing: -0.02em;
    }
    p {
        text-wrap: pretty;
    }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* Component classes live in a layer so Tailwind utilities (lg:hidden, h-8, ...) can override them. */
@layer components {
    /* ============ Shell ============ */

    .shell {
        display: grid;
        grid-template-columns: 248px minmax(0, 1fr);
        height: 100dvh;
        overflow: hidden;
        background: var(--page);
    }
    .shell > * { min-width: 0; min-height: 0; }

    .shell-container {
        height: 100%;
        padding: 10px 10px 10px 0;
        overflow: hidden;
    }

    .app {
        display: grid;
        grid-template-columns: minmax(0, 1fr); /* implicit auto column would grow to content and overflow */
        grid-template-rows: auto minmax(0, 1fr);
        height: 100%;
        overflow: hidden;
        border-radius: 16px;
        background: var(--side);
        box-shadow: 0 0 0 1px oklch(1 0 0 / 0.04), 0 12px 40px oklch(0 0 0 / 0.45);
    }

    .workspace {
        min-width: 0;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        background: var(--canvas);
        border-radius: 12px 12px 0 0;
        transition: border-top-left-radius 180ms var(--tab-ease);
        scrollbar-width: thin;
        scrollbar-color: var(--line-strong) transparent;
    }
    .workspace.is-first-tab { border-top-left-radius: 0; }

    .workspace-inner {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        max-width: 1680px;
    }

    @media (max-width: 1023px) {
        .shell { grid-template-columns: minmax(0, 1fr); }
        .shell-container { padding: 0; }
        .app { border-radius: 0; }
        .workspace-inner { padding: 12px; }
    }

    /* ============ Sidebar ============ */

    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 14px;
        height: 100%;
        padding: 18px 12px 12px;
        overflow-y: auto;
        background: var(--page);
        color: var(--muted);
        scrollbar-width: none;
    }

    .side-label {
        padding: 0 10px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--faint);
    }

    .side-item {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 34px;
        padding: 0 10px;
        border-radius: 9px;
        font-weight: 600;
        color: var(--muted);
        transition: background-color 150ms var(--ui-ease), color 150ms var(--ui-ease), transform 150ms var(--ui-ease);
    }
    .side-item:hover { background: oklch(1 0 0 / 0.06); color: var(--text); }
    .side-item:active { transform: scale(0.97); }
    .side-item.is-active { background: oklch(1 0 0 / 0.08); color: var(--text); }
    .side-item svg { flex: none; width: 17px; height: 17px; }

    .side-cta {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 40px;
        padding: 0 12px;
        border-radius: 11px;
        font-weight: 700;
        color: var(--on-brand);
        background: var(--brand);
        box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.35), 0 6px 18px oklch(0.8 0.13 176 / 0.18);
        transition: background-color 150ms var(--ui-ease), transform 150ms var(--ui-ease);
    }
    .side-cta:hover { background: var(--brand-ink); }
    .side-cta:active { transform: scale(0.96); }

    .kbd {
        display: inline-flex;
        align-items: center;
        height: 20px;
        padding: 0 6px;
        border-radius: 6px;
        font-family: var(--font-plex-mono), ui-monospace, monospace;
        font-size: 11px;
        font-weight: 600;
    }

    /* ============ Tab bar (browser-style chrome) ============ */

    .tabbar {
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        min-width: 0;
        padding: 6px 10px 0 8px;
        background: var(--side);
        user-select: none;
    }

    .tabs {
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 2px;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
    }

    .tab {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 1 auto;
        min-width: 112px;
        max-width: 200px;
        height: 36px;
        padding: 0 10px 2px 14px;
        color: oklch(1 0 0 / 0.55);
        font-weight: 600;
        white-space: nowrap;
        transition: color 150ms var(--ui-ease);
    }
    .tab::before {
        content: "";
        position: absolute;
        inset: 4px 4px 6px;
        z-index: -1;
        border-radius: 8px;
        background: transparent;
        transition: background-color 150ms var(--ui-ease);
    }
    .tab:hover { color: oklch(1 0 0 / 0.8); }
    .tab:hover:not(.is-active)::before { background: oklch(1 0 0 / 0.07); }
    .tab.is-active { color: var(--text); }
    .tab-label { overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .tab svg { flex: none; width: 15px; height: 15px; }

    .tab-close {
        display: grid;
        place-items: center;
        flex: none;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        color: inherit;
        opacity: 0.6;
        transition: background-color 150ms var(--ui-ease), opacity 150ms var(--ui-ease);
    }
    .tab-close:hover { opacity: 1; background: oklch(1 0 0 / 0.1); }
    .tab-close svg { width: 13px; height: 13px; }

    .tab-glider {
        position: absolute;
        left: 0;
        bottom: 0;
        z-index: 0;
        height: 36px;
        opacity: 0;
        pointer-events: none;
        transition: transform 240ms var(--tab-ease), width 240ms var(--tab-ease);
    }
    .tab-glider.is-ready { opacity: 1; }
    .tab-glider-body {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 11px;
        right: 11px;
        border-radius: 12px 12px 0 0;
        background: var(--canvas);
    }
    .tab-glider-curve {
        position: absolute;
        bottom: 0;
        width: 12px;
        height: 12px;
        fill: var(--canvas);
    }
    .tab-glider-curve.is-left { left: 0; }
    .tab-glider-curve.is-right { right: 0; transform: scaleX(-1); }

    .chrome-btn {
        display: grid;
        place-items: center;
        flex: none;
        width: 30px;
        height: 30px;
        margin-bottom: 3px;
        border-radius: 8px;
        color: oklch(1 0 0 / 0.55);
        transition: background-color 150ms var(--ui-ease), color 150ms var(--ui-ease), transform 150ms var(--ui-ease);
    }
    .chrome-btn:hover { background: oklch(1 0 0 / 0.1); color: var(--text); }
    .chrome-btn:active { transform: scale(0.94); }
    .chrome-btn svg { width: 17px; height: 17px; }

    /* ============ Hatch shells ============ */

    .hatch {
        --shell-pad: 3px;
        --inner-r: 14px;
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: var(--shell-pad);
        border-radius: calc(var(--inner-r) + var(--shell-pad));
        background:
            repeating-linear-gradient(-45deg, oklch(0.4 0.01 95 / 0.22) 0 1px, transparent 1px 5px),
            var(--frame);
        box-shadow: 0 0 0 1px oklch(1 0 0 / 0.035), 0 6px 18px oklch(0 0 0 / 0.22);
    }

    .card {
        min-width: 0;
        border-radius: 14px;
        background: var(--card);
        box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.05), 0 0 0 1px oklch(0 0 0 / 0.25);
    }

    .section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px 9px;
    }
    .section-title {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text);
    }
    .section-sub {
        margin-top: 1px;
        font-size: 12.5px;
        color: var(--faint);
    }

    .page-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 4px 2px;
    }
    .page-title {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.04em;
        color: var(--text);
    }
    .page-sub {
        margin-top: 2px;
        color: var(--faint);
    }

    .kicker {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--faint);
    }

    /* ============ Bento tiles ============ */

    .bento {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 3px;
    }
    .bento-tile {
        grid-column: span 3;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
        padding: 14px 14px 12px;
        border-radius: 14px;
        background: var(--card);
        box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.05);
    }
    @media (max-width: 1023px) { .bento-tile { grid-column: span 6; } }

    .bento-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--muted);
    }
    .bento-ico {
        display: grid;
        place-items: center;
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: oklch(1 0 0 / 0.06);
        color: var(--muted);
    }
    .bento-ico svg { width: 15px; height: 15px; }
    .bento-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.04em;
        color: var(--text);
        font-variant-numeric: tabular-nums;
        text-wrap: balance;
    }
    .bento-value small {
        font-size: 0.62em;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--muted);
    }
    .bento-foot {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-size: 12.5px;
        color: var(--faint);
    }

    /* ============ Pills, buttons, numbers ============ */

    .num { font-variant-numeric: tabular-nums; }
    .mono { font-family: var(--font-plex-mono), ui-monospace, monospace; }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        flex: none;
        height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        background: oklch(1 0 0 / 0.06);
        color: var(--muted);
    }
    .pill svg { width: 12px; height: 12px; }
    .pill.is-up { background: var(--up-soft); color: var(--up); }
    .pill.is-down { background: var(--down-soft); color: var(--down); }
    .pill.is-brand { background: var(--brand-soft); color: var(--brand-ink); }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        height: 36px;
        padding: 0 14px;
        border-radius: 10px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        transition: background-color 150ms var(--ui-ease), color 150ms var(--ui-ease), transform 150ms var(--ui-ease), box-shadow 150ms var(--ui-ease);
    }
    .btn:active:not(:disabled) { transform: scale(0.96); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn svg { width: 16px; height: 16px; flex: none; }
    .btn-primary {
        color: var(--on-brand);
        background: var(--brand);
        box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.35), 0 6px 18px oklch(0.8 0.13 176 / 0.16);
    }
    .btn-primary:hover:not(:disabled) { background: var(--brand-ink); }
    .btn-ghost {
        color: var(--muted);
        box-shadow: inset 0 0 0 1px var(--line);
    }
    .btn-ghost:hover:not(:disabled) { background: var(--hover); color: var(--text); }
    .btn-ghost.is-on { color: var(--brand-ink); box-shadow: inset 0 0 0 1px oklch(0.8 0.13 176 / 0.35); background: var(--brand-soft); }

    .icon-btn {
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 9px;
        color: var(--faint);
        transition: background-color 150ms var(--ui-ease), color 150ms var(--ui-ease), transform 150ms var(--ui-ease);
    }
    .icon-btn:hover:not(:disabled) { background: var(--hover); color: var(--text); }
    .icon-btn:active:not(:disabled) { transform: scale(0.94); }
    .icon-btn:disabled { opacity: 0.5; }
    .icon-btn svg { width: 16px; height: 16px; }
    .icon-btn.is-danger:hover:not(:disabled) { color: var(--down); }
    .icon-btn.is-on { color: var(--brand-ink); }

    /* ============ Tables & rows ============ */

    .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-variant-numeric: tabular-nums;
    }
    .data-table th {
        position: sticky;
        top: 0;
        z-index: 1;
        height: 38px;
        padding: 0 14px;
        background: var(--card);
        border-bottom: 1px solid var(--line);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        text-align: left;
        color: var(--faint);
        white-space: nowrap;
    }
    .data-table td {
        height: 58px;
        padding: 0 14px;
        border-bottom: 1px solid oklch(1 0 0 / 0.04);
        white-space: nowrap;
    }
    .data-table tbody tr:nth-child(odd) td { background: oklch(1 0 0 / 0.012); }
    .data-table tbody tr { transition: background-color 150ms var(--ui-ease); }
    .data-table tbody tr:hover td { background: oklch(1 0 0 / 0.035); }
    .data-table tbody tr:last-child td { border-bottom: 0; }
    .data-table .is-num { text-align: right; }

    .row-list > * + * { border-top: 1px solid oklch(1 0 0 / 0.05); }

    .logo-well {
        display: grid;
        place-items: center;
        flex: none;
        width: 34px;
        height: 34px;
        overflow: hidden;
        border-radius: 999px;
        background: oklch(0.96 0.004 95);
        color: var(--on-brand);
        font-weight: 700;
        font-size: 13px;
    }
    .logo-well.is-empty { background: var(--hover); color: var(--muted); }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 36px 20px;
        text-align: center;
        color: var(--faint);
    }
    .empty-state .empty-icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        margin-bottom: 6px;
        border-radius: 999px;
        background: oklch(1 0 0 / 0.05);
        color: var(--muted);
    }
    .empty-state h3 { font-size: 15px; font-weight: 700; color: var(--text); }

    /* ============ TradingView embeds ============ */

    .tv-frame {
        position: relative;
        overflow: hidden;
        border-radius: 14px;
        background: var(--card);
    }
    .tradingview-widget-container,
    .tradingview-widget-container__widget,
    .tradingview-widget-container iframe {
        width: 100% !important;
        background: transparent !important;
    }
    .tradingview-widget-copyright {
        padding: 6px 0;
        font-size: 11px;
        text-align: center;
        color: var(--faint);
    }
    .tradingview-widget-copyright a { color: var(--muted); }
}

/* ============ Auth + forms (class names kept for existing forms) ============ */

@layer utilities {
    .yellow-btn {
        @apply h-12 cursor-pointer rounded-[11px] bg-brand text-on-brand font-bold text-base disabled:opacity-50 hover:bg-brand-ink active:scale-[0.97] transition-[background-color,transform] duration-150;
        box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.35), 0 6px 18px oklch(0.8 0.13 176 / 0.16);
    }
    .auth-layout {
        @apply flex flex-col justify-between lg:flex-row h-dvh bg-page relative overflow-hidden;
    }
    .auth-logo {
        @apply pt-6 lg:pt-8 mb-8 lg:mb-12;
    }
    .auth-left-section {
        @apply w-full lg:w-[45%] lg:h-dvh px-6 lg:px-16 flex flex-col overflow-y-auto;
    }
    .auth-right-section {
        @apply w-full max-lg:border-t max-lg:border-line lg:w-[55%] lg:h-[calc(100dvh-20px)] lg:m-[10px] lg:rounded-2xl bg-side px-6 py-4 md:p-6 lg:py-12 lg:px-16 flex flex-col justify-start overflow-hidden;
    }
    .auth-blockquote {
        @apply text-sm md:text-xl lg:text-2xl font-semibold tracking-tight text-foreground mb-1 md:mb-6 lg:mb-8;
    }
    .auth-testimonial-author {
        @apply text-xs md:text-base font-bold text-muted-foreground not-italic;
    }
    .auth-dashboard-preview {
        @apply left-0 hidden w-[1024px] max-w-none lg:block pointer-events-none select-none;
    }
    .form-title {
        @apply text-3xl font-bold tracking-[-0.04em] text-foreground mb-8;
    }
    .form-label {
        @apply text-[12px] font-bold uppercase tracking-[0.06em] text-faint;
    }
    .form-input {
        @apply h-12 px-3 py-3 text-foreground text-base bg-card placeholder:text-faint border-line rounded-[11px] focus:!border-brand focus-visible:ring-0;
    }
    .select-trigger {
        @apply w-full !h-12 px-3 py-3 text-base border-line bg-card text-foreground rounded-[11px] focus:!border-brand focus-visible:ring-0;
    }
    .country-select-trigger {
        @apply h-12 px-3 py-3 text-base w-full justify-between font-normal border-line bg-card text-foreground rounded-[11px] hover:bg-hover focus:!border-brand;
    }
    .country-select-input {
        @apply !bg-card text-foreground border-0 border-b border-line rounded-none focus:ring-0 placeholder:text-faint;
    }
    .country-select-empty {
        @apply text-faint py-6 text-center !bg-card;
    }
    .country-select-item {
        @apply text-foreground cursor-pointer px-3 py-2 rounded-md bg-card hover:!bg-hover;
    }
    .footer-link {
        @apply text-muted-foreground font-semibold hover:text-brand-ink transition-colors;
    }

    /* Search palette */
    .search-dialog {
        @apply !bg-card lg:min-w-[720px] border-line fixed top-10 left-1/2 -translate-x-1/2 translate-y-10 rounded-2xl overflow-hidden;
        box-shadow: 0 0 0 4px var(--frame), 0 24px 60px oklch(0 0 0 / 0.55);
    }
    .search-field {
        @apply !bg-card border-b border-line relative;
    }
    .search-input {
        @apply !bg-card border-0 text-foreground placeholder:text-faint focus:ring-0 text-base h-14 pr-10;
    }
    .search-loader {
        @apply absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-faint animate-spin;
    }
    .search-list {
        @apply !bg-card max-h-[420px] p-1.5;
    }
    .search-list-indicator {
        @apply px-5 py-8 text-center text-faint;
    }
    .search-list-empty {
        @apply py-8 !bg-transparent text-center text-faint;
    }
    .search-count {
        @apply px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-faint;
    }
    .search-item {
        @apply w-full;
    }
    .search-item-link {
        @apply px-3 h-12 w-full cursor-pointer rounded-[10px] transition-colors flex items-center gap-3 hover:bg-hover focus-visible:bg-hover outline-none;
    }
    .search-item-name {
        @apply font-semibold text-foreground truncate;
    }
}

/* Custom scrollbar that shows on hover */
.scrollbar-hide-default {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
}
.scrollbar-hide-default:hover {
    scrollbar-color: var(--line-strong) transparent;
}

/* Live price updates: a short tint toward up/down, then back */
@keyframes flash-up { from { background-color: oklch(0.70 0.164 150 / 0.28); } to { background-color: transparent; } }
@keyframes flash-down { from { background-color: oklch(0.70 0.162 25 / 0.28); } to { background-color: transparent; } }
.flash-up, .flash-down { border-radius: 6px; animation: 900ms var(--ui-ease) both; }
.flash-up { animation-name: flash-up; }
.flash-down { animation-name: flash-down; }

.live-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--up);
    box-shadow: 0 0 0 3px oklch(0.70 0.164 150 / 0.18);
}

html.analysis-light { --page: #f4f7f5; --canvas: #fff; --card: #fff; --text: #173127; --muted: #496358; --line: #ccd9d2; color-scheme: light; background: #f4f7f5; color: #173127; }

```

## app/manifest.ts

```
import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name: 'OpenStock 주식 분석', short_name: 'OpenStock', start_url: '/themes', display: 'standalone', background_color: '#182422', theme_color: '#16a085', icons: [{ src: '/analysis-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }; }

```

## components/analysis/AnalysisFrame.tsx

```
'use client';
import {useEffect,useState} from 'react';
import AnalysisNavigation from './AnalysisNavigation';
import './analysis.css';
export default function AnalysisFrame({children}:{children:React.ReactNode}){
 const [dark,setDark]=useState(false);
 useEffect(()=>{document.documentElement.classList.toggle('analysis-light',!dark);return()=>document.documentElement.classList.remove('analysis-light');},[dark]);
 return <div className={`analysis-shell ${dark?'is-dark':''}`}><div className="analysis-container"><AnalysisNavigation dark={dark} onToggle={()=>setDark(!dark)}/>{children}<footer className="analysis-footer"><span>본 서비스는 정보 제공 목적이며 투자 권유가 아닙니다</span><span>OpenStock · Research workspace</span></footer></div></div>;
}

```

## components/analysis/AnalysisNavigation.tsx

```
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


```

## components/analysis/CompanySearch.tsx

```
'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {Instrument} from '@/lib/domain/market';
type Move={code:string;name:string;market:string;change:number};
export default function CompanySearch({companies,movers=[]}:{companies:Instrument[];movers?:Move[]}) {
 const [query,setQuery]=useState('');
 const matches=companies.filter(c=>`${c.name}${c.code}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <section><div className="analysis-heading"><div><h1>기업 분석</h1><p>시장별 상승·하락 종목을 확인하거나 기업을 검색하세요.</p></div></div><div className="ui-panel"><label htmlFor="company-search">기업 검색</label><input id="company-search" className="ui-input ranking-search mt-3" placeholder="삼성전자 또는 005930" value={query} onChange={e=>setQuery(e.target.value)}/><p className="ui-muted">검색 가능한 국내 종목 {companies.length}개</p>{query.trim()?<><p className="ui-note">검색 결과 {matches.length}개 · 최대 50개 표시</p><div className="grid gap-3 mt-5 sm:grid-cols-2">{matches.slice(0,50).map(c=><Link className="theme-choice" key={c.code} href={`/company/${c.code}`}><span className="theme-choice-name"><span>{c.name}<small>{c.code} · {c.market}</small></span></span><span className="ui-positive">상세 보기 →</span></Link>)}</div>{!matches.length&&<p className="ui-empty">검색 결과가 없습니다.</p>}</>:<div className="grid gap-5 mt-6 lg:grid-cols-2">{(['KOSPI','KOSDAQ'] as const).map(market=><section className="ui-panel" key={market}><div className="panel-title"><h2>{market==='KOSPI'?'코스피':'코스닥'}</h2><span className="ui-muted">지수 등락률: 자료 없음</span></div><div className="grid gap-5 sm:grid-cols-2">{[true,false].map(up=>{const rows=movers.filter(m=>m.market===market&&(up?m.change>0:m.change<0)).sort((a,b)=>(up?-1:1)*(a.change-b.change)||a.code.localeCompare(b.code)).slice(0,5);return <div key={String(up)}><h3 className={up?'ui-positive':'ui-negative'}>{up?'상승':'하락'} TOP 5</h3>{rows.map((m,i)=><Link className="theme-choice" key={m.code} href={`/company/${m.code}`}><span className="theme-choice-name"><span className="theme-number">{i+1}</span><span>{m.name}<small>{m.code}</small></span></span><span className={up?'ui-positive':'ui-negative'}>{m.change>0?'+':''}{m.change.toFixed(2)}%</span></Link>)}{!rows.length&&<p className="ui-empty">자료 없음</p>}</div>;})}</div></section>)}</div>}</div><p className="ui-note">순위는 KRX 일별매매정보의 전 거래일 대비 등락률 기준입니다. 우선주 등 포함, 동일 등락률은 종목코드 순입니다. 시장 지수 데이터는 아직 연결되지 않았습니다.</p></section>;
}

```

## components/analysis/FoundationPage.tsx

```
import FoundationView from './FoundationView';
import { analysisHistory } from '@/lib/services/analysis';
export default async function FoundationPage({ title, next, code = '005930' }: { title: string; next: string; code?: string }) {
  try { return <FoundationView history={await analysisHistory(code)} title={title} next={next}/>; }
  catch { return <section><h1 className="text-2xl">{title}</h1><p className="mt-4">데이터를 불러오지 못했습니다. USE_MOCK 또는 서버 API·DB·Redis 설정과 데이터 권한을 확인하세요.</p></section>; }
}

```

## components/analysis/FoundationView.tsx

```
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


```

## components/analysis/ThemesView.tsx

```
'use client';
import {useState} from 'react';
import Link from 'next/link';
import {calculateTheme,type Theme,type Period,type Weighting} from '@/lib/domain/themes';
import type {PriceHistory} from '@/lib/domain/market';
import AnalysisChart from '@/components/charts/AnalysisChart';
type Data={themes:Theme[];histories:PriceHistory[];caps:Record<string,Record<string,number>>;failures:string[];isMock:boolean};
const pct=(n:number|null)=>n===null?'자료 부족':`${n>=0?'+':''}${n.toFixed(2)}%`;
export default function ThemesView({data}:{data:Data}){
 const [period,setPeriod]=useState<Period>('3m');const [weighting,setWeighting]=useState<Weighting>('equal');const [selected,setSelected]=useState(data.themes[0].id);const [query,setQuery]=useState('');const [asc,setAsc]=useState(false);const [memberQuery,setMemberQuery]=useState('');const [sort,setSort]=useState<'name'|'returnPct'|'contribution'>('contribution');
 const end=data.histories.map(h=>h.bars.at(-1)!.date).sort()[0];
 const results=data.themes.map(t=>calculateTheme(t,data.histories,period,weighting,data.caps,end));
 const ranked=results.filter(r=>r.theme.name.includes(query)).sort((a,b)=>a.returnPct===null?(b.returnPct===null?0:1):b.returnPct===null?-1:(asc?1:-1)*(a.returnPct-b.returnPct));
 const detail=results.find(r=>r.theme.id===selected)!;const members=detail.members.filter(m=>`${m.name}${m.code}`.includes(memberQuery)).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):b[sort]-a[sort]);
 const chart:PriceHistory[] = detail.index.length?[{instrument:{id:detail.theme.id,code:detail.theme.id,name:detail.theme.name,market:'KOSPI',currency:'KRW',kind:'stock'},bars:detail.index.map(p=>({date:p.date,open:p.value,high:p.value,low:p.value,close:p.value,volume:0})),provenance:{asOf:detail.endDate,fetchedAt:'',source:'코드 계산',sourceUrl:'',isMock:data.isMock}}]:[];
 const ordered=[...results].filter(r=>r.returnPct!==null).sort((a,b)=>b.returnPct!-a.returnPct!);
 const tone=(n:number|null)=>n!==null&&n<0?'ui-negative':'ui-positive';
 return <section>
 <div className="analysis-heading"><div><h1>테마별 상승률 분석</h1><p>테마 흐름을 살펴보고, 상승을 이끈 종목을 확인하세요.</p></div><nav className="source-switch"><Link aria-current={!data.isMock?'page':undefined} href="/themes?source=kis">KIS 실제 데이터</Link><Link aria-current={data.isMock?'page':undefined} href="/themes">샘플 데이터</Link></nav></div>
 <div className="theme-toolbar"><span className={`source-badge ${data.isMock?'mock':''}`}>{data.isMock?'합성 목업':'KIS 수정주가'} · {end??'자료 없음'}</span><span className="ui-muted">가격수익률 · 시작 비중 고정</span></div>
 <div className="summary-grid"><div className="summary-card"><div><small>상승률 1위</small><strong>{ordered[0]?.theme.name??'자료 부족'}</strong></div><span className={tone(ordered[0]?.returnPct??null)}>{pct(ordered[0]?.returnPct??null)}</span></div><div className="summary-card"><div><small>상승 테마</small><strong>{results.filter(r=>r.returnPct!==null&&r.returnPct>0).length} / {results.length}</strong></div><span>현재 선택 기간</span></div><div className="summary-card"><div><small>분석 종목</small><strong>{data.histories.length}개</strong></div><span>수집된 가격 기준</span></div></div>
 <div className="theme-toolbar"><div className="period-switch">{(['1w','3m','6m'] as const).map(p=><button aria-pressed={period===p} key={p} onClick={()=>setPeriod(p)}>{p==='1w'?'1주':p==='3m'?'3개월':'6개월'}</button>)}</div><select aria-label="가중 방식" className="ui-select" value={weighting} onChange={e=>setWeighting(e.target.value as Weighting)}><option value="equal">동일가중</option><option value="cap">시작 시가총액가중</option></select></div>
 <div className="theme-workspace"><aside className="ui-panel"><div className="panel-title"><h2>테마 랭킹</h2><button className="ui-muted" onClick={()=>setAsc(!asc)}>수익률 {asc?'↑':'↓'}</button></div><input aria-label="테마 검색" placeholder="테마 검색" className="ui-input ranking-search" value={query} onChange={e=>setQuery(e.target.value)}/>{ranked.map((r,i)=><button className="theme-choice" aria-pressed={selected===r.theme.id} onClick={()=>setSelected(r.theme.id)} key={r.theme.id}><span className="theme-choice-name"><span className="theme-number">{i+1}</span><span>{r.theme.name}<small>{r.theme.codes.length}개 구성 종목</small></span></span><span className={tone(r.returnPct)}>{pct(r.returnPct)}</span></button>)}{!ranked.length&&<p className="ui-empty">일치하는 테마 없음</p>}</aside>
 <div className="theme-details"><div className="ui-panel"><div className="detail-head"><div><h2>{detail.theme.name}</h2><p>{detail.theme.description}</p></div><strong className={`detail-value ${tone(detail.returnPct)}`}>{pct(detail.returnPct)}</strong></div>{detail.reason?<p className="ui-empty" role="status">{detail.reason}</p>:<><div className="chart-caption"><span>테마 지수 · 시작값 100</span><span>{detail.startDate} → {detail.endDate}</span></div><AnalysisChart histories={chart} mode="line"/></>}</div>
 {!detail.reason&&<div className="detail-bottom"><div className="ui-panel"><div className="panel-title"><h3>종목별 기여도</h3><span className="ui-muted">%p</span></div>{detail.members.map(m=><div className="contribution-row" key={m.code}><div className="contribution-label"><span>{m.name}</span><span className={tone(m.contribution)}>{m.contribution.toFixed(2)}%p</span></div><div className="contribution-track"><div className="contribution-half">{m.contribution<0&&<div style={{background:'#d35261',width:`${Math.abs(m.contribution)/Math.max(...detail.members.map(x=>Math.abs(x.contribution)),0.01)*100}%`}}/>}</div><div className="contribution-half">{m.contribution>=0&&<div style={{background:'var(--ui-accent)',width:`${m.contribution/Math.max(...detail.members.map(x=>Math.abs(x.contribution)),0.01)*100}%`}}/>}</div></div></div>)}<p className="ui-note">기여도 = 시작 가중치 × 종목 수익률</p></div>
 <div className="ui-panel"><div className="panel-title"><h3>구성 종목</h3><span className="ui-muted">{detail.members.length}개</span></div><input aria-label="종목 필터" className="ui-input ranking-search" placeholder="종목명 또는 코드 검색" value={memberQuery} onChange={e=>setMemberQuery(e.target.value)}/><div className="overflow-x-auto"><table className="ui-table"><thead><tr><th><button onClick={()=>setSort('name')}>종목 ↕</button></th><th><button onClick={()=>setSort('returnPct')}>수익률 ↓</button></th><th>비중</th><th><button onClick={()=>setSort('contribution')}>기여도 ↓</button></th></tr></thead><tbody>{members.map(m=><tr key={m.code}><td>{m.name}<small>{m.code}</small></td><td className={tone(m.returnPct)}>{pct(m.returnPct)}</td><td>{(m.weight*100).toFixed(1)}%</td><td className={tone(m.contribution)}>{m.contribution.toFixed(2)}%p</td></tr>)}</tbody></table></div>{!members.length&&<p className="ui-empty">일치하는 종목 없음</p>}</div></div>}</div></div>
 <p className="ui-note">기준일 {end??'자료 없음'} · 출처: {data.isMock?'합성 가격·시가총액. 실제 휴일 미반영.':'KIS 일봉. 과거 시총이 없으면 시총가중 계산 불가.'} 테마 구성은 수동 관리하며 분배금 재투자는 포함하지 않습니다.</p>{data.failures.length>0&&<p className="ui-note">조회 실패: {data.failures.join(', ')}</p>}</section>;
}


```

## components/analysis/analysis.css

```
.analysis-shell { --ui-bg:#f5f7f9; --ui-card:#fff; --ui-ink:#172b42; --ui-muted:#66778b; --ui-line:#e2e8ee; --ui-accent:#087f75; --ui-soft:#e8f5f1; background:var(--ui-bg); color:var(--ui-ink); min-height:100vh; padding:24px 32px; }
.analysis-shell.is-dark { --ui-bg:#101a24; --ui-card:#172430; --ui-ink:#edf3f8; --ui-muted:#a2b3c2; --ui-line:#2b3c4c; --ui-accent:#58d5bc; --ui-soft:#183c36; }
.analysis-container { max-width:1440px; margin:0 auto; }
.analysis-shell button,.analysis-shell select,.analysis-shell input { font:inherit; }
.analysis-shell button,.analysis-shell a,.analysis-shell input,.analysis-shell select { outline-offset:4px; }
.analysis-shell button { cursor:pointer; }
.analysis-topbar { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:0 0 22px; border-bottom:1px solid var(--ui-line); margin-bottom:28px; }
.analysis-brand { display:flex; align-items:center; gap:10px; font-weight:800; font-size:23px; letter-spacing:-.7px; }
.brand-mark { display:grid; place-items:center; width:36px; height:36px; background:var(--ui-accent); color:var(--ui-card); border-radius:10px; }
.analysis-tabs { display:flex; align-items:center; gap:8px; }
.analysis-tabs a { padding:10px 16px; border-radius:9px; font-size:14px; font-weight:600; color:var(--ui-muted); }
.analysis-tabs a[aria-current=page] { color:var(--ui-accent); background:var(--ui-soft); }
.ui-icon-button { border:1px solid var(--ui-line); border-radius:9px; padding:9px 11px; background:var(--ui-card); }
.analysis-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:20px; }
.analysis-heading h1 { font-size:28px; font-weight:750; letter-spacing:-.8px; margin:0 0 6px; }
.analysis-heading p,.ui-muted { color:var(--ui-muted); font-size:13px; }
.source-switch,.period-switch { display:flex; padding:4px; border:1px solid var(--ui-line); border-radius:10px; background:var(--ui-card); gap:3px; }
.source-switch a,.period-switch button { padding:8px 12px; border-radius:7px; font-size:12px; font-weight:650; white-space:nowrap; }
.source-switch a[aria-current=page],.period-switch button[aria-pressed=true] { color:var(--ui-card); background:var(--ui-accent); }
.source-badge { display:inline-flex; gap:6px; align-items:center; border-radius:6px; background:var(--ui-soft); color:var(--ui-accent); padding:5px 9px; font-size:11px; font-weight:700; }
.source-badge.mock { background:#fff0d9; color:#966016; }
.summary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:22px; }
.summary-card,.ui-panel { background:var(--ui-card); border:1px solid var(--ui-line); border-radius:14px; }
.summary-card { padding:18px 22px; display:flex; justify-content:space-between; align-items:center; }
.summary-card small { display:block; color:var(--ui-muted); font-size:12px; margin-bottom:7px; }
.summary-card strong { font-size:22px; letter-spacing:-.6px; }
.summary-card span { font-size:13px; }
.ui-positive { color:var(--ui-accent); }.ui-negative { color:#d35261; }
.theme-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px; }
.ui-select,.ui-input { background:var(--ui-card); color:var(--ui-ink); border:1px solid var(--ui-line); border-radius:9px; padding:9px 11px; min-width:0; font-size:12px!important; }
.theme-workspace { display:grid; grid-template-columns:280px minmax(0,1fr); gap:20px; align-items:start; }
.ui-panel { padding:20px; min-width:0; }
.panel-title { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; }
.panel-title h2,.panel-title h3 { font-size:16px; font-weight:700; }
.ranking-search { width:100%; margin-bottom:14px; }
.theme-choice { width:100%; display:flex; justify-content:space-between; align-items:center; gap:8px; text-align:left; padding:14px 10px; border-radius:10px; margin:4px 0; }
.theme-choice[aria-pressed=true] { background:var(--ui-soft); box-shadow:inset 3px 0 var(--ui-accent); }
.theme-choice-name { display:flex; gap:10px; align-items:center; font-size:14px; font-weight:650; }
.theme-choice-name small { font-size:11px; color:var(--ui-muted); font-weight:400; display:block; margin-top:3px; }
.theme-number { font-size:11px; color:var(--ui-muted); min-width:16px; }
.theme-details { min-width:0; display:grid; gap:20px; }
.detail-value { font-size:30px; font-weight:750; letter-spacing:-1px; }
.detail-head { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.detail-head h2 { font-size:22px; font-weight:750; }
.detail-head p { font-size:12px; color:var(--ui-muted); margin-top:4px; }
.chart-caption { display:flex; justify-content:space-between; font-size:11px; color:var(--ui-muted); margin:16px 0 4px; gap:10px; }
.detail-bottom { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.25fr); gap:20px; }
.ui-table { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; }
.ui-table th { text-align:right; padding:10px 8px; color:var(--ui-muted); font-weight:500; border-bottom:1px solid var(--ui-line); }
.ui-table td { padding:13px 8px; border-bottom:1px solid var(--ui-line); text-align:right; white-space:nowrap; }
.ui-table th:first-child,.ui-table td:first-child { text-align:left; }
.ui-table small { display:block; color:var(--ui-muted); font-size:10px; margin-top:3px; }
.contribution-row { margin:18px 0; font-size:12px; }
.contribution-label { display:flex; justify-content:space-between; margin-bottom:8px; }
.contribution-track { display:flex; height:10px; background:var(--ui-bg); border-radius:5px; overflow:hidden; }
.contribution-half { width:50%; display:flex; }.contribution-half:first-child { justify-content:flex-end; border-right:1px solid var(--ui-line); }
.ui-note { font-size:11px; line-height:1.8; color:var(--ui-muted); margin-top:18px; }
.ui-empty { padding:40px 16px; text-align:center; color:var(--ui-muted); font-size:13px; }
.analysis-footer { display:flex; justify-content:space-between; gap:12px; border-top:1px solid var(--ui-line); margin-top:32px; padding:18px 0 0; font-size:11px; color:var(--ui-muted); }
.foundation-card { padding:24px; background:var(--ui-card); border:1px solid var(--ui-line); border-radius:14px; }
@media(max-width:1100px){.detail-bottom{grid-template-columns:1fr}.theme-workspace{grid-template-columns:240px minmax(0,1fr)}}
@media(max-width:700px){.analysis-shell{padding:18px 14px}.analysis-topbar{flex-wrap:wrap;gap:14px;margin-bottom:22px}.analysis-brand{font-size:20px}.analysis-tabs{order:3;width:100%;justify-content:space-between;gap:2px}.analysis-tabs a{padding:9px 12px}.analysis-heading{align-items:flex-start;flex-direction:column}.analysis-heading h1{font-size:24px}.summary-grid{gap:8px}.summary-card{padding:13px 10px;display:block}.summary-card strong{font-size:17px}.summary-card span{display:block;font-size:11px;margin-top:5px}.theme-workspace{grid-template-columns:1fr}.theme-toolbar{align-items:stretch;flex-wrap:wrap}.ui-panel{padding:16px}.theme-choice{padding:10px}.detail-value{font-size:24px}.analysis-footer{flex-direction:column}.chart-caption{flex-wrap:wrap}}

```

## components/charts/AnalysisChart.tsx

```
'use client';
import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries, type Time } from 'lightweight-charts';
import type { PriceHistory } from '@/lib/domain/market';
export default function AnalysisChart({ histories, mode = 'candles', light = false }: { histories: PriceHistory[]; mode?: 'candles' | 'line' | 'normalized'; light?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [themeLight, setThemeLight] = useState(light);
  useEffect(() => {
    const update = () => setThemeLight(light || document.documentElement.classList.contains('analysis-light'));
    const observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); update();
    return () => observer.disconnect();
  }, [light]);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, { height: 340, autoSize: true, layout: { background: { type: ColorType.Solid, color: themeLight ? '#ffffff' : '#182422' }, textColor: themeLight ? '#1b332c' : '#d6e8df', attributionLogo: true }, grid: { vertLines: { visible: false }, horzLines: { color: themeLight ? '#edf2ef' : '#263a33' } } });
    histories.forEach((history, index) => {
      const bars = history.bars;
      if (mode === 'candles' && index === 0) {
        chart.addSeries(CandlestickSeries, { upColor: '#16a085', downColor: '#ef6464', borderVisible: false }).setData(bars.map(b => ({ time: b.date as Time, open: b.open, high: b.high, low: b.low, close: b.close })));
        const volume = chart.addSeries(HistogramSeries, { priceScaleId: 'volume', priceFormat: { type: 'volume' } });
        volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
        chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.25 } });
        volume.setData(bars.map(b => ({ time: b.date as Time, value: b.volume, color: b.close >= b.open ? '#16a08566' : '#ef646466' })));
      } else {
        chart.addSeries(LineSeries, { color: ['#16a085', '#6a8dff', '#f4b860', '#e977aa', '#a088e8'][index % 5], title: history.instrument.name }).setData(bars.map(b => ({ time: b.date as Time, value: mode === 'normalized' ? b.close / bars[0].close * 100 : b.close })));
      }
    });
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [histories, mode, themeLight]);
  return <div ref={ref} role="img" aria-label="가격·거래량 차트" className="w-full min-w-0" />;
}

```

## components/charts/CompanyPriceChart.tsx

```
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

```

## components/shell/TabBar.tsx

```
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Menu, Plus, Star, X } from "lucide-react";
import { openSearch } from "@/components/SearchCommand";
import { cn } from "@/lib/utils";

const PINNED = ['/dashboard', '/watchlist'];
const STORAGE_KEY = 'openstock-tabs';
const MAX_TABS = 12;

const PAGE_LABELS: Record<string, string> = {
    '/themes': '테마',
    '/flows': '수급',
    '/etfs': 'ETF',
    '/company/005930': '기업 분석',
    '/dashboard': 'Overview',
    '/watchlist': 'Watchlist',
    '/profile': 'Profile',
};

// Pages become browser-style tabs; stock pages are labelled by their symbol.
const tabLabel = (path: string) => {
    const stock = path.match(/^\/stocks\/([^/]+)$/);
    if (stock) return decodeURIComponent(stock[1]).toUpperCase();
    return PAGE_LABELS[path] ?? null;
};

const withTab = (tabs: string[], path: string) => {
    if (!tabLabel(path) || tabs.includes(path)) return tabs;
    const next = [...tabs, path];
    const extra = next.length - MAX_TABS;
    return extra > 0 ? next.filter((t, i) => PINNED.includes(t) || i >= extra + PINNED.length) : next;
};

const TabBar = ({ onMenu }: { onMenu: () => void }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [tabs, setTabs] = useState(() => withTab(PINNED, pathname));
    const tabRefs = useRef(new Map<string, HTMLDivElement>());
    const [glider, setGlider] = useState<{ x: number; w: number } | null>(null);

    // Restore tabs from the last visit (per-browser convenience only)
    useEffect(() => {
        try {
            const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
            if (Array.isArray(saved)) {
                setTabs((current) => saved.filter((p): p is string => typeof p === 'string').reduce(withTab, current));
            }
        } catch { /* storage unavailable */ }
    }, []);

    useEffect(() => setTabs((current) => withTab(current, pathname)), [pathname]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs)); } catch { /* storage unavailable */ }
    }, [tabs]);

    useLayoutEffect(() => {
        const el = tabRefs.current.get(pathname);
        if (!el) return setGlider(null);
        setGlider({ x: el.offsetLeft - 11, w: el.offsetWidth + 22 });
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [pathname, tabs]);

    const closeTab = (path: string) => {
        const index = tabs.indexOf(path);
        const next = tabs.filter((t) => t !== path);
        setTabs(next);
        if (path === pathname) router.push(next[Math.max(0, index - 1)] ?? '/dashboard');
    };

    return (
        <div className="tabbar">
            <button type="button" onClick={onMenu} className="chrome-btn lg:hidden" aria-label="Open menu">
                <Menu />
            </button>

            <div className="tabs pl-3 pr-3">
                <div
                    className={cn('tab-glider', glider && 'is-ready')}
                    style={glider ? { transform: `translateX(${glider.x}px)`, width: glider.w } : undefined}
                    aria-hidden
                >
                    <svg className="tab-glider-curve is-left" viewBox="0 0 12 12"><path d="M12 0v12H0c6.627 0 12-5.373 12-12z" /></svg>
                    <div className="tab-glider-body" />
                    <svg className="tab-glider-curve is-right" viewBox="0 0 12 12"><path d="M12 0v12H0c6.627 0 12-5.373 12-12z" /></svg>
                </div>

                {tabs.map((path) => {
                    const pinned = PINNED.includes(path);
                    const isStock = path.startsWith('/stocks/');
                    const active = path === pathname;
                    return (
                        <div
                            key={path}
                            ref={(el) => { if (el) tabRefs.current.set(path, el); else tabRefs.current.delete(path); }}
                            className={cn('tab', active && 'is-active', pinned && 'pr-4')}
                        >
                            {/* Stretched link: the whole tab navigates, while the close button stays a real, focusable button */}
                            <Link href={path} aria-current={active ? 'page' : undefined} className="flex min-w-0 flex-1 items-center gap-2 before:absolute before:inset-0 before:content-['']">
                                {path === '/dashboard' && <LayoutDashboard />}
                                {path === '/watchlist' && <Star />}
                                <span className={cn('tab-label', isStock && 'mono text-[13px]')}>{tabLabel(path)}</span>
                            </Link>
                            {!pinned && (
                                <button
                                    type="button"
                                    aria-label={`Close ${tabLabel(path)}`}
                                    className="tab-close relative z-10"
                                    onClick={() => closeTab(path)}
                                >
                                    <X />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <button type="button" onClick={openSearch} className="chrome-btn -ml-2" aria-label="Open a stock" title="Open a stock (⌘K)">
                <Plus />
            </button>
        </div>
    );
};

export default TabBar;

```

## config/themes.json

```
[
  { "id": "ai", "name": "AI", "codes": ["000660", "005930"], "description": "AI 반도체 인프라 예시", "version": 1 },
  { "id": "semiconductors", "name": "반도체", "codes": ["005930", "000660"], "description": "메모리 반도체 예시", "version": 1 },
  { "id": "defense", "name": "방산", "codes": ["012450", "079550"], "description": "방산 제조 예시", "version": 1 },
  { "id": "nuclear", "name": "원전", "codes": ["034020", "052690"], "description": "원전 설비 예시", "version": 1 },
  { "id": "robots", "name": "로봇", "codes": ["277810", "454910"], "description": "로봇 제조 예시", "version": 1 }
]

```

## data/etf_meta.json

```
{"schemaVersion":1,"items":[],"note":"운용사 원문·기준일 확인 후 입력. 결측을 0으로 표시하지 않는다."}

```

## docs/COMPANY-SEARCH.md

```
# 기업 검색 및 상세 화면

상단 기업 분석 메뉴는 /company로 이동합니다. 기업명 또는 종목코드로 검색하고 결과를 선택하면 /company/[code]에서 종가, 전 거래일 대비 등락률, 거래량, 캔들 차트, 관련 테마를 확인할 수 있습니다.

실행: npm run dev 후 /company를 엽니다. USE_MOCK=true이면 키 없이 실행할 수 있습니다. 수집된 data/local/theme-prices.json이 있으면 해당 기업의 KIS 일봉을 우선 사용하며 출처와 기준일을 표시합니다. 스냅샷이 없으면 기존 provider 설정을 따릅니다.

현재 제한: 등록된 국내 기업 8개만 검색 가능합니다. 전체 거래소 종목 목록 연결, 실시간 현재가, 시가총액, DART 재무·공시 및 AI 요약은 후속 작업입니다. 등락률은 수정주가 기준 최근 두 거래일 종가로 계산합니다.

```

## docs/FOUNDATION.md

```
# 2단계 기반 작업

## 출발점

Open-Dev-Society/OpenStock의 커밋 `38da6d45e714b36b1cf56e945c290b70684eb03b`을 openstock 폴더에 clone하여 확장했다. GitHub 계정의 remote fork는 생성하지 않았다. AGPL-3.0 및 원본 고지를 유지한다.

## 실행

PowerShell에서 openstock 폴더를 열고 실행한다.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

.env.example은 USE_MOCK=true가 기본이다. API 키·MongoDB·Redis 없이 `/themes`, `/flows`, `/etfs`, `/company/005930`을 열 수 있다. 기존 로그인/계정/관심종목 기능은 실제 DB 설정이 필요하다. 목업 화면은 기존 서비스의 로그인 사용자를 가장하지 않으며 관심종목 기능은 후속 구현 대상이다.

```powershell
npm run typecheck
npm test
$env:USE_MOCK='true'
npm run build
npm start
```

배포 전에는 .env.local 대신 배포 환경변수를 사용한다. 실데이터는 USE_MOCK=false와 MONGODB_URI, REDIS_URL, KIS/Finnhub 키, 토큰 암호화 키를 설정한다. Redis는 접근 제한된 서버/서비스를 사용한다. TOKEN_ENCRYPTION_KEY는 32바이트 랜덤 키의 64자리 hex 표현이다. 비밀키를 NEXT_PUBLIC 변수에 넣지 않는다.

## 포함된 기능

- 네 페이지 라우트, 분석 메뉴, 다크/라이트 전환, 면책 문구.
- 공통 PriceProvider 계약, KIS/Finnhub 일봉 mapper, DART 공시검색 adapter, 결정적 합성 목업.
- KIS 암호화 토큰 공유 캐시, 만료 5분 전 갱신, 분산 잠금, 발급 간격, 공유 직렬 요청 제한.
- 실데이터 Redis 결과 캐시 및 MongoDB 가격 스냅샷 재사용.
- Lightweight Charts 캔들·라인·거래량·정규화 차트 컴포넌트와 여러 시계열 입력.
- 서버 API `/api/analysis/history?code=005930`; 실데이터 모드는 세션 필수.
- 목업 화면 날짜 필터·정렬, 로딩·오류·빈 결과 표시.
- PWA manifest, 아이콘, production 서비스워커와 오프라인 안내. 서버 API·인증 응답은 캐싱하지 않는다.
- 인증 DB 연결을 모듈 import 시점에서 요청 시점으로 이동. 원본 Finnhub 공개키 환경변수 참조 제거. 빌드 TypeScript 오류 무시 설정 해제.

## 단계 경계 및 미확인 사항

현재 화면은 가격 기반 연결을 확인하는 화면이다. 테마 계산·수급 랭킹·ETF 메타데이터·DART 재무 매핑·AI 요약·장마감 배치는 다음 승인 단계에서 구현한다. 가격 스냅샷 저장은 초기 캐시이며 종목/일별 장기 이력 모델과 수집 상태 관리가 아직 추가되지 않았다.

지원 종목은 삼성전자, SK하이닉스, KODEX 200, SPY이다. 전체 국내 마스터 및 검색 통합은 후속 단계 대상이다. 목업은 실제 공휴일을 반영하지 않는 합성 시계열이며 화면에서 명시한다.

KIS 경로/TR ID는 1단계 공식 샘플을 기반으로 고정했으나 실제 키가 없어 실계정 호출은 검증하지 않았다. 투자자 반환 일수/단위와 ETF AUM/비중은 아직 검증하지 않았다. DART 공시 검색 adapter만 연결했고 기업코드 ZIP 매핑/재무 adapter는 기업 페이지 단계에서 검증한다. Finnhub 일봉 권한은 계정별 확인이 필요하다. 실데이터 장애는 목업으로 자동 전환하지 않는다.

토큰 갱신은 응답 expires_in 기준이며 API 토큰 오류에 의한 강제 재발급은 아직 구현하지 않았다. 최소 발급간격에 걸리면 재시도 안내 오류를 반환한다. 분산 작업은 30초 잠금을 사용하며 각 외부 호출에 10초 timeout을 적용한다. 멀티 서버 Redis 통합 테스트는 실제 Redis 설정 후 필요하다.

브라우저에서 테마 기반 화면의 375px 다크/라이트 렌더링과 모드 전환을 확인했다. 문서 너비와 scrollWidth가 일치해 가로 넘침이 없었다. 네 페이지 HTTP 200 및 목업/면책 표시도 확인했다. PWA 실제 설치와 오프라인 재접속, 다른 페이지의 모든 모바일 상호작용은 후속 검증이 필요하다.

검증 결과: typecheck 통과, Vitest 102개 통과·기존 4개 skipped, USE_MOCK=true 프로덕션 빌드 통과. 테스트에는 토큰 암호화/캐시 재사용/잘못된 응답 거부와 결정적 목업 OHLC 검증을 추가했다. 실제 Redis/KIS/DART/Finnhub 키를 사용하는 통합 테스트는 수행하지 않았다.

원본 의존성 설치 시 감사에서 51개 취약점이 보고되었다. 후속 로컬 audit 결과와 일치하지 않아 배포 준비 시 네트워크가 가능한 환경에서 공식 advisory와 전체 lockfile 감사를 다시 수행해야 한다. 자동 강제 버전 업그레이드는 하지 않았다.

## 코드 전달

`foundation-full-code.md`에 이 단계의 생성·수정 파일 전체를 생략 없이 수록한다. package-lock.json은 원본 파일을 그대로 제공하며 문서에서는 별도 파일로 연결한다. 생성 스크립트는 현재 파일을 수정하는 내부 작업 기록이므로 재실행하지 않는다.

```

## docs/KRX-HISTORY.md

```
# KRX 과거 일봉

node scripts/backfill-krx.mjs 20100104 20261008 8800

시작일, 종료일, 이번 실행 최대 요청수 순서입니다. 날짜별 KOSPI/KOSDAQ 원본 응답을 data/local/krx-history에 저장하고 종목별 stocks/*.json 색인을 생성합니다. 재실행 시 저장된 날짜/시장은 건너뛰며 실패한 날짜는 다시 조회합니다. 주말을 제외하고 빈 응답 날짜는 휴장으로 저장합니다. 최근 빈 응답은 데이터 미공개 가능성이 있으므로 해당 날짜 파일을 제거한 후 재조회해야 합니다. 원본 일봉은 수정주가가 아닙니다.

매일 갱신: 거래일 데이터 공개 후 해당 날짜를 시작/종료일로 같은 스크립트를 실행합니다. 예: node scripts/backfill-krx.mjs 20261008 20261008 2
자동 예약 실행은 아직 설정하지 않았습니다.

기업 상세는 저장된 종목별 색인을 우선 표시합니다. 색인은 배치 종료 시 생성되므로 실행 중 새 일봉은 아직 차트에 보이지 않을 수 있습니다. 화면의 저장 구간을 확인하세요. 전체 수집이 완료되기 전에는 일부 기간만 표시됩니다. 신규 종목은 상장 후 자료만 존재합니다. 현재 검색 목록은 최신 저장일의 종목만 포함합니다.

KRX 공식 약관은 키당 일일 10,000회 이하입니다. 이번 수집 외 요청과 합산해서 관리해야 합니다. 단일 수집 프로세스로 실행하고 동시에 여러 수집기를 실행하지 마세요. 장기 보관은 파일 용량을 고려한 영구 디스크가 필요하며 Vercel 임시 파일시스템은 적합하지 않습니다.

기업 차트에 일봉/주봉/월봉/년봉 버튼을 추가했습니다. 주봉은 월요일 시작, 월봉과 년봉은 달력 기준으로 집계합니다. 각 구간 첫 시가, 최고 고가, 최저 저가, 마지막 종가, 거래량 합계를 사용합니다. 부분 수집 구간과 마지막 봉은 완성된 기간이 아닐 수 있습니다.

```

## docs/KRX.md

```
# KRX 전체 종목 검색

수집: npm install 후 node scripts/collect-krx.mjs 20261008 (YYYYMMDD 거래일 지정).
실행: npm run dev 후 /company.

.env.local의 KRX_API_KEY를 서버 수집 스크립트에서만 사용합니다. KOSPI와 KOSDAQ 일별매매정보를 각 1회 조회하고 data/local/krx-market.json에 원자적으로 저장합니다. 이 파일은 gitignore 대상이며 배포 시 영구 저장소로 옮겨야 합니다.

검색은 저장된 2,765개 종목을 대상으로 기업명/코드 필터를 제공하고 최대 50개를 표시합니다. 데이터 기준일과 출처를 표시합니다. 종목 수는 기업 수와 다르며 우선주 등도 포함됩니다.

기존 KIS 가격 스냅샷이 있는 종목은 해당 차트를 사용합니다. 그 외 종목은 KRX 하루치 시세를 표시하며 전 거래일 대비 계산은 자료 없음입니다. 전체 종목 KIS 상세 자동 조회, 과거 KRX 수집, 수급/ETF 전환은 아직 구현하지 않았습니다. 빈 거래일이나 인증 오류에서는 기존 캐시를 덮어쓰지 않습니다.

확인: 2026-10-08 기준 두 API HTTP 200, 총 2,765개 레코드. 타입 검사 통과.

기업 검색 기본 화면: 시장별 상승 TOP 5/하락 TOP 5를 FLUC_RT로 계산합니다. 검색어 입력 시 검색 결과로 전환합니다. 시장 지수 등락률은 별도 API 미연결로 자료 없음입니다. 모바일에서는 시장 카드와 순위 영역을 세로 배치합니다.

```

## docs/THEMES.md

```
# 테마 페이지 구현

## 실행

기존 목업 실행은 `npm run dev` 후 `/themes`로 접속한다. 실제 KIS 키가 .env.local에 입력된 상태에서 `node scripts/collect-theme-prices.mjs`를 한 번 실행하고 `/themes?source=kis`를 열면 수집된 실제 일봉으로 테마 분석이 동작한다. 화면의 'KIS 실제 데이터 / 목업 데이터' 링크로 명시적으로 전환한다. USE_MOCK=true의 기본 페이지는 계속 목업이다.

KIS 수집 스크립트는 토큰 1회, 종목당 최대 3회 일봉을 조회한다. 요청 간격 1.2초, 실패 시 제한된 재시도를 적용한다. 토큰과 키는 출력·저장하지 않는다. 모든 종목이 성공하면 스냅샷을 교체하고 실패하면 기존 파일을 유지한다. `data/local/`은 Git 제외 대상으로 추가했다.

이는 DB·Redis 없이 실데이터를 검토하기 위한 수동 스냅샷 경로이며 공유 토큰 캐시를 사용하는 운영 배치의 대체물이 아니다. 토큰 발급 제한 때문에 수집 명령을 반복해서 빠르게 실행하지 않는다. 브라우저 조회에는 KIS 호출이 없고 갱신은 수집 명령을 다시 실행한다. 키는 서버에만 존재한다.

## 구현

1주/3개월/6개월 선택, 동일가중·시작 시총가중 선택, 테마 수익률 정렬과 이름 필터, 테마 클릭 상세, 구성 종목 정렬·필터, 기여도 막대(%p), 기준값 100 테마 지수 차트를 추가했다. 테마 구성은 config/themes.json에서 추가·수정한다. 새 종목은 원본 데이터와 종목명 매핑도 준비해야 한다.

계산은 lib/domain/themes.ts의 순수 함수이다. 월말을 보정한 달력 기간을 적용하고 실제 시작·종료일을 표시한다. 구성 종목 중 누락이 있으면 제외해 재가중하지 않고 자료 부족으로 표시한다. 시작 비중을 고정하여 지수와 기여도의 계산 기준을 일치시켰다.

## 검증·제한

타입 검사 및 프로덕션 빌드 통과. 전체 108개 테스트 통과, 기존 4개 skipped. 테마 테스트는 동일가중 2.5%, 시총가중 7%, 기여도 합, 지수 시작값, 결측 시총·종목·0가격·월말 경계를 검증한다.

실제 KIS 데이터는 수정주가 기반 가격수익률이며 분배금 재투자 수익률이 아니다. 기간 시작 시총은 아직 확보하지 못했으므로 실제 데이터의 시총가중은 자료 부족으로 표시한다. 목업은 합성 과거 시총을 제공해 가중 계산 UI를 검토할 수 있다. 현재 수동 구성으로 과거를 계산하므로 투자 백테스트로 해석하지 않는다.

수급·ETF·AI 기업 페이지는 이전 기반 화면 상태다. 사용자 확인 후 수급 페이지를 진행한다. DART 데이터는 사용하지 않았다.

실계정 검증: 8종목 모두 각 300개 일봉을 수집했으며 최신 반환일은 2026-10-08이었다. 실제 페이지 HTTP 200, 브라우저에서 실제 수익률 표·기여도·지수, 6개월 원전 상세 전환 및 과거 시총 자료 부족 표시를 확인했다. 수집 결과는 키를 포함하지 않는 로컬 스냅샷이며 자동 갱신되지 않는다.

```

## docs/UI.md

```
# UI 적용

밝은 배경, 청록색 강조, 카드형 정보 구조를 적용했습니다. Canva 생성 문서는 내용이 비어 있어 앱에서 직접 디자인했습니다.

- 테마: 요약 카드, 랭킹 사이드바, 차트 우선 배치, 기여도와 종목 표
- 공통: 반응형 내비게이션, 다크/라이트 전환, 데이터 출처와 기준일
- ETF/수급/기업: 기존 기반 기능에 공통 스타일 적용. 상세 분석 기능은 후속 단계입니다.

실행: openstock 폴더에서 npm install 후 npm run dev. .env.local의 USE_MOCK=true로 기반 화면을 확인합니다. /themes?source=kis는 수집된 KIS 가격 스냅샷을 사용합니다.

불확실한 부분: Canva 문서에 사용할 시각 요소가 없었습니다. 과거 시가총액이 없으면 실제 데이터의 시총가중 계산은 불가능하며 화면에 표시합니다.

```

## docs/company-preview.jpg

```
���� JFIF      �� C 


		
%# , #&')*)-0-(0%()(�� C



(((((((((((((((((((((((((((((((((((((((((((((((((((�� Fh" ��              �� ?    !1"QRa�AS�����2q��#Bbr�34�C����            �� &          Q!1A"#2Baq���   ? �>�xY|��A�_���X_յ�N��u'T���猾?�E��@�q
u��hBO������ɿ��s�� M���h!J�+R�ZS���)FQyM>M0�                       8o r
��Cy������yhZ
�O"��6 �  $�Iql��}��'Nig�@@ ړƝt�=�� �4��RU�T�'�8�����a�/��M=J�Z�Ug�Z��x�|9&�|8w��ӤZE#��[-���N�zԶjO
\"��qi�m���~�t�D����ZT�BR�V��SK8|ypl�Dzu��6׶U�s��U،T��rmy�_�h��|l}>x�8O�;����V�F���-i�m4�V��b�$yk�_�Z��z=(��nu
��eZQ��U��J	vs��O�hdt��MrUcoF4�&�K���� ��ҵG���=�ŗ	������-�?�#�2��}oǄ�ǎ3��x�/➩J�N�5}�-��[:r��s��Co��X�{sϷ��O�êKL�x�J�J���w��ڜb�Ԕ���%��+���0�:<�\U��}�R�Y;�����O;N)��G<���]���hh�������))�Ǐem$��/��d�#�?IuZwF��j6�yGH�Q�sFTܖ�sI�&��'�GE鞽�ˣ��}�;�2�;�t�(:wiіg	�������|����О��򼖡�S�;���VnRRs�j2M>�I��=	��m4�hitcKM���Q���6��s���9ϴ��<Y�m�?�V����Qִz�u;J�vV�yU*ps٪�If+�o��~��äz~��������+/�Wn��R��t���/��zo@�/��\����Ыq	S���l��E&ڊ~�`���>趘���)Sj�.ۛjp���×B��Y5t[��F-5{�V�z�u)ӣSob��]�g�0h�M��oR��n��ԫ:Μd�v��&�|2��������� E  f�kT����Fu)Ӕ�g-.G���}R�k���)4�',m9e���G� �SUeUS��%�4��ݒ�K����Σa:���uGc��y6��#
p����i�<,e�i!$!Z{�3�̥��ي�~H򫤗1���^����Q��ҒT��ؖ�E6��?o��J*�[U�R�[z3�Q�N�jO��k���3��Ԭ�U��*�xK)c����)���iKukF�y��8(��ȸI
/j�u�E'*t�4���施{+Ju���QtkU�qO�"�;2k�zÅ�I|˦U�Z�N�.5|6}2� ����d��f-O��MͭZ�joiŴ��:�_֭��U�N�*E���8q��5Ӓ�x���|�o��Qqcms����Z5SU)�)%�g<�"i��a�_�4���)���(^S�*�'wV�T�)��;\�q����mf�K�U�*uz�J�jT�Q��\p��,q�z泏^��kgcl����Ks����=�ѵ�gmջ���Al��X�Wy����8<�-�k&�ȡE�H�˯r � %G��� k� ���Pտ�u=.n��B�T�9�AՒ�N.|�a��R<Q���j)>X��TӴ�Z�!����ƛ�jJ[/ی��]N��a�zu�Ӕ��Gf]�8���\	�H���B�)[�4��;0�#���$���@r    ������	;/�/A��r�@�����l�� �#��r�/�/@$������	;/�/A��r�@�����l�� �#��r�/�/@$������	;/�/A��r�@�����l�� �#��r�/�/@$������	;/�/A��r�@�����l�� �#��r�/�/@$������	;/�/A��r�@�����l�� �#��r�/�/@$��@�    R��֖�m�t�Z��sZu�m�s�xXy��d�Oi�.s�׫v�Z�]��	�J���2̰���y��Z��{`x	� ,#qgc+gCW��R��i��Զ�[Ėv��O�?#��J��[L������G[ҕW���m�.�mD5�t��V�M"��������R���m��Fi7ϟ#=�Otk�����:]�me:��J���Ic/�W�J���A�t;Z}#辛�:]�QUw[{{�g?�5$M� �                                   OI�zIҫ]K^�V:V�RS���)εn1U�5�$�ُ>9}Ǎ��N鶣���7[�����(�u����ߴ�I�YZ�Uiuz;��r����͵�l��O�-oK�[�vV6��}r���MN��I��6�*J~������ ����1����F���W�Q�8���ʤq����}2���ѫ���(T�ڌ�B)�ޞvV��=nڅ}�ӽ����&�?|f1|w�e�T��N�ۦ�eMN��.�laJ�jQ|Ҩ�K
2k�1���O��ƅqZ�K�!FUz�\{W��=��tZ�����3��v�}����,��M�9R����#L��Z�M>?i2��1�����G6Q��o/�{�z��B��8R����I)��X�� T                                  8g 9SN��:�s�5(N{�:�/j�QNO<T_Ř��_�HT�WP��7�Vp�[0�IEe����k��=�-�<�=;Q�훯RKeFy�&�n<�����rhTu(+��4�������sN^֗=�Ӽ�ym6�V��ԩNiM��=��nRo�潄�m�;�>{��J�(m�[	��;�<3���{ON�j����F�%CQr�]�����Z_�ap���J����%p�}N�j�JW2u|xNM�g� c҂Z����j�}��RYP���Բ���^/���/Vw��=�ѫZ����hV�yr�����xO��=S�Z�^�ѧoU��\T�nS��t�)7	)��s��2�w�ؕ�e
��i��9�>��7�\VV���m�c����:Q�����i�Mc��Is_��ge���iT��I�{U6�\�� ;K��-c�ׂ�j�w�W�cn����ש�ިT�v���>xk��ִ��ڝ�{��R��(T�0�����g\x{>>��y�[KڕkBU�3�VU�D�n)IK�5�g��p�~�8ª��WnOy.��1�Q�˓���צb�SH��S���(��(Ք�.{�K1���{\s��Qm�6�[\�4r	3k@ �                      �>Li������D�Q�����_��� S��pWu�76��{M�y�u?��G��u֝ �.�:�����ӊ��(��qY\cٗipn-g�'�i�򥣻���Nt�i�E&��Ä����<o�G��7Q���4�^�S�qN��5�n�j���o�5�n"�����n���& ��>���Ę���F�>`n������I�!����n���& ��>���Ę���F�>`n������I�!����n���& ��>���Ę���F�>`n������I�!����n���& ��>���Ę���F�>`n������I�!����n���& �t����ʗk2.H��  ��g'�\J���V��j'Zu'�q�)�\cJ*q��W��V_>��2���J2���%%�F-�/g!	3�uz{mm�Ƶ�m�����iM�&�sO�2��<J�tf�]�+�ֵ-%����)5RI�m���>ܞ����S�K�:�<U>�����:��tz��^�V��V;�#��ylF+yc�ݕuxx�}I}�W���ԗ�/�Z
��<U>�����S�K�B���U����%�^*�R_p^\Z
��<U>�����S�K�ˋAWW���ԗ�uxx�}I}�yqh*���T�����O�/�/.-]^*�R_q����%��Š����S�K�:�<U>��༸�uxx�}I}�W���ԗ�����O�/����T�������U����%�^*�R_p^\Z
��<U>�����S�K�ˋAWW���ԗ�uxx�}I}�yqh*���T�����O�/�/.-]^*�R_q����%��Š����S�K�:�<U>��༸�uxx�}I}�W���ԗ�����O�/�]Zs���JO唛��1���"�P���&����*�  8|������/�/��v���� j�ȵ,�'�jr��wr����E���33Sr�#� P�G���nr���� ay�w��y�0h���U�Ɲ=�q�9����ˇ�g'�;�����I�#��w?���lz��?�*�*�*��i��r�Y��^=���=I���w?���/����Clz��e�����GY~�$� K�=h~����I�#��w?���|z��e�����GY~�$� F������s�'������I�"���@3�����O�e�����E�րg�/����:��s�'��7ǭ ��_���?�u����O�o�Z���w?���/����(��?Y~�$� �_���?�Q�=h~����I�#��w?���|z��e�����GY~�$� F������s�'������I�"���@3�����O�e�����E�րg�/����:��s�'��7ǭ ��_���?�u����O�o�Z���w?���/����(�����)�/����Fu'Z;�(��N-%�� ��~�[�R� b���5B*1Q\��2�H,EDC� P��g'�\J���:���eJ�hB��c�Ŷ�����?�~��U�k�\�Ru�Kk�qy�]�_rB?�-�KuS5i�ԒQ|"�_�Y�ϤZ}���ZT�h�(�r�Zmp\y&qi��[MNW�%S{*N�r{O�m��m��w�-;�gB����j)��:m�4���<S�_V�X����qu'8ҟf�_�|}���Q�m]S��O��w-�Y�\�t�=kK{^���'V�rmg9|x�_�N��U�⻫am�s�U�Gj_�ǯ2xz�F�޵ĨҞ�H�i��,'� ��Xŵ�o�n1m.	��⸑���Ҽ����
��������y� �����4J�-9�٫���a�\8q�Ǉ���me2U��j-a�_��I��K*�u�^⋊��	<96�g�e�C�U-'���mOu	�;X�?V2���J� �6U�N����y�V�f���O�|q.|�%����U�����m�����4ӗr|Je�i�t����*r��|�<G=�-��Z[F�6�iх'ӧ��ϒ��'�T�F4��t����i츾�n�s��܉��E�j�'U[P�ԿҼ� ���#KR��j�)֌��l�.��ltuao
��X��*�^ܶ��^_�Z��ڶs�^�j��:�u[���y^���� ��v#=�v$���{"ʚ��:jr����bqM���K��?N���Z�!�p����y��4�쳴���U�
1��J.ob���FQ|?�e����νJ1�B1��=�8�̴�g��[��U�Z�q�Z���{��6�P                      ȹ#Y�rE��  �98|���W�J��                                      2.H�d\�a%� ���N&����^oz�n�ҭ��Y�c�����]�t-jՌ�"䢽�\����gJ+i:̫Z�[I���Ң�7*�{VS��I�Gme�2��i����\�v5��Я+��ӕδ��[XM�ᵘ,<{��z.MAP�v�%W�T��(�[+ee��_�V�Z��F0��VU���,��������x�C�K��eesK;�Mu��Qp�Mή�Kc�M5�Ҏy�������UӬ�c��FYp|{2�|3���C^ު[�P�:�.4�O�<�"�������ܬT;�y���ޭZVʪ�Nu&�>�\V\[��#�b�� @   ����=6s����4e_b+2q\���q�N���ԮiթssJ1�T�I(T� r�?b�~��6����_��iGO��u�U��*j���-R�Mj����ЩRU����I.ĶeŬ>$�b�[�P�:��D�.rROk<� Sy�e�薗g�W��Nq�����-FS���$��<��ǟ���� ���R���^���t�r�XO2�xX?Cji���8?#%��Bּ�P��2�N���age$�~�D[jP��q� �R1���q�m/���$�qڽ\ #@                 �rF�"�	.@ &rp�05����G����                                      $k2.H���   �RPX��=���� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�P��������� -�?��?�PS�),.�     G����U+�z�N�jsQ�-�'����_���[���=E����tH���IN-�8���U�J�J�HE�po��}���tHʵ8ŹT�K���B��r�a^s�>~����tGo�&W�Y�7�!�5q����M���X�zo<�K�?�"��tGo�%5/-��jU����<��&�(��Gj�g���
�o�#��4uI)8�S{8�+9���qE�1U`�%�����'����D�n(ɽ����ĳü:����H%'���>�tGo�"��p��O	G���� {}��� G���� {}��� G���� {}��� G���� {}��葕Zq��)�M�|K �o�#���V���$��$䣌������tN%R�c)�J\�|Ɂ�tGo�$��JqR�N/�@;}����J+2i.\N@�o�''   �YX9 t�}����J�\Ut�YFRNX�����}��:s���9mE���x���ܥC���P�b��m�BR���7����.tz5�R��� �Q\{M켮/���%:��V�N���m�Y',Ͷ���]�B�F���B��M��.M���v�\��c��X�� �]J5Z�R��'���~ĩh6��q:���q\s��c�w \����B���Χn{ͩ=��޳���iT��;�R�qyp��_bQK��؁rS����(ԍ��U*%�8AsJ\p�/��`ش�*�V̳���Q�X���rS���MCf�z��ۓ�nI�)���O�"��M9��Z��d����쀹)M�o	ENSړ�r�ĸ(             ��4�
�5�O{Ia>)p}�?�v����I�*)�E(����r������)��C�6�Z{1y�p��O}��GB�8��\1���mawG�<������:];�BU*փ�e�6�V3��o��\vw�K	4��� �܎���$z?ANs�YNR��v��%�c���ĵ�t�hҩR�\[�����ZO��%C�}�s���s��&���{�c<�q���uf�%)�B9M��~���x�w@\��tz���u��ˊ�ĳ�ܼ��#��qIc� .� P                                                                                                                                                                                                                                     ��
```

## docs/krx-history-preview.jpg

```
���� JFIF      �� C 


		
%# , #&')*)-0-(0%()(�� C



(((((((((((((((((((((((((((((((((((((((((((((((((((�� ��" ��              �� W  !1AQR�3aqt"246crs�����5BU��#$�����7Tb�S���CD�&8Wdu����             �� : 
     !1Q2Aq��34a�����"RS�bcr�#��   ? �}AN>����[me�k\�Sx�ܸ�`�+��e�����c�0����$�kA��⮚�*��l��<8Fs��TWJDh!���{QDUD@E��󥪸nS����B��U9���s�y��i������ և��l`�1wU��>SN�n���/�Ja��� ��V������������clo�Z �
�Li孞���ǻ�}���p���i먤S���8v~}J�iv�11xDDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DD�8��I�fl��ڙ��%�:�Gjdv��3��v�Gj��s:�Gjdv��3��z��f�*�H���D@DDD@D^ \���=}�=ETS�����GܞǏ���?�
H��?����i�vuj���!�-w1�Ј���mP����9�͂'J@��	�K��zA���n�tO����4�z�<�WI�?�WT���h��7�Q_H""
(���:+�H��i\�:�aY��_��_T��c{N��?Wv�mm�gCn���V���&3�[��$�c��Ü{�7�WP��m��q����Su3kjn�\�������2q�+�T���0cfj�#��h�1��w���	l4�u52�d����Cji7=Ղ9[EbY]�N���ug��.�w���h玮����J�G�SS3"�IH!�9��ӂ�^����������Z0�*S7��lp�� /� ��n�&G?`��C*dk|Á��[���Ie�U\�2�i)�d�����o��������D�Ys�(q��� op8eqq:R�{�����D�l_5^���Z����t��|×,��t{҅e�hݳgl���c!�p�0yq$��9YCYѵ��\�T�F����Ϟ?Z�}4K˦=�����]��a��ı���c�;@�l��s���5l���.��,q�#�����J�R�#wc�x�W�5���ͨ�������X^��#����M����H�[�򾞒�G��95��8j8く�\�=GF'_��1S,��-�T
y�t�{O�ϰ�Xd�o��g�o>ɳ���妆����J
z��L2�1�vya��V��P��^ϭ��ޝ1�k5���į��Z�S�[5_Y>����
Ǽ�l��:�t����⮶җh ��em�OE-\9a��}��C4�稒�e�kk�{s���]%��YY%%%Ɗz����)����r*�ޑ6��n+6[��m=EM5T�T�F2H �ǭh�)�]�����ܶbJ�*�����=�ג�r�}���yq��o�t��IG���!-'��C#�ig�
�M:Uկ��T�c�O��`�E�Os�ٶ���MubW�����x4���=af�����S���)l����48�8-eo�������I���4��l���\ �-���\y�c��f�3���54�\,��Q���85�|���"j����H���m�c�˕��k|l�ܨ��'��2�F�2��{dc_��8d9� �оm�b-}%��6�k�*+����b��<>v �Vٵ���m��Z�����fCMQ���t8��dvu��8v��k�^���hk�րW�O�����{4�+B�=��[�d���9���ȃ��/Ϻ�~��ݞ�ofn}P�*.2���i�T듦�9�<ZH���ֹҌ�-��;f���{�Ζ�8��Q��<� ��g��ǵX����7JMS4�Ǎa���klw�Ip�ms��;�h������� Ẋ�w���W*�+v�~Y9��B�ȁ���c�xXWNY�:jͨ��B" """ ""��c��5�$�����#��H+��B�زH��zHYj���5`%�7 Y��2��-�e-S�qn��Q�L#��x�:�r|�VT���6o���C(�SQ;��I_���0��ʯK���ɨYI#�n����� '9���g��zبꪢ����
x��rp8*JJɮf�T�f���V�"��N�'�+�f�PE��NW�b" +�֖�QGS�_W&�.��W��i-v8�+�ݩj�d�X�[=l�-�;���#���YS��m�_V�gO+&{AL1��8�\{Q@�xt/����ԯ`.��^��z�l���Z�c�`��=�q��˳�Ռ�MUWs�2j�y�7T[�-c��9#�2�M��N����z�f""���
�Nn0���e�9՜c�jήw����$�6�h����f�`7�o@�C�Wi�͒��]�E��jw(]3��d�q�JQ�e�Z��Gq�ӹ���K��r�V�� ��� �ؿ��ò��m3�5 ���o��x���3�2�"f[�",#'�*��'�*�K][�{���5�$�����]Ki�n�P�Kc�� �����sH�a|�Ζ4��d�y��IE����U,��4��GE�L�.�B:�8��[[�bUTM1N��,�v���mfj��ad%�4��-�%s�[�����V���c!���Hp8#����
.�lW�z�����c�Hd�}��Mh�i�y�l�}�J�d����tFbX�y�9��h��8T�X��f��O��[����{���SKʡ��V��p�s�'����h�W+��m�q��ط���恜s~e��Mp���a�d!̎Wӻ{�; k�va[�5��ʨ��*v�&�Ǫy2���{���s���S���\�vv_�߅�ٕ�Μ2Z@�.�r����)`�S�-P�(Ă	s�< x:��Oc�e|����搚�t�t {�/�t���T �[po,ɏ7�re���\<z�Ċ&-�,�UX����J�^��Vm;�DE[D@DDD@R���QR���Ap�����vzJ�zmMڶ�d�2'�f2� ��+v\�b�i*�۫٠�T\��������T����v�6�$ߩ��*���QU�N�Yg���;Q�����׌�]�Uq�m�JM���g�C-\T��O��,yh:IkrK�,���ň��TyV�Ҡ�Q�[�O�P@DD����w�I\��p}#~�޶�����%�pZ?�����W����"*���@��-��d��F4v���DI�ş8����+l�l\�Y��F���;�A�կ�Յ�6�x�7�6Z��j&:��@t9�d�+N�m'�M���� �r��*�^F��k��i�/a���w�>��B��.JI<�t� ��8����#x�W�Lb#U3��t�9�z����O��_��� b��:��[}��S������6HW=�I�6�i�U3�� yn���B�Z&�I����o�T���KOS%�V�=�i�A�Jxh�b�����CƎ�
��U9�e�|.g�>�����y�OinJy�_N̹��C��`9�������[Q%~�{��PC�j9�y��8�Y$�:���U�v̔��|��{>����Cz����ջD��5�~A��u�K��y�e�e&������u�k������y��}d���AKON��"��9{����N9��5ͭ,�D^���/YЄ�TUų�Up��j�L�Mi{Fy�u��<q�Vkh�$���������0Ch���&f��|F9u.����rCF�/`��k��������5���9,6�tCI{����Sb�?�IN2�On�Ǐb�H�U1�f���y��F4�%s����j.��۠��1��`�'�=]J���4Vm�u��{����m���̲Bs����$�p�z+�ot���^�i�UV��Vء�9����<����Ǒϥm;-ц��vR��b}du��d�w1�?����ޑL�l�X�g��Bݮ���_��Z:��gV��O>����(`�+��Xi��6��Z���ĿW?uغ2+�U�2S��[�9e��z�����KX>ɠe�����1��5��,ffb#�+kqQQ����CSe���\28�Ȃڂ���$b8����'$��4��SUK���n���ur�����
֮���jij#�%3������U� ��[�n�n���K�%����KK�vjj��!���;Sdq���Vu��ܓEYU�˼4�L�չnsۜsW����11�F��n��#Q��^�p�2&5��р����2{¨��daR,#�(¨EE�c�ᖸ`�='����Tcf!�=lu���R�of4�\xq�<皶��-l5t�zj"$��G�I�:��4�OaW4��4M�,i�c.�Ku�к�LٝtH-�>^�]��k��P��-�\O�����SI�)yYæg5�D�A��mv�[Ut�1��Ζ�d���y���{
���{<Ub��ҩ��ԫ4iU�0��������
P�o��+� �7�Av����F�UCW[�WB4�WM3����SH$y�B�	�cv|�'�>M� g�x4���֫-i���5��̭��J�	��� -�Q�Gɿ�������!&�i��[�J��qs���" ��ū��K�
����������/�+���.�oޢ��DDQT?h�-]�R_�W��\H߽w����w�I\��p}#~��" �����^�jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp���jwp���w�� ��w�jwp�����͸RD@DD����w�I\��p}#~�޶�����%�pZ?�����W����"*�" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ��ū��K�
����������/�+���.�oޢ��DDQT�88��X:
���G�hhÛ)��z��Y�����R>���̧���wS�3���l�Qz3;`�<J�ZZ��X8$�*-�Q���f��jc��#.~�̐9s
�*z�ۄ�轏>:h	�G�{���Ň�6�f,5Ѻ����A���������ҭ�/-���IUUM;�!���x�ד�N��IK0��G�����ݤ��X�_j�씔4;WK��2�|����ْ�d������n��3MZ�+�dB�*PȚ	-��v�~n<��^�ig��S�d�q�H�2^�h�x��v��	)�D��CbsZ1�������tUV��%;e��կ�S��3#C3 ���̬e��)j���C!���L��_�p8㎳��I��fm>�BDE�!c������%�pZ?�����z�?�WT���h��7�Q_H""
(������<##�Td����A%</�c���c�J� ������_KIO��tq���{UAGV���Jy��0��� �MM,{�hb���Ll��S�6H ��x8��EMc������%�pZ?�����z�?�WT���h��7�Q_H""
(�������_Kk����;)�a��������Kt����;*)f���!�̂��b�M�� s��I+�m�MC]h8�z�v�x�i䞢F�m/{�p2U���UQY�nt7z&��ꡪ�q K�4�ϊ��m���k�6ji%J����FKKx�w�R�{�]�"�U��TS�k.t4�&9j���Dm-��ճ>��V]�y�+E�hmvZ�e�u���.k���Y��C��4mwc�Kit��UEC�t��� XF퍥�dva�Jn�-���ѧ�ܹ$E��bDEDDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DD����w�I\��p}#~�޶�����%�pZ?�����W����"*�" ��y���{Y@�V܋i��o��g���}�
J퉧�:A�ת�W�{pノίJֶ��a��m)��j�.����d6���0i'���ݞ+z�-���]6��bښ�r�i#ݶ�O~�1�������{�뙉���3v�+WK�h혱���*fk�ݷ_>$ev����N���׽�MQN�"��/��Ƒ��}sނ+��$m�Ƙ��U�72ǥ������5��i*��ov�j�5+���s{�����q��8��T�"��V�x����U<Z�CW���U��̾��jhjK��Nbs�Nfq��m�i�� �N�u�pt�liѥ��ל�m���f�^��6�F��Y�][o�F��W���덯o:d��-U��}.�����L��[�|:�GK5�Y�b���v��n��}M5�iv��Ƣ:r�˿sA-n0>Aq~�6sfo{{���T]���7���3��c i=z����)��Um�k�����zW�AGG[� iv��ǯ��ԯ�}P���K��'���,�Od�``9�q� �]jw��l�/V���ut���z_�cq���	�{b�*�I{s�e�к��t[�;AUp��YS���s�ɋZ47��j]%E,]3tw�:y��F�wqÊ�tٶ솅�%���f��� ���9ܵ��r$u}iUꦘ�~�M��ͺ���g�{e�s��R���]�S��>���/�Je�AIK���'�1��OZ��Ь�;i�K{t����&k�c	lS��I�̌s���j����B�
沾�=��0�B� p ���f��'KOɅ1jm;�����������M�<e�F��v�8UX�mtv[]5��掝�#�Q:G��Wˏ6���{j""�""" """ """ """ """ """ """ """ """�Ζ��P�{Jj=��WECQ�)���L��j=�5҆etT5Қ�iC2�*�iMG���]G����P̮����SQ�(fWECQ�)���3+������{J��P�{Jj=���j=�5҆etT5Қ�iC2�*�iMG���]G����P̮���MD�DDV?h�-]�R_�W��\H߽w����w�I\��p}#~��" ������8�O���]�d.6+MM�۪<����2�,�*_���� �o]�n� j�H���f�^n�	[o�ۭ��_l�V�� �����g �ki�c���dYKi{=�M;jY�� �9���BD���c��mk�����h�z6�o�`�����c�F=Z�}�i���6��ge���# .��S��ϯ�8�nE�}omS&�����E}󣫍���U�:2ș��<�̴��ڎ�l�c:>�f�B�D���g��ƚ�4�n�t[]�U�Z1_��bf�5�8��x�p�]�f,��A=�m;nӀ�*q�p�r9��$��,DqZ]m�Wj)(�t��R�0�hsJ�ԶJ�?�-ձ[���x���""`��R숔Ֆn����QB_z=*j�߭w1KS-��ji��h�{����h��{�u��rS�IN�c����`8��H ��8}k��SEYI55K5�+Kܑ�y��+W�������~�dH�� �px����V����c��W7�m��ӡ�ݙh�V�_4��٘cud�I�?����0pJٶ^�%F��ʤ9��O��ȁ��$�q��^�`�OZ��i�L�3��pk��C\[�$��vvuCo����-؞C4�8�\y�	��:���p�)��7�x��� �I:�e%E�0�i�#��p�H<,��]%�T�U�����k���!{��0�0�>+~��i�t��S$�ne1�5��8�j��g"���W��2�-���4��1	f�,I���H������l��5X�����w4K�`q�2G5y�u�v��c�k�a��E$%�8�ȁ�mtmi�<~�Km�X�=�k�̌`E4�s�0F�����ޮVM<��{��=��y=����4L5�'51{�I��k۲���uUk\j�|ȋ�f� Ӗ�9�:�W�k�¹�:��Փ�1�a�--f��d5�Ϡ-��+H�U5��{C,2��5�=A�z�R��X��&��i� �$�e�  ;MQi��1)�gH�զ�j�l�,���\Y$�g1�i�$� 1�$s#���ߦ�ٹ�㚮�x"f檈I��q{@oQ''�ۭ�VQ�%���%1�5���1ĝ9��p>�_ڪcc����p)�N[��^��[3�,Y������Z�rm��u�J���MI3orD~���fFs�b.�����i��`����}�ti�V��}K�Z�Z

�j��VT�����g7`�֌�v�����s�_��n1�s�V�������ٱ2Zg�����/5��)�i��<?���p#1�gYӨq�9�U�w���|��X`���k�#<��3ˏ���:v���1���sy�2OYT�m����-��h�� �j�4ZݍӃVi���Y�l�[���)��k�E=\,�H��kdhl��$r�T�v���;On���N�)g�tO{��ᆸ��WBe��;��7w$0:��� ��O�,T�F�>#[_�wͿ0�3N�z���|�(����j�^,S1L������q�u��o�~��9�~ !�i�'����J�U��
�K����$}H�h�hp�Oa][ml���V�*+d{�Ɩ�a�a��/�Z�+)���hX�#Z��8r9i�k�Os����z� ���w��ʺ�('��_P"f��k����8����Q���������6cQ�6Lb���F�Gh�d���CG-,����MD��'��Vfp�[e��PR���>�$�0xǇnVSTu4Ӄ����g�~-Wg�wAQb���{*�o{��m�����$���i�#�\��UPT���^�gI�	���f�Zmu�U�Ѷ)�η84��p�|�,�����K�-{Kx8`�T��l��Ħ�L���hu�7�W�{w<�6����71�c��o�Ɠ��<9����E���l1��O�=������Ţ������LUM�˪W��n1�Q$��e!��"�8��&�08 `�fa0��)�g�g�[I�\/P]6����z��$�`dy���܀�YYݍ���������WO9�f�Øp3#���u��]%T�T�G�1��u�e�$�<$�*���Gh�4��wQ�..s�y��I'�R�k�W���k#�>�UR��UV.m;�DFL~��Z������G�>��z�[G�j����-���F��+�DAEAy��dg�	�洟c��}�ѳۑ)v��	D��<~Ξőmʲ�%�(��	7m2s�= ���NG�V�~��\2�28qy-0�T����2Em��ч=����I�qՐ�||
��u-4U϶GUU4p�E��p.c�x��2�K�R惂��zH�����ָ�����zF5Վx�5��hv	����ʹ����v�7#�lqǹ�f�277:�<�9��Kl�ň�T�X�dq�p]�� ��n����	?Z��<���!����Y2��Ƈ7$�c��[[-�l�'#��Z�5-�������ۍ1�(�Ų���9���3��JTSAKYr���:7��Y�Y���dg�b�.ڲ0NF� ������M%�
�-��һ0��'FG1�<ʨ�`��j�Kdv�[E(�Ah���NJ[��������(�Y���ƌ���9���kW٪�x�dLshtB깚}�c�@�����3֥��}.��7 j>u�G<��w����g���
H��b&��Y��v(g��Z*'�Is���ֻ:�0�H=~�IʹS3x��ǚ�j�C��Q��>ղ@���3� ���&$DEDDD@DDD@DDD@DDD@DDD@DDD@DDD@DD�5� ��y�v<�h�hCv<�u4BІ�y�v<�h�����y��B��M���7cΛ��SD-nǝ7cΦ�Zݏ:nǝM�!�tݏ:�!hCv<�u4BІ�y�v<�h�����y��B��M���7cΛ��SD-  p^�"�������/�+���.�o޻���Z������G�>��z��AQDEPDD&�Bj��i��կW���rϝ+-T5��j�����I���{G���V�ʮ�GX溢��n�x�s�q�y�cI�L�"3�x��WE�*�]T�ڊv>B $���#��J�]s���#�K2x'���+�EF6665��5� fa1`ކ��u�z��QX�i��өc����.<I�ЪS[�)��(`cc�:�מ��WH���%k)Y�H�N'�m��y����������DV�cZ�5�kF ACq�G�۪@�| |J��jzZh� ��a`��?dg�Ĩ��H�JO�("Lc>�v��P��g�h�c%��#���UtEc������%�pZ?�����z�?�WT���h��7�Q_H""
(���������OR� or
h����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H����n��
H���і�C��P���E�8(=E&B����=�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��M�{��AI]�{��^S������1�_�ֽ@D^ �K9��� �A �{����������������������������������������������������������������������������������������������������������������������������>4e�W���/���c������%�pZ?�����z�?�WT���h��7�Q_H""
(���4���Q�ɻ�P]D��u��T�QQuU;X��x��ۜ^0�4�>H��AY4l8|�i�.I�k�H ����Q{���ւ@�q<���i. �Pz�h�5��$j�1��葅�ۯ��;PI7OI�0G0\�C�- �Ȅ��{K��旷h<FT�Z�i��u૥m7�?4}�X%��!�a��^)A�O�D\""�"  ��b/汥�!�$����x�4N-��7�Ç���}�}��x�>dD$ I8�*�s�.�Ա�I �p8$d}�PTE4m���F�:Z\2�s�S@DDD@DDD@DDDA	۪'v�![�J�_$� AVÐU������TUx<�4}�&��(�ǽ���G�s.8zH �p2PS�A"X�	�8����2�4�48d���;TDDD@DDD@DDD@DDD@DDҍ3rp�ּS�����(*�" ��ū��K�
����������/�+���.�oޢ��DDQTd�n�%<���"(��:�&�Ha���Zxu����##����w�k�vX�;�󧨳��<STk)a��sR�q�k��8��^p�m7J���T�S_<b�o��,d�/��yg�x�vZ_jvd��qǬ�C������z�{Ud���}S�����trŨYpj򖙔�6̮cyet����I�K�u�j�j�R��@�z:��)d/�{�t�ğJ��)[Rˤ���I��.�7�nG,p+��RAY#�f�2F�ђ0�Zxy�R������T�I��֮o˯�kC����?K[����T�1��i���5Nh��Y�J��"|��﷔����ݫ���=�@��Ma�Mn��;���0ke{HyqvC��'���d����i@{���*��c����\ɗǽ��)��I<�k姐��X����-����u�c�-��V>�G����L��VCŇ?�� 	�^��AU4�����|���H�'{����d!�8"dP����kZ0PR�k-��k;7M5�W�kl�����{��Hk���iT"��*���O0kdvO��.���3u����(������������揼��m7�?4}�X)A�O�QR�ʟ���DE�me��
(�m4Ol�8� ^[����1�O޽�jI����e"�M8A��h r䳗+e5�s�.�\_���9��sa�^�[�ܾ����L�xkq�Բ���mn�+�uDj�U;!�m$��I���F\����<���)=M-;�OJa��Q;˵�g���[�L������,ss����
L�����a�n�<�_B�g�4��l�H:	�:Y�Í2��.���#l�M���:I\��Z�Lm�NZ#���V���E,t�����`{�Z �Á�T��r�EQ���l���U�8x�~����fe�S1-T��߯��D)����s�zp��[�eo2G�r�s��s�c��9g��1�F�<e�����Kn3{=ؔ��d��Z1�4,i����4߽�؜��mϑ�B�����5�H�O�to5U�T���O�v쑧P����\)3{,F�QF_$� AVÐW2�'�
���/Ux<�4}ʂ���揹�'tm�i�O,u����h$��z����[��Edi{A�xo���
�i�eE}s\�zW҃�v�pb< 匟�nU���RIMT�pH4��##�8��Dɡ|R�:7���=`�!Y�Œ"�w4����Բ��(��f$4��a���� tI��Œ��c�ͺ(D���Il�H���g2Oi䶶Y-̣�����<�{��  �9��S���QL�lΘ�N�i��v��,���naLE�Ȉ������������������(TyV�����<�~i�J
���1�G�j����-���F��mū��K�
�������DU<��IFO&�AAx��(�2�آ|�85��'���齏mU}�e.ջ9K&�{�n:�q�q��D�䙶�bEee��ޭ4�+|�ZJ�ı����*��[EH�dh`�y��1�Mp݇����c��7��f�f�t$\�j�Vm�h�l{9����RU-���Ga 8��������۶��=MS�TSI����a�;��9�rͳ&h��b,n�ިvv�Wu��"��f���� ��@�˩�pcMYv�;ͻg���V��"F����͕)�jܳTS���km�֍���^n����)����G��F���e�Q[��f�{9��i���ܤ� ��������&w$����-/�N�hv1�t����v�8����N���xr>��؞��_���h����a�:J�� +y��@��'�Q�L�^j��K�"�A��GU�u�5�6�|�V��-UE�W5�P�kZ�	��bd�*���6VQS���g�iy���\]��>���2ͮ^/g`E�؋�E�d,�
�5�54��!h�.#'�ͩ1i��7����(��������揼��m7�?4}�X)A�O�QR�ʟ���DEDC��HDmE���p���CRM�� O��oj�3v�<j1&b��"��!:��Si�X�/5T�5;��������i6�+�̶�g�WW�M���&��N'>n^*�]�ΰ�M�>�ۚ-6���粷���Q���b��\H<1�\�c۷�]���J�P��R����1�rqԙ*��:´M�� �v�[�-n뵐Q�5���Zۄ�[� @���R������MS1�DE�����������2�'�
�����?�U��Iz���c���Tx<�4}�&��+�#{�K�A!���(�"��~�kl�R�\�h)i"��J֎8J�\�U��6&����l�^v��SՏ7s��,���htD\�e:Vm�i)�;E�����T̫��GD��<W>ʧ�,�m���l���v�{w�d�v�E�`���2I�A��{_n�[n��#��,2�>'�m>+cRbbm+�=��K@�&���j���v��8n�~	-=d�+ސ�A�����J��޴⚂�fI:�����,��/��.w�='�~���x���/����� ���@� O.���:U�����vf�m��{��:Z�@s#��*��<ZA���ګ��i��eM�k�UEn����Վ+Lؾ�6�l�'�lͦvӼ2F����$d8=�b�L�^	�#IwV��*��SIp��U�0e����;@=j�c:2�DD@DDD@DD*<�~i�J
uU�4� %PDD����w�I\��p}#~�޶�����%�pZ?�����W����"*���Mނ��'�w���DEa����\jk��Hi�ls�K��e|�`�m��۳̦f�U:iY��0�ui���8_T�蠹[��jۮ��'C#{Z�Aq�:*�;m�}����a٩�!�����q���dg'�jΉ�����17.�-�n��jٲҾ�{�>�d��:e��u�c�>e�Y�;�+��7jy-v�ʚ�>c�S��9$��}��a����h`����6J���9�9s��+^�tWCS�5�� 6譔��)(=�1#�׺��]Kfzs��j�VH�d6�k,�	l��ݮXm<006J���H g��Zt)��9g��_���˩��.xg��'ӎ���E;Q[���5�j))�k�H٩��f0��Z1���6ݬ����]�ڦ\	�q��A�!�˰��ǑǙax�&b|pl��Q��ֿ������q"�K�M����K���[OKpR��q���;(��u1�b�����ڎ���k5D��Q��_*�ds�wNO�Z��k.4t�=��W�l�n)�6G���]��s$��&z��x�#��S:j�z��FZ����K����3��!=C#�}�tF���[V�t}oڭ���@�n��Z�	�i�F l�;�E�n��/ڎ�6�ۚsĐRGc^�ȿ gϜ��+,�T�����݌S4���o���Z�����q����i��u�ˤ�U�M�G�_GsR +�YnG�,�߳�[gI=˴�u��s}�h-�L5MnC��p�ω��������m��ݩ٢�6!p�c!��'���)�/MS��ܪ���c��H�9�Lvݦ�J͡�۶~�xF��l��K�7-�Z���p�]����P�iE҈N�K��;�2��^H���zP�{�oIV��f �t4F	`��(���a��A�.7M���d�V�cO-��:w�4����pJg�[ǎ�c��ǎ��ч����Q�����N�G4;7o����T��h�(�C����x,��\ީ�tE��b�DDD@V�ys�G�Uʶ�˟�>���権A�O�D\""��mN��6d�˴��q�LN~q��9��t]�m���w��{����Aw���K��SCP?��9������7f�QQT*gd��|��x��|x,�b'3��F<�S4Le׫�~�Oo� ����O޺��v�d�m���ʨ�ݝQ�_Ǩ�,��]?�&������n����݉x�";L:k��ī.�1򈿹˭� �
ݺښ݁��L�7U.�ƗJ3Ž|�~�+a�=��f�[�l��SU9ա�����%W��[��p����-�׿y4�$Ǚ����l�vb���T�ˍl�ښ�j<p ��O�VSTd��\Jq⩉�T��Zxu�w{G��O��hm�e͊��F�o6��G��U-���l�M���ve��LL6za.����^8���d�U��T�R��PƖ�Z1�Уc�9�ڊ�������kp�h�_��ڬ����-;-\�4��|��׏�8����3ee�I%���sc���0�[�����b�v��{��������#F��FV�t�k�k����b����d��Xu��w�,>~>+v��!�Y��ԥ�h�m.�q�|�cT����x����\:���˯:{f��k�DZ��F_$� AVÐW2�'�
���/Ux<�4}ʂ���揹��h�)&��V�fݤ�pF8�Er.��Si��2�o���e�3�-���w�%���� du�=��:Dٽ�۝���%��;�����?nC	��:�|���S�TTU6;N�:=�����J��j��'� �kv��UY�9n�l���3�~̙���^���rqض�)�I�:}n�1��c��-�˧J�,�u�=��ٹ�9�x���t�`%��*�g۵W��z���<v�1Nk��^9,��Q�#+�tq��[�q[iq,��u5{��<��u ���1�[��W�;R�]�C,��ӶP�e���qȫ���֟��L�[4���� �4��l��ݢf]�k�퀐�o	�ӎ�zAYޛ���v�����sq����عj���!��Q�lSv`o�n���V�**."2\$#�k[���I%e��=~����͸]��V���q �:t�<�Wj�7V�;����pJJݒ�ސ6[}ꚮ
FK%ʼj�S;9s��xy�@�O��&����jY%�"�1�-�'���mE���ީa�SPP5�z1L1>s�\8g�W���mm�ﳷd�[[���6e�>��2q�!\�����bM�vwY���]&ts5'
�[�-�Śۑ��|J�H� 0�	�N� ��{c�8�����}���wv�3(lA���  x�@s�5��]�������OlQ�lak�s	s�G���S4��_��&��m��K��MG��IW��gY.=���hՎ�x<FA��c�w������M�{?q���J$2�u=����A_R��O�s����+����)$��}�iZ��%��k��pZ��ߋ;ѝ��A�4�r�UQP�b�j�q�x�C!�m(�
��vtŢ�"(�" """ �Q�[�O�PS�����(*�" ��ū��K�
����������/�+���.�oޢ��DDQTd�n�%�A�.�Bk�ϑ����" """ """ """ """ """ +i�����*�Z����x+	"�T���n�('����QF_$� AVÐU��":� �J��^#�r��S�1��DDQDD@DDD@DDD@DDD@DDD@DDDAB�ʷ�䠽�ڥ8�х�""~��Z������G�>��z�[G�j����-���F��+�DAEAx2�ja���U�3�1PD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�Mz����nj  09/Qx@#��z��k�*{� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����B��z�s�*�×;S�OܽD@^q�Ӈ}��A19Ǻg1^��M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�	��7x�MT����Bo�M�!SD7� &��� �w�T�M� ɻ�&� ���4AS�n�
������� 0��������/�+���.�o޻���Z������G�>��z��AQDEPDD^g�2���!���}�"�{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �{������������y�	�y� �[�������\oh@E���z���1�G�j����-���F��mū��K�
�������DU�8��ꌞMނ��i��Ī��(������������������������������������������������������������������������������-^��zx�R�����(��" ��ū��K�
����������/�+���.�oޢ��DDQTd�n�%<���"(�f��a�[�mE=mDa��) t�q� ��p��:\��U�K�h$��ؙl��<�����I�w�{<l�U�ʖL>j8#�ѳx<�	�+�Q�,5��+V�Qme��ۙ�P_���v�V9,舝�+���Ѵ[}�{75<7���M<Bf0�J���i��J��-��b��I%\Wq6�v���u�Y ��,�����
e=�g_O�:��q8�2Ɍ�����֩]���;���i������_��0����I*�1{O���6�ݖ��[g`�GӲ� \i]P	�$�P��N9����Ң�Qj�;uUw�'I,�i�<���� mu&���K;�ڶ��PD�o�ܵƃ̕��]N^���Ax��%}�̠�70�q�<����] 콲��]u�8k���bto��c!��k�m�m�콌Wޢ��k�=EEi���ˎ� �W{eru�l��ݣ��k-45�>
!m�Pֵ�k5��9["�fm���j��w������;l�[ڙ��������F�l�Q�MC|���v����|�1�q���r]�mD�$�*Ef�����i�����9�s�����d�۴uL��o6Ʉ��\��R�\�G)M�ʪ�l�ev�״��**IYmC���I�!���NN2�U�z	�K4�ݡ��)i�kf�q3�KN�H�4� ��\^XWm�eL��""Ő��������������������������������������������������
Ҧ�CMP�*ki���-�IZ���'*�kU�>�hk^���٩cdsR�:R���sA�9�t�R��G[W55;�_\����>����c-�5̭�jjq�_Ě|�f�������G�S%,�k����dI�  O��W�F>��z���z*V��N[,F2�g a��yqᕔS1����x���i����)!� LrLָˁ9Ui련�������2p�G�S����w9�=ږa�u����I���{G5y���C~�<�=ͧp}C׌��!����K,T�Um-���*i�t��G9�޷ܐ8�q�?_Z���P�[�t�1�7V�P#8��?�h�7��;��9׾i�2�M̄���wtd�}�����Mq��TFH�D��\����
�D��ٸ�����Ժ�-C^�c�!����S��[)�0��h�$��p'�V�o�I������V�j���3��P'8wD N�E��[���TN�JZC��2O.R#w���2L�R������]Ԣ8��j�<�I�ÐV�{En��tƭ��=�0����7����#�j���N�p�k�p#�@<�}j���R��IK���2�4�ڛ��]�uq'�㞴��������$DX�P�����()�yV����Ac������%�pZ?�����z�?�WT���h��7�Q_H""
(��
2y7z
���Mނ��Q`�9�i/W����]FF8,��#8��SD'3���-�d�5ٞņ���-��^�FOkl��6����ϣ:�mAS0D��1��f�!�P�Uk�r������H[OUP1����ǩf�10��Z2�"{kM��}l�ߨ.��ԉ)'��y}A�C��F�`���p��m%����w�B��c���{N3��o�L�LD�;��+m���Y�$�gT�TN�O�Wc.=]C�Y�D���D[p��(�����������������������������������������������������
Zy�4��+�s�A$�����VSCYM%=Tm�	��ܜd@R���&�8�٦��㛰02��{춷����F^������'�5{1�b�6�x5��SDd��J�j_3��67��;��U�[>�����`tuT�,Hxqwo!ϱR��m�F�+$i�\ؚ>n
��DAB�ʷ�䠧Q�[�O�PUDA��?�WT���h��7�]���,78an�$��������yg��Ant����r���DDQTd�n�%<���"(�+K�smԒT��EK߻�Z�2O�7v�Pam4�M��A-Ռ���h�0mE�S˻�8g�4��G0 �<�z�G�0��STF�)w��'x�l�\��Gyk���u,��@�q��I$��	n���UII��9������3�����TV�h���y�c�I�7����eR��S���φ'5���40�`9���,]�E���~�E3_��F29��N_�u^�����3��	H�Ʀ�d�o�����Y�W�Y"���<�[x�2I �*�i暉�d�j�<���\�� �'��[d�Q�����J��ݰd�d��YT(n-��X$�Zz��c��s�	p**�����%�.1�CH�H�o:��V���8��.!�'�`A4X�n�ds�y�=D������<���W�MP����X�n�rw<�ʶK�*�Sy�	�k���B�ɧ h��s㞱��$ I��"��^b�X� ���8�#�l�q��3�
��]����5Ťp�X*�.�E����O=\R�(u<Bbp{NG����sGP���O,8B�O�ܒ��]�Ms)�i��O��A� �I�y�oKy��h� ���� 6\���3�	b�,=M��6�IKP�`��?O�``�Tn{C���O���Ӈ`���|9�����"���c�i��I$1�+��1Ť��$�J��u��5C k�bln���n��)e�S"���r��Hjg�W����>�$���U��Y�VֶBiX���+�I#N�>��Oi�e�k�;YKY-"��o������לs�˘ಕ�&��r�Th�FD�[��S��g�Vi�L�+�X�|���W>�c�奾�1�d�x�U��x+����Sh��C�?�c���XX��ղ�RV	;��C1�7Q��ed]n�����t��i � �[��ZZkE��[XX%'8�v�""" """ """ """ """ """ """ """ """ ""
U�4� %:�*ߚ���""	�֩�EKK�#�����H��q��j�]jj(��(�"�(����*J2y7z
�DQX�ݷ�ZV��3��s���dh�����X�K�Ւ5����C��� ;$�l���b�6�g���C$�rF �`�aasA�vu�x�ß,���,��(�T*��GR����{ܬ�%�5���*j:h�d���G������x��j�<���U)ct퉢*���<��޵�D�f�}UL�RP7���6�#��}��=~~Y�
�mieu$,��Ւ�#�uF�1Ǘ=k>�bb�%]���Uu���M\HCpA��<{W�[�'������3�#cE1c�X�G�{$���ŚD�f�5���0L��cc�y�scs�� ��;
{=Ln���0>�b�����8࿯�g�.Y���U>�V�USΗ1��49��=X�֩TګnsO-S�F_`kb;̷V�j8�����%�0��]M5-t5d��.c�ha` �������	�U�H�1��@Cp87 gs��*�f�E��V��)����x���1p{�s�ލ-�����5j-Օ�W�f�������ZÞ'���ŞD�f�_l���M���8�L^C� 8i��z�A���R�Ұ�s���#΍_��D�Qf
��[��Kal�=�$�C��8;'����W��*�G{"yqL#pp|�pζ;�䳈�,�U[&��y#�c�&829�$��03���)Z��Cs\'?���n���#�X��-�����h^�4B����aocKo�Ͷ�"�%͑�.2cxc�òx��%�5���I�Ւ�Ee�b�k@ha�� �9<J��gf�:�é_완�����r�{Љy&���Wf�n��S�F�TG4�0�62���s�d6Z��	�}�L��Y��l!��8�y�ؑ/��kvhh]=-)m��Vj�G�9���5��垵mOm���m,5V�,�a�̓KAwC�s�~e�"_K��"���ި�L�Q��51�/8<x�3�[4���]c���\0q��k�����9 �(�T�E1Y�ʈih��Vb���D$o�9�p���O<��d�pHʋ�Q��*�k�s9��`o�;����%��&-��Gu��BV���S�= r眜��7-�����5�mc\d7ܶ.�� �$��م�D�f7f�f���SԳDѴ�7 ��$��������������������������������Z�J�\-`p��08��@�I2>�����" """ """ �Q�[�O�PS�����(*�" �]jju���" �����'�w��(����(/EP����qmED1�K��7�7�;�P���P7* a���^���[�Nkq�dq�#���+�VB�m1�Ǡ˫|�hIvs���U}�I���*��u�x3���q�g�z��M��#���v%տn4�;9�����v+)���N���ѩ��y�Ď��zx��Z{gA�_��thd���Ɨ�5����7: ��]Jۍ�s�qx�ͽ}�hg����ntƚ�Wgw�Jӝ~����z�ܨZ��[J�L���~y��_gZ��Ei��Υש�ӽnu<e��7 u�/��c2
�B��I�|�hi��g<��OQC=<W���}�vj������β5�<���*������=��}�~�hΝY�,��,����_"��fMت��oZw�:��[���;8���F$5􁅍�V���㥮�y���zx�Z{gA�G�iu�{4�[�Lx�ͣ�]h.T%�¶����[�������ޤ3��v���:�Um(��9��4{������As�.ԥı��79|���Ԇzx��Z{gA�_��th{�o[�,8q���/MƈH#5��B�ǧz��p���<��XC=<WH�E��c���veտn4��9���U��I���*��s�x3���q�	b+�z�����#���@�V���N���<��.T&B�[M�=��޷:�2��<��GPC=<WH�=��ѫٴ�t��޷^p�ϓ� z���:��WR��V�g�����δ3��v�ѷ:]JI݁�[�_�����ޤ7*��[K�5�����y�i��ֆzx��Z{eC�G�i��lzw�Χ�������.���\)z.��q��K����=G���Eo��M���Po7�-;��dj�n8�n-���4{�ؗV���N���xg�x!���_"�
3&�Uә5�=;��[F�7�:�m(7z��K�Cdվn4���y���zx�Z� v�]K�Sۍ�s��s��ϳ�s�p����J�������Ԇzx��Z:�@�K�i@�+y3����_gZ{gA�O��ujc1�nu<e��7C����]����߻���]��V���Ӈ;9�z����n�]8�X�N��F��g�@��zx�QX�ql�o=��������ƌ�՜����[�ԛ�߲��oZw�:��[��q�<qB+�z�����#��A�ɫ|�hq��g<��YR�΃^�f������[�Lsy��Hg�������
�R���[�?�>N���G\�Hum+q��ehƏ��=}�hg������9������	����s���ޤ�΃F�f�����޷Xp�ϓOz���O�+Sq��e6����nu8jkq�dq�(��Ǽ
=��˫~�hIvs����3��z���ԛ�߲��o7:w�:�N;q�𨛽�G�7
=��K�~�h'HvsȞ���zc�|��\h��1YM�=��޷:�59��08�����h���]X�[��K�y�q�_R��Ehntqi���������?����F���5������:��_�uv�!��+�V��B\ki�@{��n0�~y��_gZ{gA�G�iu�c4�[�Oh�̎ u���+�X鯶�Y��F�3�Ϩ`���8 �J��&�������V��q��}Q�e�b���v��q�jދj�ҲC5����^֏e0e��Ϭ%�9�+�4|Y�X��5��ݳ�\��{Ed���-�y���0����y�?����5v�MS,p���j|�h�4�>r߷�޶� �,�֋�ee5V��
j�f"�)������Z�G�qzX�5L1=�����ΐO<u��њ.��X�f�橦'�����?�[��~i�������K?5�v�c%M5�T���$n�g5���� q�y/��c�V�L���[4NkXƖjs�A��8u�H��yWi�����7�˹�}g��o� ��=������ �g�e&��J�iQ1�TR����֐�r�1� g9�د"ث|��G]P6ٷU�pi� ���{�-#)�8�<��ջ>>� ���}g��o� ��=������ �g�p�[`���U�}�[{Y+����	 ���]���������l/���ak�K@���N|����yc���p���b�����Y� z�� ĳ�W���B%��9�<�������� k���Q��_Q���D�NC��0���K�t'�1޵'��*��w'b�:��~f�b4��ߑkw*U�4� %:�*ߚ���""	�֦�Z��""
(��
2y7z
���Mނ��Q2;P�y�W��=��L����G�hotx �#�2;W��	�����܎���^hotx&��G�r;S#�y������=��L����G�hotx �#�2;W��	�����E۽�;+w����T$�M��s�1��~ծ~������X���[I���,� 2EΖ�h�����ʛV�]Wh��g[�2?�����G��o���$E�7K����������G��o���ϰ[tv������I��y�}�<q�zϫ���ܲ��?X�DD^�O�=�h���쏳�TJ!��LgCK��x�~�]���� �tK�[�
�r<����|����-�_M�M�j�����}�'�����G�)�Qw��#� ͑q|����b���t�ҋ�t����Eߺ���W6D�N'�����]_����e�3<,�Fs�P���Gj��[�����H���'����:f��LS]QS/r;S#�y������
����L����G�hotx �#�2;W��	�����܎���^hotx&��G�r;S#�y������=��L����G�hotx �#�2;W��	�����܎���^hotx&��G�r;S#�y������=��L����G�hotx �#�2;W��	�����܎���^hotx&��G�r;S#�y������=��L����G�hotx �#�2;W��	�����܎���^hotx&��G�wӡ� �J�י�\����ӛ@�*L ?�3��\�>��r��d��t����K7���X��;gf��K>�'s~��폛����N�4Ms8��q{|�5��p�L�H��A ��N��.�9���� ��dnt���WH&|x��?|�@�C�2��^X������X��Wow{�ݭ�u$�Zb��)f|�˾.s��h�l���m{'��I�o���Le�pǱ� 8�<���e��4�u�������>"Keqi�����Z��b+-T�m��'L�i�5��D��	$彜�IL����kߝ� �|����[����иU�������� �v8g y���y#�t�[��}X�!"r[���Gz���T
�#6��b���U=��{�65�A�X�O�yհ�
�)-�T��d�R�ks���1����L��a�8,rV4n�� �}ܢ��c�Ji驌�3�Nu���G=Xdb�9��pPVK�mD���J#��{��g��ԻM��q�����Fjk���cK�Da����8ᣉ��X*������ڪ�E�u+�ü�8.��:�.|9'9�#��7�_����_.f�5%%�ii��F^dqs�I'� �R�}�$[�k�U/sud`q�~�i���V�nr�%eK#��0s�I.q�u�R��r6>K�����ͭ��",��G�o�?�AN�ʷ�䠪��qu��E֦�����"*���Mނ��'�w���DEDDD@DDD@DDD@DD3�O������$\�tn�>6�z�?̑s�ɣ��~���""��N����Շ�����?�ۗ��5�e�rW�������
��w�W�����*~��q_8.�l��y9���}DD\7��{/�j��~ �k�� �>��&��z0��?���DDY5�������������������������������t��J�י�\����ӧ�*O^g�r.�}���[��f�ş���oYgް?�?,޲ϽI�߳zj;c�����g=}� �jea�߭vs�����fW�aD@DDD@DD*<�~i�J
uU�4� %PDD��MB.�5DDQTd�n�%<���"(�" """ """ """ �:|m���"�+�t���Y�d���MxS��N�N �w@� �n^�?\�t�� ^ܽX~ ���.Ò�o����T���p_G�>S�N����uf�}��Ύ'��""�0��>���V�T���X͗��i�H� Y5�Sч�q�-]�""ɨDDD@DDD@DDD@DDD@DDD@DDD@DDL�����9�N��=y��ȸZ�G�M��ڋ,T���l��g�c��\��?t��E���n�����y[a�1����š̑t��������%F��{�K��(Ɖ�w6�;<�<�������$�9����K7���[w�~��Ƌ�ߒ�l�E�U���Z�G�O+dsZ�g&�l݁ɛU8��4M�c��߿Z�篿�-B̬5����z�� ��,����"(��������(TyV�����<�~i�J
���'Z��]jj(��(�"�(����*J2y7z
�DQ^z�~��]�*H�9wtx�]�*H�9wtx�]�*H�9wtx�]�*H�9wtx�]�*H�9wtx�]�*��+䮼5�s�[Z�NCF�#��2I��ȩvUӖm��G.�˻��Ib�}9��[I���,� 2EΗӗݒ�_��Uv�������ن�N0�̕��l���Ŀ�[�Ĉ�<��ȸ���bS1i�o��/����ڹb�i�8^�dJpCI�����ʺ&k�Z	��/���!��h��S��e�zϷ�,� f�-��q������ �d�;-f�O$֚?c�#t8�^����*ĉ�9{#c�����1h��2W�`T�����+�%�}��?D︯�W�o������{��".�����.��Zp��H�� �'�wG��l�ūO�E�ɮ➌>k��j�r���L��<T�dԎ]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� �]�)�wG�� ��˽�h�#�N��VC.�ct�u�֝�D� ��Ѿ�ߤ#�wG�e��⤊6#�wG�e��⤈#�wG���n*=��L����T�8�t�8���rO��f?4JYwtx�]�*H�&�O��9����� �����P�KEuL�Ip����\�N@�*����g=}� �ja�9�� �0A�Tr�����WAwf�T۩j��.1�}�^�g!�8q�*��oli`���L�i��� 疖Lɋ8}ց��+�ų�hi姊�B�%��6���c�F8��b��M<��9 ��F�Z[���]E_]=��i���n�F�d(�����=Ǉ^z���� �ى��*����t�x�t]4 ���'���	�]��m����CLkZ0��M�1ﱞ\8�v��Tح�lmP�ᰴ	y��y�}��X}�sin�6<����f��11�ks�'����_YIa��G4��Rk�T漜1��$g��7�Z���-�CP�R�($�����#xp<O��m��z��)[<�YM�a�r�fece�^(���@�ziCK˚��'����m���n��B�ԐR��j,�0�On�]"Ƃ""�TyV�����<�~i�J
���'Z��]jj(��(�"�(����*J2y7z
�DQDD@DDD@T+�)�)�QY+a����2pu�t��:��G��ƺ��2ݳaF.58s�f!{�-�����)�-�����+�����\��w�Ow�ڭ�Oe����.05��5�$�t��MϋH��C�[a��O�WD����e_ `�7����T[��õI�dQ\�t�pkZ	�O �+�{��w�����!rp1g&e���F�U1D�߈��{�Z^��kZ�\�� d����F!�zB�"[[����p�O�;�+��}��?D︯�l�S��G��pޘDDA�ūO�E�ɬf��Z���_�,��)�������d�""" """ """ """ """ """ ����MҲ(��ll��h���?eZ��6��������{�u_�~"��*)��W�mT� ���-�]��i_�8�'ka����-Ͻ�q�U?H�S������թ�e�<�h�ʾ2�?H�S�������ں;��]�:�[p��U.�[�@�$p ���_D����� ��kּH���!���EQ]S1n���܈�K�����0��ֻ9��� KP�+~�k���� ��2�""����������G�o�?�AN�ʷ�䠪��qu��E֦�����"*���Mނ��'�w���DEDDD@DD�t��:��G���T&�9�,�����\2Ա����7l���-8���'���ў��� �St��=��� ���鿒����zO�:?o��|拼�m�n��RS�ڶ��x�'�i+'�m�7�M����g��~P�Lۛ���/��l?�-޳��l�}\�:p�r���\�N7t�����MQM�""��D@DD. ��'}�|ྏ�|��������|���{��".����=���i�H� Y5���V�T��i��K�Z⭞���ak��<~j�h��>e��S�Uu�6����ȹo醇�UO��O���d����[c�?��"忦�U?�5?L4?���jd�������gRE�v��K����x�P��x p��K���VӅ�S5aM�E�]�A����h�C3����
���I����8�q�ݽ<���TQ��}��mG����uj���8Ƨ��W\һ�zZ��kh'n�Y'��p8���>��t� ���a�{d�Fז?&���t$\���I����vV���䫆��Jb��	$ s���Ţ��K����F9�)�{��D[1�w��U��'�*�^�� ]W�ğ��%ˇ�q:R""0�}��W� /��_:/��&� ����_�^���w�O��_�?8mȈ�=�����~�k���� ��2���ֻ9��� KP��� �I\[K�h� �j���l�a5岲����68gkMKtn� ��NN[�x�J��dڊi�($��He���n�;C�����v����QjL�ji����Y�*w��D�09���4���ٷ���$��v2���6� v�j[�� �	20�烼�B��Qb�Wcr5�MNi������`!��p�!è,,�qMLQUI$v�	���L �z�����H^r,5����]]U��)����<9���Av��E
�*ߚ���G�o�?�AT��SP��MEDU<��IFO&�AAx��+�4y���k���"���"�k���"���"�k���"���"�k���"���"�k���"M����|1����YM���V6������ O
�,i�ۍҎ��B:k�������*H�jG@�w��;]�EIG@�w��;]�EIG@�w��;]�EIZ�=�S��Iߴ{
��}p�O�;�+���7���9���}DD\7��;.�vj������p)_,V��#)����#Zd{p��:�M���i�H� Y5�Ѻ3�h��릨�^~mG�q������ �?G)��� �/��܋,����-����CD�t}��>kf�
���%+���^��6S�W� b_�,��2��O��Yf���{�4D�;�CZ�l.�[ka���n�":�����]�����"��L�{�����æ"=�g�1����r�,��|k�};�t����͗���!-��4���~�D��b�k�tA�j�����/�tܻ���@�w��;]�EId�(���"�k���"���"�k���"���"�k���"���"�k���"���"�k���"���"�k���"���k�bO�U��������?VK���t�DD`/�z'h;j>�� �ȟ�W����}��W� /��Z�w;�'�f����6����S@�w�$Z����S@�w�$A���S@�w�$A�����c?2O� ��d�pKUm������,Nc&hɍ�=��߿Z�篿�-B̪9�[%�4��XŦ�SQI!lu8�������p=D��,��r�O+����w�@�s�5Os�Ak��y'�� g<��1���YOH�;&�u�J�j�){��Ct���:�x+o�%�jKLu4"[%#i�\Ǽ��$���#G�05{�ǂ�h�Xk�{mҊ���FQ{"�X%�`��lQ �i�� � q+]��k�}���礎���/���s��I�F�i �<�s���Q���+�W����eMDq@ة�t�kNkNIs�c�k>��""
U�4� %:�*ߚ���""	�֦�Z��""
(��
2y7z
���Mނ��Qb�� �o�����"�g]Y����a`""" ""
�T���p_G�>S�N����pv���>Ntq=�Q�DA���Z���_�,��l�ūO�E�ɮ➌>k��j�MLu��2��O��Y���_Z�� =�"��k��S�""�����N�Y����t�w,*���K�/���>B",[�׺ ��S�n�\�u�>-T�ۿ#e􎛗}R{a�""�$DDD@DDD@DDDA�����I���W���U��'�*�r��\N�����_D����� ��k�΋辉����� ��׭x�����W���r"-`""" �_�Z�篿�-B̬5����z�� ��,ʠ��" """ ""
U�4� %:�*ߚ���""	�֦�Z��""
(��
2y7z
���Mނ��Q�$ri>�/5����GQ�;���Q�;���Iu���5����GQ�;���Q�;���Iu���5����GQ�;���Q�;���Iu���5����GQ�;���Q�;���Iu���5����GQ�;���Q�;���H�Ad`�Okh詿�o�u���5���K]b��t����� ���鿒{[C� EM��%s���~i���~ihe�W�V���� �St��=��� ���鿒��{��?4�{��?4��|e��1�cCZр �z����~i���~j�Iu���5������2��O��Y����_p�T��β:�q�g��k��Sؒ(�=�}��j=�}�������N�Y���WN����z�R�F��h쏐���u�>-T�ۿ!]s�"F���� kw,w�/�tܻ���u���5���vO�(�=�}��j=�}��	"���w�����w����(�=�}��j=�}��	"���w�����w����(�=�}��j=�}��	"���w�����w����V����$�EY+���� X��d�p��'JDDF�/�o�j� �� 5��E�OD�#`-Xc���1� ���s���j� Y��pEG���MG���Z�$Q�{��?4�{��?4EG���MG���A��~���_�Z��XK�&볙i�������ҡ��ں�&2�#�#!�uc��(�~�Uޅ=����z��ૅ����r�fN�N� 4�X<nU]ֆ�M¶,��2�;�s�@s�H$���9�
�s:B.IG|��Z�2UU��
�ZaJ�"{z��Β\^�j�Gf��Қ�g%��Y#���&�s�.=��5��&sp�GC3��ֶ=��Y~���'������W��&8��Ĺ�$�$�Z=��r���S�պ����,O�ϊ0����r�Gx�(fu�Z��	h���km]UU$pS�0���Ǽ88����g'[R,���Q�[�O�PS�����(*�" �]jju���" �����'�w��(����(/Eڝ��J-��R�ܝ��m��t�8�2Z����m�8^�r_�V�8��].��aa�8uLk�6dH�U��������"mW�gs�V��vX��>{�~�_m��M�����c� j~�6��������SD�=�?r������_{٩j��y�R�ËZ�rӌ ;Jܗ=�?�|��� ��З��o��M{5U7���sD@DDD@DDD@DDD@DDD@DD��e����޲+a���S�{�EY�ׅЧ�DEm>5�>��
�[i����XU��җ�6_CGd|�DX���tA�j�����
��|Z���~.F��7.����c�ʩ�vf�UJ���ӽ�~��8���6�������������תI�J��wq�E˸��X��SuL�l�"mW�gs�S�_�����Z�-�c���ݣ�*��l�"mW�gs�S�_�����Z�&X�y����|e��;����9%��5N�����*���n�!�.q �OR+�^5��i�dȯP�w��U��'�*�^�� ]W�ğ��%ˇ�q:R""0�}��W� /��_:/��&� ����_�^���w�O��_�?8mȈ�=�����~�k���� ��/,l�'�+��\�����ֻ9��� KP�*�E�g-v�L�8$��1�,�J���֌�4`�P��{Ee%%4Ԯ�RG��G4�!� ����8i$q4�%�����ve�؀U0�0�j��΂����2�C�(a���������nK���[rs�`g�0�ȅ�����e<4�GN�)��S��{̸#[��8���T#�{;*j�AΩk�##�����-�פ���!f>�f��C$v���+�=�J�^� .y.8  3� ��""
U�4� %:�*ߚ���""	�֦�Z��""
(��
2y7z
���Mނ��Q|ö�/^�/�+���6��;��� q����CQP�X+��q#>�lØ���r�ω��La�}\�A�m������Q����\�?�<F1+����vh��S��ToÖ�������� V���ڟ�m�� շ� z�����+�n��rݺ��?�?�t%�tm���7`����]3�(18�`���¶���e�6
*��覨����r�D@DDD@DDD@DDD@DDD@DDD@DDm>5�>��
�[i����XU��җ�6_CGd|�DX���tA�j�����
��|Z���~.F��7.����9�_o^�'�+�%���|M�z������s����(}-�QǞִ����j�c�'g.�
Q��y�{�H�4�ŵR��>��:`�G��u���^�׹#g��6��ŋŗ� �#���� �S���,G�H�[�dr��������'��G��\���tj~�L4�E�H:�ds�����H����\��18���듾~�ѱ�dv��5)���������cH�[r�}�a��S�ں��`W5�z�W��|=�h�<(�ZD[�kt�u�֝�D� ��O�Z=i��J�
�]���@��6������~�k���� ��2���ֻ9��� KP�*�"(��������(TyV�����<�~i�J
���'Z��]jj(��(�"�(����*J2y7z
�DQD^��=�'������ �z�?���{��)�>�x�� V��9��5��Ю�:Oy�bi=�}��$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A$Q�{��I�;�A�v��]��ܰ�3���N�]=})}#e�4vG�DE�x��D�}m߁����������?����b�l���r�Ol3�u�6��~�b_M��O�:���$�%|Ȼ�-ώ�C�h�����<���>���,?0}˔t�����G�r괭>Ƈ�;����z_��q'�0��ܺͫѾ��>�Od�TD]k���z��_�����#�gh*�������]kI�;�]����#�}n{!$Q�{��I�;�\�N��|:��N� "U�T&�l�@����y��#��7�qUt���X���?d�GI�;�M'��FI"���wؚOy�b	"���wؚOy�b	"���wؚOy�bE����z�� ��,��lq��85��q8 ����]vs�����Vu��
�Z�#}Y����\�'H>l�Q��lls��4u���-u<�{��,in��E��M�[ee$u>ʑѿ_S��A��07St�P�\��`�P�[�)(.RR9jT��0=�d`�,h~��J�Q[.V����%��X����������j�=]j0�-��5�WEI��#�ָD��7SZdƐH�99
�{_c�L[\b�͗D����2[�`�-�;B��n�Mj~�>�gK-m=@��M��Ǩ�uc-���Y�g�4:�x����<e�o�%���s\sˋz�yu[UҒ��QH��c��F��� � A���Vҋ?�f��z��{�{c"?��iv��	��XQO_s����wt�h����D�[�����pZ}�g��Vxh�eM	���=�d���k]׫P�g��]*�y��o��s� H�!|OnFA-xr8�Y�l�u7��JI� �)�d���;��g��al�""*�G�o�?�AN�ʷ�䠪��qu��E֦�����"*���Mނ��'�w���DEDDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDm>5�>��
��EÝ��{�&�<�G7�-��|ҋ�dS�� ���'��� ��+�tA�j������[0�~n��p��Y��.k%���0{u�6��~�b_\��S^W��K�����p��#"��b��5\}J��γ�}���'�1�� g����/�Q9�c?���w*t����r��?_����n]m��+��W���-�os�_K"�y��;��O�w� �Q},���R���r>��0����m]qrp���r�M�k�iŵ��D[1a�߭vs�����fV���g=}� �jePDE
�*ߚ���G�o�?�AT*�f���ZXw�̏8�@��h�E��V�K�K#�Cݜ�t���.�gm����pC��\��'����nH=a��
```

## docs/krx-search-preview.jpg

```
���� JFIF      �� C 


		
%# , #&')*)-0-(0%()(�� C



(((((((((((((((((((((((((((((((((((((((((((((((((((�� ��" ��             �� O  	  !1QA��"3RTaqr�246st�����#�Bb$�578Ucu�C��������           �� 0      !Qa�"1�Aq2�����4B����   ? �> *                                                                                      'Y���[me�k\��ǝ��\��z�^��Z�
�i�X&���ʉ�UT�xOt�qTGuke���rF��}�WJ���E\�Z� a    q=<�W�z�6(\�uS��W�q�Eݏ^��7�(i��q� �C� ���-�\_�����w��� ���?0� �0� �?�h�[���S��ʾ:,m�螥j"v�g��8� 澟)�����ߢAR�p���i먤I)�b=�N_�����11p �                                             ���*�UWxff���S��Ml�Nc)������S��5��9��3 kg���fb�c+H        >"+��o���eJvu��}�O�tx� ��_���������GGgV�/�� �V��oE�  U�IEo��sU͂'J��z�������x�R�K#ѫ
1Uz��}�I�?�W�K��K����_�  a _�:+�H�e4�j�R���%��u����K�q?L�����ۤΆ�K5L�j�[ʈ�Wq^$�1�{cG9^����)��m�\ht>���n�mmM�f���#ڈ���ƙ\q���i��q&g)�?��э���>(U�����52�dN.r��!����e`�V�Bč%��t�N/T��.Ht;�M��G<ut����U�>����J�%TT{�<���S��@ccӋ�#j5����L"x�Lf�ۍ�ǅ������ ogn�#��mk�US#[�M������t��ڪ�WRJf,�=z�?U<?�o����?F���D�,��Tr�>7ȍ�ɓ���R���� ���y:o����U�>�A��V�5V�c֪��Rp�=��
�#v�i��-7�O�c(ɷg^��TS������mb[k���NؤkW�ȟ9ם� ���4K����Y��.��fX���G5�H�v:�s�t��g.��wK��v���8��{sc�ڒ�jX��9s�w.�.P�R��6����w|�az=��T�~a�i��4�����_+��*${i�Y��H��\o�c��c��������F*e��%�J�����'�J���8�]�4E{�Vީ��4�Y|��ղ���AOT�j�-C�g���5}ʆ߲���ԻUՏm+Y���+�O��-g��-���B�w��c޿+6�WQ����+�����A�m�i<5�p\��|}��5W9�UTOa�V�{������_��/6���)).4S�ŝ�1N�=�㖢�U��4��N+4[���������5
�ELe*���D��x
zn�ux�;��IUT�(��U��EO�ʢ�����D#�������J��4�&�N�d��U�2e8�e����$c��}��� ��SS}����xE�Os�ٴ���Mui+�5`V� �˹��K�.��7Z�6��rT�C#�&�D��U�6>eT]�j9USq��V� x�߮>|&SG4�î٩ݨ�DDv[�)�1������� ��M$�,��4l�D�׮��c9e����NSQk��e��k��6\�TTn��%D�]��T�z7�F5�c�(�QS��|hE��]�H������-RŪٕ�4F��w��N�46�(�螋iՊ�]4Ԕ2j��`k��r�z����$�z~��� g�����z�h�:��3i�Z��ഏMn�� �=�X>L��*:<�>7��=�oFn~�n�i�u4�u��x�9�]�UD�p޹��s�-�$�=��KApI*k�g��"�7������0�2�=�')�fc���ZK��;�h$�Q���6��5$_cs���� �u��%�H�UV�V�Y:��j�TO^3�����x�o�n 4        ���1�z�L��R?�m���$�ΐ�9�*����ǵP�W�ϡ�kU��:�)���h�)j�{�d�kG-2Gp��u��_V�Xų������eMD�9%|LI��b�xd�K���ɨYI#�J�H����Eb"�s�<5�g��zبꪢ����%<J�nW	�	RRVMp�5Sm�j��Z�E��W
�*�B�0����7"er}0�  P��im�p�=Z��6Qn��Yu�F��2�nL�'3�R�%d�X�[=l��靚���7�&����j���4ΞVL���j�����j�ҊUS����|��ƳR����C�\f�Y�wmQ-U2�;X��mS��*'D��
���\&���ٙ5u�^�H���߱k����/����9:�>'�� D�YbJ��[�;t~�Y�ζq�����^�xd�&������M2&�Sh�D�V��4�ME�4Z]a���Gr��9��n�U\c�(���-Si�������1r��1ÙR�����l_��-e���g2j����7�q�vw�Ϩ�D$̽� �H���f��)�K�^�퍎{�jeW�:].�UԶ����EVƈ�WaWNHn摰���V5\�L��x�H�/�g_*�e�����:(�MY�OEN���O�EonL���1��%�n�ڝm���O��9a����r5p����,Ť���M��V���cTn5\�UTr.8��$��{b���MM]H����4��I�Eb��[��i>�:�����U,�U��fUc�x�'�:�s?UĬfkx�������G�߭֊�XnU�Z�mGȸo��+�ą�H�W+��m�q��ضʱ9�L�u�����[��L�Q̎Wӻk�;�設rr�_A�7�UEwX���i�=i�ˣo����:�F11r�8���������C�+)�:2ZDj˯�k&Sz�Q`�S�-P�(�D�\��w*�W�����Y_-Em%ƾy�U�ץc��D���W庽Jz�H����oɏW��4��x||��F� ���X�j�LFX�j�L=��� +�      J-� IPyo�@�x�4��tzJ�zmMڶ��TȜ��N�eIr*�""��s�T4�siՊ��Zʋ��T5w:JyS�NOV���\k�I����*���QU�N�Yg���;YcW5Z�׌�r���m�P�mT�=�j⥥�x���)�sQuUZܪ��p��I1DM�TyV��@�G�o���   5�G�j��Ib���p}�S�iի��%��pZ?�����H��  0�
�F��l�"L�-<�jsUj��I��~.r+\�r**.��鋟K4=���Gl�ӂ5���?CN��y��q��GKQ2�I���wZ���;�i'��� 5� �_3�w���W��q�.:�K]��}��B���)$���"&8o�?���o���Ƒ-TϛQ:�˜g����cI=&���� �ml��[}��)ڹttʮWz���.�1�I�O��N���/���x����5Z�O$��[w&{QOyUO]4��1�X%j��ze�ܨ�|�����*zh�5�575r!��e:�e�_O�������xd��=%�Y)�\���sSب�\rEϴ�>|Z�.�J���+̨��ڎ(����UU�� וU�h�tB'��3��hoUvz�:�jMe�=�E¢�'_�v_�-�)5mmmT���c]�5-� B�j&W�Z��O}-=;�� �'�r�1��w�L�s���IE�����!$qh�\-6��*�D֫ڙ∺ɔ�߿jn���%-�G4~�Ov��D�#d��gʫ�;�:��g�V��^�3N>H׸�����Ɉv��7|��M��i/wվX��6+�����ʼ�����{��:�$e1쳌O��x:�cK�W:��mƢ�z���W:cU�h��޸M�]E;g�h��v����UGG,�i��̲E\�2�M�U�*.��n�DU8����V�U[��E[b��s=4-Un�:�swo����E�h��E+lk�#�n+'�|y��ێ�p����j��i�����ȋB�.������Z�Y�3������=Zx,��L�7�}b�SZ lQ�Z��Mm��n>7#��2�1��� ,�xG�ҫM�Աբ���,�W��k&7�xq=�ffb#�U��(        a����CSe���\�E��0�=+$ij�=Q�W*�zy�)���Zz}m���.�aK     V����jij#ג��H�*���2Z T�[�n�n���%�ʊ�UTދ��kitN�MUD4��'k1�#��z��X��d�� E  
Kj���E��Y3���ns�8�] cHcI�T��Un��U5�9g��(���Ș�185��&   ��1L&uL�J�N��2�H���9�L�ɅBz��F��R3MC�z��#-�E���+�v���x��tF�C[]5�DJ�Ǭ�v��jzU�Uy)uK�'	�Lm٬��-�wB�3ft9�UUEnx����-���52E"�U\�U�����^J5W����3:�tUQQx.⭮�Kj����=�<y�nUq�����sUy(�^JF��t�e�毴ƍU�355So} �     P�o�H�7���� �y�#�F�UCW[�WB����L�ejr�j��z�(n�~q�>�A�?����".���hu��Z����ˊ�S�V��F�E]�OR"���?����!g���Trm��[���r��T�  �H��]��/�S���.�o�w�#��w����NG��>ѿ��@ P                                                                                     ��?�W�K��K�����H��]��/�S���.�o�E~� � T��5��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i05��/h�w�����w���Y�b�� CY�b��gy��Lgy��5��/i0Z��[�@  ��?�W�K��K�����H��]��/�S���.�o�E~� � T                                                                                      k�������8-���F��z�?�W�K��K����_�  a   ���%+�d�c��
ՍS,gN�-�\)���L�]h�2&7�Z����|��V^�,+S"�Y�n�wȚ�MW�Q�ު���n�7֬s1��V�_R�MT£Q�\������Hn��[��cܴ�k+�Ur����"�A%T,s�$��5j;	���5Vd��+([F]��H݅k��f5W�)[,sZ���������ٻe�p�-�j��7�j-.i��J�1L�P���ED®s��l�W
{m3��s�Z�Uk�DL��yi�W
7:hR���vP��9vU�͖3�T��ԓMD�R�{Ú�5G9�r&s�U������w���+6펛�IQcM���#Ey������m�U���aU��Sr�{F����ʙ��l��ƵQ2�G*�r���8Nj]]u�*��x��&���s5SUU?��;�Y��H�����(�dOz6G���^�Lg�B��Tk�r���"�7;��5�'�J�T�9�姅���0��F���o�z�R]*�|�#��mE��Ekގ]Ȫ��T໸���o~Q��{�v+Z�E�� ��q�9�a��Q����{�Q�+X����\�Â�u�̕�5t�
㉰9Q_"c�~<L���4���<O���GT7R}H+^��j=��^y-E�-���tN��,�6��ZO��L�ewp!M�6������6e�Ѫ&��� @�T��z�����պF$4�#�}V���ȼx.ke\�VӤN�4�7M�'����s��aj����6�o|텓9�9��j*aUڸ\����������\�F/5L�ޙEC;�]�*�bW#�l��Us�Up��u��~�\#��Tc��٦�ʮT�{�;�J��X�����f���賱l��ȩ���e��K*D�����X����nr����yJ�l���$��k����t2J�*5��ٳ�oʻ����M���#V)噱jƍEUv2ǧ�]l�c)��f!"e��<N�|z,�j9�䋜~�*g��=yu�s����DSG�ַ��#���,lI�c�O5�D�M�k+ց��IJv��F�v�#w�y&3�J0]�'�8�s�s�|��W��ro���0�_�*�墅��D*ԑ���xd׺��[�,4�Q���h�f��r����]��k�I%L��S#��:��s����e3�<z��t���=otJ�D{�\�Tk�>v���
f��K0J��7Z6���*c9�o�<��:�k�TTT�:��:�YX�����5�j�7o7�o���E%,���ln�6�an+�*.z�9������zY�6�e�j�F��O9p���}��E���"�����W5�5USrg�k��}�e}5��Jy)��67WY��o�^�����MS%�j)_MLZ�čT������זTYr�O���:~ek6��L�7�⻮�iO�+��s��c���;�M���˦VT����TH�"����N��/�>���[�K;�e�٣s#¹��+�x�T�-���h�6��5�HگW'Z�8B3�(a�)P��X�5�Ew��˗2����ij���S%,����Z8���_*ȉ�xap��B���������L�e+�5]$��c��DMT�EB\��**"���a�I[IT#RdcQ��5�����+� �                                                  ��ի��%��pZ?�����N��V�� t��)�h���7�"�H  � *   �\��F�u�R\o��Z��|ST��o^�U>[��F�u�R[��ʪ�W�*�9�^;�yje.!���Ә��.��'����'_r����Ǭɧt{C$��D���5�KO�ENx܉��
�������+�f�i}Z��*e����j�X�TN8��(���t>-�$�O|�p�R��n�n�?�]3t����A�W	��hV�[4�[�(c��Ͱ�o��˿zaWv�DL��=`5ZC|��X�n�*�CI��F��TNY^&=�
m)��;�r�OR��l���Õ7�W���/�܃��>�Z�n�g�\zGH�˲�ٳY5���;��A<�(d�S:�Wc؄��_�2�x0�h���Up���iK���l�\�� q�K18�JD�� (                                                                   _�V�� t��)�h���7�;֑�Z���_ا��\h�Ԋ�   �  ��}�k��Z륒���\k��\�	�g!�{5�o��h�4��=:����¢��.��'��� 	�
��'���z��]�J�V��r�=i�.=g��O��hE�����]��%����5w�2�ܪ�p��5OÞu�鏗��� �-W��� �҅��ۣ���m4|T�j-ES|Ef��Uܛ����~�� �_�o� �M����Z�[���2�8���IQ���ދ��)"j1����j����xM?��ү
�6�5��*��,���Z8��Wn��3ۃ�-�Q�M�J�T�*�Ul�D����&�z���G��6���*d��!i���c~]��g=f��K�[���WcT��)�5��G"=p���G\bq��#h���)���g��+�j��v�,���]�K^��=`[TH���\�k*z���>�Y�o�G��o56i����N��DN)�S���:;`��%֢��CHe�9ΎT���DU�S���Ú�u�.�ᯔ�-����N��{�T��Fŋ[�[�� ��G��ڶ�G���5U��w�9g����֏�r���b�t6��g���3�Z�V-ʇI���}���e��-�;Y�W�~�sQ8̱�oS�xb�y��N(�4R\i4]�S<�of��Uw��������u���GW޴WO��ԯ�M{lJ��9�#������q�	��Z+�֪����W��ܞ3��8�~�p�����r�x"����5d��� ��WU6Xo���� ������ 
ȩ��DUʥ���� M�i8��b}4�su$Bϔ_��eI:��F��;	8߯������ �                                                                    �#��w����NG��>ѿ�޴�������8-���F��W�  @@ zz:ji皞���r:g����Q0����̰ ��3ô�L�c�%�{�]5��Q>o(l�4h��K�)��F˥-DrU����w�����N���S��Z<.���O4sgsp���>hރ��-zI���)X����7�ñ�sS��|ɻ�yqT���U9���@�%h��F��u�*j�L�ʈ��W[�N�c�51n+Cc�o�b��Ѻh�u���1����'N���Xbn��O=�Y��L1S>.7'Q���#ULY)fc~s����C(31mF�k�#E.�#��W���V�f#�Ej���=h�J �YNSr�� 2�                                                                   ~��Z���_ا��\h���ZG�j��Ib���p}�R+�  � �n��m:U��9ڈ�tʯ,s�`m��i!�WȌ��dmlN{ܭU��U�*�U��UD/���s�,�0���5�:���u�M2�.�[�,|���w��F�e$�US}K�~�Q	2�P��璑�ȯJ��ѹv�<���ks�p�UTUD�&�q�3���hi��ȩ�I��ii�7H��UUTL�^E9���Jx$���ӯ�aDb���v�߄^����z��[҆
����i�Z7�uu�܋����JF�6�5�ԣ�{vh����P�V�wQ�`�dRW��@�sj���UGj�ވ���R�o��������?"�͞S�U�0�����q���D�o��{ە=%�K��_L���beU���=K �۽��7.#��;�Z�����[��Q�l���f�d�5DTj&�k�W��_��ѝi��H�F��e�{��'�ռUQ:�1DM�ͿHm�	��${�����w'*�	��e���U5?�Ԓ¨�$T�ȍUL�e�T�ye4��j6TB�&�z2�u�D�ٮ�U�Mʹzu�����3�R��T�V�U�eZ6DD�"�?W�7�����/OҎj�l��eUn��VaQp���EM�)�6*��WeQ�z*�8�4ֹ)`��V�����@ף�����Ys��R��R��m����dbH�CP�*���&�'��%-�3��H��[N�c��n�e��L��R�N��6B�j�]�}����h%�Jz�Ud��A"�u��r�����YG@�V5�ɵ�FM-:J�j���W&�j���o)nt5S�i��mU~�^��N+�[��Ut���gUW/ݹ�D���z-5<��U��H'sv���#SY7j�0�����"��d��OGU����P�Jvƈ�UD̎{�8UL"~"����zki撥�I��gjJ�����_�r��N��A2�H�Meb��Z絈����4�zN��Sвkz���$q���6��r�*�yݓOr�:�����Ju�(;`z3-�*���g
X�."{$���Kv�����UD���9���x'�$ԲԶTl1H�����j���.t�n�T��*Vt�.��O�,{��� ӟ��m�0X�:�RP��S26'W�#���h��BTR���Wk|�2(� t�\5��˗��uw:7#j�b�ʚ�{����)�t��KS##u5d�V��s|f���P�_ֲ�>L���J�bj�'�r�sr�p�\IK���V,ɫ;j]'�6j���� �L+���S:I&�<i+���j�Dr"�z�k�������`u�(�Uމ�"*�RW�+nUTTl�UՍ�L����UL�%��I�{i��y&eETq:6G��j�����Jʉᥝ���ȍލ�ET��x/�im�J���.Pl��{���8�Z�c���:�zF�j���zh����d�Dv��Ȉ��U�7�2�n}OGem;��6h�����WJ9a�����S"��U5�������y)i��ʹuj.5�s[X�G�"ܭ�VG�9L�U����]�G� ��3�ke�\Ǧ_�z����QQ%ͽ��am[)�蓽�#Yͨ����UF�Zi�+f�v�j��貪&8�F��h�GQ_~Β��b��)�s*�Õz�3?���:6����t{v�s�	|W;Yu�*9�v�}�N���X�YY$쎕�G��]T¦Qw�(Q�-���d�y6MF�Tv�<�.�U�`k_&�L\=\עnT�"=Uxe7�y壣���M�"C%Mlnz���j�X�Do��U�^r�1��I�b-露�GT��U@څTM��5���D��H�k)�tR+��9��M�C-�$���#�D��쮑���D�?<�֛��A[���ָ���½aUnU��g�f�φ����AP�'A:H���Z���WoN���X����l�v7a�D�f� 	�����OQu�8��C����P�t��%��޻����J��=oW��Q�K%*���mV5�G�s⪫�v��������G54���oV=��Q8�'Ip��{�KS�jeQ�ETC�5�f�TL��U=l����$sq�~&��X��O��G�i�d�s�z�+UW9�"n��q��FW\t��Qe��7psW(�FC�                                           5�G�j��Ib���p}�S�iի��%��pZ?�����H��  0�
� Y�rR-,���U����X���q�;� 
4��m�5%��	Q1�k��(�ګU��d����ySr>HZ�v�Am)���DDMȈbZhV��+zCX���ލUʧ�(�`EBX�,n�V5�raZ��*z������7��b���ENX$ �Ik��H�Q���ȩ�tP����D.�Zhi!H��H�EWj�5\��S0   
u��
����T�.ba�4Mz�z���j*J9�4�S1ˬ��1y��E��M$fQu^�T�.Sw���"�k�l��r�Q��\��_j��  �!�'Y�6m���~�k+Sz&yo^҃�g9\�M�\��U�fUy�6`�*Vۨk�}:���g�M�M~�x�)��
+u�hh驕��Xbk5��[�:�]l�%e-D��GK^���B����1��50�D�"X���s�i���UUU�b����6`Ep���cc���ֵ0���������]��껚rS �m��]"I[CKQ"&�:hZ�D�C--j�*h)ث�l1�W��c��+�|���u��&U��e9n%#,nd�k��Ú��*rT$1�P5͂6F�9\�ƢeW�� �&8@                                            _�V�� t��)�h���7�;֑�Z���_ا��\h�Ԋ�   �  2�Дq�7�ឮ�:F����[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����e9�gf�1��f�1���V�sA�慝�<���<��)[)�S�vl��6l��,�l�4NhYٳ�o`ٳ�o`�����vl��A�S-�]� ����/�M�}  _�V�� t��)�h���7�;֑�Z���_ا��\h�Ԋ�   �z�T�BDd�n�(��k�����P�(՚FF�r5�DʯOX �%��{#�.�\�W��	�Qx.@ ����                                                                       +Θ��H����W� T  k�������8-���F��z�?�W�K��K����_�  a 2y7{�<�������KT�]�MGmd���U���������4n�]V괆�Iig���g��i���E�UTU»�:���CsH�KKa�%���Y���Rҋ_i�"Z�����Y�f�������2�51���%2���O�0緻UE��L�[}"���4F��jZl�p��k[�&0�_Z��@�g��.mMRս�q.�ڈ���x�;��h�E�H��R�RD���e���I��Ȭ�5E�䵡:1.���$�PTI]3fT�F�a��"9�U�&�cMy���N�x�"�P.�D�^��rZIV�Y.�%E���Z��3s��U��E*.�+�m[�}��W/jC��IUQ��jq�����7t�I�w{M֊�,�*�O��G"**J�:��Y�m�"�_Gp��M���o�}�k���Es�{UDLi����'��.k�IZ�4��<2���MU�]:T+*�\���vq��p��N'lN���%����(m����r2x�X�n��v�DEލ��z��W��H 0�                                                                   G�o���uU��� 
� ~��Z���_ا��\h���ZG�j��Ib���p}�R+�  �FO&�b�#'�w�@� "�Uӱp��E�B����\ܹ)��TF�E���L�k��6�$a\�,��>ϝ6��"�鴾�}	�}���������y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���:m/�E�B{s�6>�plz�y�M���f�FH���rz�$6>�p�="#���)z���ju�/8��x(�Y�]tՑ����r7��Qp�Q�[��@�G�o���� ~��Z���_ا��\h���ZG�j��Ib���p}�R+�  �FO&�b�#'�w�@������l�5:�b��])[>�M�E�˟�G��z�nњ�L�3����}�FKd��|oDs\��*/Z)Ǜl���v�U�[�V�U��6&�5U�]eV.U�k�n�t:�l�~��~�%3tn�Zx��t|�6U�Dz�)�5����,�^~?��<2�̎X���+��"�"�
���|����	%�w1��'�eq�q?���;Ij.����Ҥo��VI3=V�'�󜻵S>�D��[V�P5�-�Z�TQWάH�i�TTTj�V�QQS��g*v�I�UIDh�d�l�GqDT��)F�� a۾��B�                                                                 y'�������6���Nb�8_�l�O� hU{�� %�˟���`���W� N�ʷ�_��l ��?�W�K��K�����H��]��/�S���.�o�E~� � T����RDd�n�(�P�VϢ�}�t�F够b�Db��'/E��.�S��E�UB˟
}1xjfѺ).U���	��M���6�Q��\"�!��� �8���MTt�W9}���O�V�q~j�O�/�n�Uf��m�������x�鬪��sܘE������Msغv��u��_�c�����^%ݫy?���o'��76c���4������1�&2g!�o'��6�������V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	�V�q~j�O�/�	��ȿ�Q�o'��a��k#���]�D*L�E�4� ��W��[+P����L��Wk*r䅑,�� KG�o���uU��� @ ~��Z���_ا��\h���ZG�j��Ib���p}�R+�  �FO&�b�#'�w�@� "�$l����j�*~O�<���&ȸ. �Xc��
}=*��Tt����R�-��â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����Q�Ҫ� 5K�Y�â�@OJ���=*��T���:)�����S$p��tEt�s�YK �G�� *<�}�����W� T  k�������8-���F��z�?�W�K��K����_�  a 2y7{�<������O��n�+d���H�����ֻ�?5�����k<O��Ӳ6;1��ʍ{�p��7�7���n�Z�SC�H����V�"oE��f�{n��}�>��=IA�s��n��~x��fbm���y�[����JZ�c)� ��Վ��b.Q��[�֌ST%��*�|s:�uW���d_���/V�656�}T�-M,ү�\����l�����u��G��xG9]��]ș�/b�y�MK��h�jg�E[K:�G+��S�<Q?7u�wh�n����=+�l{)dXѯG*����67K4u6�j*4��(&�F���Gc���bZ��ul��\��{*�}�X�r��n��n
�[�ν�٪(%��$G5#�\��ª��.9T�<�3�5=DU���al2�W$�^���6�Oco������nI*U��cu[�1�5�D����䭤e]e��:w5ɚ'���j����X��I�Z���k#���T�٦z��(�S��*�%{���\��'+<�{VL��r�r������m]43���IX�D_���a����u,P�էXq#Q�vr��$LR�4�;�O�z�U���TIʑ.�r��Y/CU7�2�E�j��>�YUQ*��\�� ��j�v�2C�����H���Y�DT��ޛɭ�����zD�jB��Y�ۓ�?�*^Jԗ'>��*��*k$�ձ�]����s7����Kwi꠻T��:�襕�b2J���p�ժ�L���hӡ����j8�:��Q�lM���Y�OV�oQl���d�7�׊��O�'(���klQվ�$"X����e�Gjeʩ��5]�\d����������Z(��:g?zJ��#]�Xϯw2��X,�PIY29�&&��;�*��ވ�#Ed�/�mµ�:5��5z�Z����-i�K�U-$�R>����l(#z뮫SƓ~7nU�"s.T�OSCAn2�L���a�����ʻ�+���]��dRKL�O!$8�f�\oEEEM�T0��ءjS�VEP�t���t��:ȭV��ݍŸ*U*�ã�VEYWG�G5��H��Qu�w�r`��nW'i,4��L�O�5�����V�����T�Z8Y=��Hdt��U˕���՟�wQU�e��ϔt�3����-L"�0LK�UR_e��z�q�|�V��]#Uw&�������9��jY\��X�nd�U0�Q2��׎�CS��y�}M��s�%��U�2�Q7p�zx(vVfPk��lu��DD���UU���L����	@�"fG-TJ�W5_3#�j.^�"&S*����o�_zt�ԕ���r#��{�(�nw�p��;��=����Ymh�wF�X�ڲ�QQ~~�w�7�MWo��{]WIO;��E�&�Q?0DK�Yb�����Z�|UX]����ԉ��]eߪ���ʧQZ�]-MM����K$��"35(�h�nʬ[Ew��^g����Hn̷N��Z��X�DHWQ�DT�� ��ޝGQYq��)��5��2��S8U�Rꄩd�{�(��L������V���$H���Uu�Վ��^��̶�p�����mE=S�5:ը���q➳[I��m]��lgLd�����i)5��6-lc[��~n)��y��uK��^t���j�3cѳ�q�8��a�\(�r��>ik$lRN������=XL�Kw}e|��s�����e��6��Ln^�n9!S�:���zC����}�Z�r1p���N9���%J����˄T�}EDOW�*������fr���s.���[�審L��x�������O���Oޖ�z�w�茊�:ɍ���o���e��RmUu���*��8��"%�l��>��Lʙ�����$V;
�j�Sy���R鍲�7O<n��[ZD���\�8�-�h�$ST�HXd�FH�b�^�U�׃�68��pV���p�7G�U�r�s��D�-�1�İ���I%T� \������a�                                         
�*�u��<�}��  �#��w����NG��>ѿ�޴�������8-���F��W�  @@��M��$FO&�b�p E                                                                              `���W� N�ʷ�_��P ��?�W�K��K�����H��]��/�S���.�o�E~� � T����RDd�n�( V���G��J�� �b�S��Av��|M�W���U[�V�e=/eC���g?]�s#k���9�F�ʈ���S���[��Z��`d��ڞ�����x����DR^��߭��#fWm��UQQ^��U�+�=�Uj�:1U�G�'92��Mǔ�F������X������:U�Dr���n�Se�Q"�R���K�������0�]ˇo\/��	r�Cx���n�K��:<읜�p��2J�u��K3)$Y6H�9��a��;�Z�.�cdT(��j�+�W#�Y����9L���fѻ\�7;���f�&�"�����������I�.[�.t�	"����Me]���R��U� 0ۖ}�&s��Z�F*aU���xoT)�a���͢���2M�\�*ɔ�¦p��q������S]�e]��9c�yX��t�2+�N��ݹQ�W/L��f�[߯��I�N����9Z��?܆�D�2���[�5���\sU"KEe#VGAR�-|veG�ў3�3�n]��9"'�fe�&��B�\�R'�oV�ʈ�r7�8�m֑m�V� �Q�����c	���k]Ͷ��H�H��I�����"��|�\nOY����6��)�UлY͉ڒ5|d�����B\�S]i"�)${�k�F�ݮ�q�q���-چ*h�:l$MfȍUn=���OE}-U=uT�7e,(�åcU��g~�Ʌ�!8���4t���4���3�[.L�^��8r����l��zK��2��r�ֹʭTܹ��R1_m��ȣ�WH���7orqNF�B�*h*.������ƭG7z�d���S��n��Cv�ic�lc��_'��ߞE�\���l�_�VǵV� ��ETu�pUA��f$��ap��43�n��MsI�EsV��Z���>~w��W��h�o�Gm���G#)�k��µQ��T31��d "�                                                         0TyV���'Q�[��@�  ��ի��%��pZ?�����N��V�� t��)�h���7�"�H  � *d�n�)"2y7{�(                                                                             G�o���uU��� 
� ~��Z���_ا��\h���ZG�j��Ib���p}�R+�  �FO&�b�#'�w�@� "�                                                                             0TyV���'Q�[��@�  ��ի��%��pZ?�����N��V�� t��)�h���7�"�H  � *d�n�)"2y7{�(��{��km�(��i�Y�˳n�qUv�Ԡm�h|0^�g���mt5m�J�W�̍QV%V,i�n½W9�ދM�5U��]��}d��n�%^��>�DMGu��&��]�çWJ�3��#鞉Q_��u�bFl�*���oݓ��N�J4��5�Xa��7�XU���U�z��d\e�&�5C��x>��~��M¦h������c���'a�L�SQ�                                =�oV-1J{m;�(���6G�5^��W�"T�s��T�E�.���m��r:��OO$t�1a~��u�Y�ʦx.�vuê�i~�i���=u��I+r�):9���kp�ț��y��!�н��juD��mU�F�H��b5\���K�&I�MP�@��+�K�2�n�
/��T�)�K�Y�#�p�F��Ql�K����l���m̻6E�s*�Y�n����M]ܕw�euC݃�/��|�J���R�TK�n�=*�\k.���)�M��!�K��-s��F�����Ul[����\���rq%5C����n�O|���W|tWn�dH*R�'6DUn���.QP������ E                          `���W� N�ʷ�_��P ��?�W�K��K�����H��]��/�S���.�o�E~� � T����RDd�n�( P�x���ڪ�"��TD��fU5�S������Y�Ր��J��	a}+&���vS��1S�8��y���+z���z��h���Deu��F����j�}Jt�ns�b0q�띳O�ꪨ�.�rs����#�r�Us����t�k����9n�����S�[�4�Z�DDE�ߓ��9��0��	m��4����K<��|��9���w��{ ����P "�                �1>z���Zw���,H���2��	;COU���o8�|���H�fQ�gjoT�S�L��2�fAƨ�G;�W���҃��Y-iIKUN�ML����w�]Ыp�� Ԋ��zG�����i��%[Q��:|ֹ����瓤����L�k}����v�I�U��Z[L�X�%�]�X�;(���l��QAuu��V�2B�kH�kU���EU��'I%��rS2���*��Q?�ur���MΗ��\*���[�)v,���'�ꊮL;N<��K�=����zJk�-eE|Z�2Q��zD�T~�*�5s����Bm(lR��5����*I+��<9���������x�j�11�Bu#2�TF���ܮ�3�E��+E��vtn��QH�lj��cF9Q�U�UUzԕ�3��11�����j�P��Vjjm�l���2��h�h�U.��:�l�,��ULj�%C���ա�e-�Quvq��nǍ��n�I�1{7��iJԶӥ�к�Q6�
*3[Ւ�"n, r֚��9k�/�Zn���ll�eD�r##Y�ڹ��V]����4v(��t�8 c[E4{5nr���$�v@o\�:wq��7��
{Z^V��IN�9b��s[ z#���*��'��oЪ�+н��U�����MV��u0׹W�3�'Z�:��0�V�5��]Q}���p��G��l:�|�+���*c;��4:�Jjt���z9[O_Z�����S���0�����\���UWԇV�ip�/�n���כ�du�Jڪ���4k2�Gl���oɺ�}�e��OKK_��������Q9cٹ��W#�UM�:�.�4C��2Ѫ�V��nKc�G-up�v��d���̫����*&N����X� P             ��w���[h�Gmk��G�a��䅺�m��@����F�Q\�z+Q�D����zG�"�U�%d�m ���Jh��M�9����]˻\n3�ê%�H*��CQtt�b>I�9�SY$kSY:�0��`ޘ�x��s4��)��Ҙ"����	��G*5QcG��"��]{�e⩎l;��z�*&�g?�h�]�(�6ʮ6�+�T�]�u��^�nƮ�����t0�x=���t쎢�8����9<T\�z�1fx|n,�Q����������Z���H��Ȟ�;.r57g�B�~�)��_-,�>x�Z��{��w�<�2J�ɠ�I㡂Xd�X��������S�Lp=5ކ��V�I�dF9�H�vd������w���.y����>��-[�I[}���
ħ����i��S�������z%'� �m��β��o������I�^s8��� m�4v�ޒ�X�ϧ[~�uQ�r.��r�����&��Z��`���W� N�ʷ�_��P ��?�W�K��K�����H��]��/�S���.�o�E~� � T����RDd�n�( P�}����Q4�""";�ʢg��K�f��D��j>7���T�*n����,��U�2>=$�tJ�#Uxp��"U/�������z��3e�^��c���ª"oM�Jm���CѶf��Y6�W���.U\z���(��h�sfƺ��s�<e\��߸��5-[$���Y2V6�N�&�cʪ�<la[�<2Q���}%3h���H�]$��c�E�G?;�2�ܙ��z���Z��u�M�J���1�|�p���-��H�b­lm�Dc�ܷ���ޞ�KO%UMTw*�V�
Q��X��w����EM���z�G$(�T|���	�;� �E���V�XU��V�Ȝȋ�"z�ęXy+}�z���j�@�G���ұ�MD^�jcֿ�������OvJ�g��7:-�95�U���wu�7�AL���Q#�fn���UU_��1Nٙ�+��{��r��s���D-�T�,����Ϋ��n�W�'7U�H�]V�7�Ɏ��^%+n?$����rt'I+�cQ��"�Y�3����R�D�+:C��+��Tr����z��w�֒��4�ڛ=N�\c�e�Ucb�D$8 2�             ���l��S$���p��  2�^  DDL&�     �j*�mޱ�rB�R�#�1���j�ɍ���0+*j�ұ�R��'"G
cUpƻ�Lo�M�E����o4:�e��Q�V�W78v:����GQS��i7*�ʍv8k5�Y��jZ�TU�xY*���o��Ƭ���TLe��3���
��Uvښ�IWP�:��H�j=�=ɔ\�"&;z�� %�t���]���5�W[���3��Ll��؏jS���,z�r��j�F������*Zj
����˔���3Z��#U��dEEEr.�����v���d��Ij��ʢ�Up�\3�%��69�z9�{�G���j�UUUD^	��I��yz��_����I.ݍZ�T�2�Tbzܹ޼?35jj�+.��O$O�U������r*o�^��hi�l�&�'TY8�ʈ�����=��y�$�e^��]�Ǫu��×wZ�*ZG��=ͭ�����b��j����\�Z���%��U�ս`��G6��r9��$H�Eߎ8��ojm4U3��C���9Q�ȋ�cג��@׶#Z�+܉֪�U)�'���I4�W��e�^����Ot�2�����:��e�              FH�"bF5��ɓ�Z�&�jrD�� T����M�   &Up�^�     *<�}�����W� T  k�������8-���F��z�?�W�K��K����_�  a 2y7{�<����                                                                             ��ʷ�_��:�*�u�@ �H��]��/�S���.�o�w�#��w����NG��>ѿ��@ P#'�w�I�ɻؠ\ @                                                                             *<�}�����W� T  k�������8-���F��z�?�W�K��K����_�  a 2y7{�<���� ��5�Ur�"u����t��5mlU𺖉�eD���>r.��/���TSC<3���Ē7g�T�.�E�UO�V���t0WE%S�$m��UWG�t��S��۽��i�U�Q5Q.����UOZ!h��T��Q�PS���F�Z�#�8G�x*d�%T���&B�ˤs���������v����6�ٛ���U2G'��l�v��;�ɑC                               5���u���(����j�ޭL�bs'֊z��(�X�V��3�G&Z��7�Qk��\�v�ccuul0���f��r����9"*�]~���IqulM��V6	���"�sQ=�-ق�ntn�>��ڵ�'t8\�j���\QJ��O`��JJ�ݮ��Wj�c���Qm�>5�棚��T�*u�H                              0TyV���'Q�[��@�  ��ի��%��pZ?�����N��V�� t��)�h���7�"�H  � *d�n�)"2y7{�(h��k��]�iiᩩ};�1L��s�2ܢ���ޟ�s�ੁ��>�׳F��-��GlJ',�3����rJ�+Z��sD��L/��&�.��� ��A��F�V�TF���9��{{�T�P�+~�����H$J��UUL+9��Β���̉R�cli4�j��N+���;eķ(�´n��\�e��Stt21�k����*�RcǬ�c�Ga�K�Z�S��%e��J��uD�G�*��ʮ�vQq�봺l��Ar�Ң������������Wm�����a���+�bb<�2���I�>�9v��_}�Mg��Pت+�"|�ʥW����EN(��'�����eњ{=�+�n���Һ�)*"s\�~�<Gnݻ�Q��V:���nt�Ʋ	��V�1�s3ׅ�n�Kv��YAg�m5+U��UU��UW*�UU&�].h���t��WQ�54qY��^���GH����U�S~U8�#r�V]�]��+]uF�u\�D
�1|D���)�&�h��#�n�Wȵ���~�'��c(��ƒ���D�*���\�T�Ȳ�� 9;Y#������0]qi�[�
�mn�Y�Y$��JH��"a��Sz��ю����
x�1��10�D���C��@              ����T��J���*�دr��z�I���ps�U�!���:*����Z�W�U��w� Iʟ5���~�o�wz�M����zGI�I�sSbߜ�⺩�ɽ7��*fb�?׶�n�7)�����Z1Q<�}3�5Z婪�Y"��M�8��2�����jm�U"��*j��*Ե�[]r���.?�'���bq��>��UUp��T�z3USt��R��f�s!lO�d����[QUr��*���I��H$��WKj����5d�2I�WW]��Q1��Q����G�2������QQ��4�;U.��d��(X��&��F���u�b�� j�	%[�#���Td�U_bd��Lj&f�0`��������fMO"e�1r��r7{� 
���?D���^�֩䮝��lm-<�Uܒ��_�&��Á��۬>i��:UGGH��V=Z�.���N	�d�]��z���u�[ki�u;_F��,r��.�W����6�K�Sv���j9+U��9j�?��^�z7q�h�(,���C�v��;`\���"���x�
�SIm�����R���[KMQ%==D�ͥ�5��b97eq�^k�-�_"���au>�bXp�+جUT���R֎X�,V�::v5獵e6��D{���eF��49}��xDmV�1�vd�G#�d�Yu6�*�3�s�¯Ǎuƪε:}��.R�,2�l2�[�ʮv�����N���G)i��[�VI%#i6-j#���r�>��~�$�^d�F�mIQ��&�����Fqf�k��-�Ѷ�]4�U��,=Q8�W#� s��n6 P                ;I+����Kk������}^�Y��L#��uDUw.	Ğ��L��UL�ܒ�L��5ț&�w�N{�i��9�M}� �!�Q*��QQ�H�������+�US�t�.�|r���T���j���=md�1x2d�O��-��X�󬋆������Fq3����;�]D0AKr��t��$��9*5^��~��s����A�V���;�f!��
�cDw���"a��WD���DT�1���櫕���N)��}<����O����~�"e˕_���:�lk����#�p���w�$�xqc(��y�%x�ݺ��j:Z�d����k^��j� �0�Өؑ��-�@ V
�*�u��<�}��  �#��w����NG��>ѿ�޴�������8-���F��W�  @@��M��$FO&�b�p EuS�KO$�V6&���d)�i_[m��G"+s�(���� be�c���,-G��ƭv��TN���)�*��٢tG�9#T~��TN���U��ܤ����O#"c"��E�r=�T�(��Jz:����jh�Z��S�TG=��]f�����Uܶ2\㎕���k���
�9�/Y�K�+)�Vw6X�dD�r�'*u&�]DtuP�����&�fMh۪�8޽Y+U�����J�JwD���U�W*�˔�Lj�_
*��ךD��U�G5���ƹ��*�\�iz�fSS�<��mW�Q3�*h��$�
w�#�Q�T5��g����oR&}xCit����[nW>h\�5p������eݎK�h�t��i#܍UF��Oj��!�S�MI=;�U��F��D���i���Q�%=3�+��kL��N�ETU�k��`�,u�
�w�H�VS���W��ޭV�a��w�x�.Y��K�e�{*�e�*k5x+y���y�W�7��H�2Hի�g���i$���ASK2SB�u6O��|��.UQ���}[��]�Q��@�&��1�#�~WQ�ܝ�Ar� �            ��TET�c)�} xWh��i�E�9�C�/L�s����޿�z� �iwO%<RT>$�򽨮s<��o-��S.Xp0����[tN��~K�$ڑ����F���c��"1:��כ'ʱTC=Ƶ���Q�G�F�TʵW��p5I"'����ʝJj��ʺWƱ:U�L{Z�_�g����9�l��	 tF3sZ��~%�.Z���N�B�+U%ճ%<M�Y[�l&3��%E=DC$M�{U���\/����DS4SA4�(cDkX��5�� k� �����Q$NI\�*6Y�VF���\S�T�)��|oIU#TI$kYxk/W5�45�K�$6X���$��D���G'�S��]cYq���*�"���D�-F�)ǫ)�Uܶ��F��S29�殫����.3�L	{�I�"����x�iH��ߟ�{
R[��Y�AH�I�G��&�:4M�V�;�c�+�ۮkT�iҒY�{'����DL&�nEL�'�P\��{�X&�͝���F��_/TF�:��4�QH���j��U�<�6g�*�Ks�,���J����.���j"*� ����)* ��9U�5ҫ��_]bf�7;�/�8��2�Sr��t�ꎅ�s�UW�*�Q9��p1Mx�9^��S*Ǎ��%rG�8__�7����z����=[,QƴȮ�F������z��h>P�}N΃l��3���TL���EN)�`�.Ve�R1cH���ēE��1x9q�^�/�Ѳy�T����D���+�2��!���WM��fB�l���ת��;+�fU0���f���%U|�9dsg�7�F�2MX؊���Wp�K�*���U��ѮS3UQ��u��Z:Y�2"9�3H�\��z�e6&e�              y���-��j�M3c�cJZ�hr��dn�a�Y�}�������M5T�"�6-H#�ⵊ���g��AuMS�#Z�v���tw9b��*cEM�#L�5�E扬���=�Hl��1�������֢�U1�Ȩl��X�c3��0h��WSU����U�+���j���{]��2�l�F>woz�ug�=I�.�r���hj��H�7]��U�[-\jjko�w�[�Q�X!U�}�2Z�c�*�o���j��jTJ��?ѩ��q_Ĵ X��` ��ʷ�_��:�*�u�@ �H��]��/�S���.�o�w�#��w����NG��>ѿ��@ P#'�w�I�ɻؠ\ @                                                                             *<�}�����W� T  k�������8-���F��z�?�W�K��K����_�  a 2y7{�<����                                                                             ��ʷ�_��:�*�u�@ �H��]��/�S���.�o�w�#��w����NG��>ѿ��@ P#'�w�I�ɻؠ\ @                                                                             *<�}�����W� T  c��mmU,����tNT�G"��so���.�t� m$oG,�vUȋԜ��u�"� 0�
�<���H��M��� ��(�Kg�V�adu4k"��+��UU���Щw���Z��"I�����5�S���u���V{�ʴ[:��J�W2�]x��U�u$E�1�z�,�=��_k.6�U��GYV�T	権XS�ܨ��;��V�-��Ej��ǥߥ��̨��z�ӵ�3+�q�����#w���y�]a��0P=�tNs�����MU�.pv�1r�J69���V��O&�E|rSF�G*D�٢��N.߻"ۧ:QS�:Go����EoD�0��u����E���8��˭�O(�ji1[$�':��j�L�{7;�U�<��h��5]��Kx��_��+��b��k�[�F�i'Jţ&�U����v��heΦ6풢�I��V�X��TTvpP�<�ʫ�%���gt�E�PΏ�b��I6�c]ͮޜ��2�<����9�2��;�,-v�ɳj�^�ݹJ:%��?L�pS[jn��WISQYm����S,V�U2�݌)k������<�h�5��m���F���s֣
�Eʤ��o��=��!��
�#Y*!�����Ҿ$M]�͎L*q���x]+��K���k5�-���$��~�Ȳ���s�>r*&�*z�֚{M%�+�3�m���TEcSw���L�F���t ��                ��Ҫx���0�F�$�'Ǭ���q���v��K5�tU�:ٙn�QȎw5��j\㋄��Py�-'�ZM%��ک�Ĳ+��c��ׯ���M��������
L���kU0���w!RG	���6��Q�i+��EoGU���s�.b���UDj�c;��k�ҵ�Z�y�5��1Q�X��,J�5��H�o)<l".ޘ-k_j��Vj,�6M\�L�GH��� @                                       *<�}�����W� T  N.�d"�&E  a 2y7{�<���� �~����Q,�""";7*���9�<��z�l��AU4�|,~����dF��ع��nt�VT9��Z�=���zku�㇩MiKz`yn�W��U-B�j��h�j"9șUo������*[D�>�.�k-��jj��=\s�����[���QR�1\ֲ]���k�jj����承<r���P譕�\�b��Gc��0�|	E���v����Y%��o����je�z�m����u&=�Ω%�US6:�^��F��=��u�H�����Im�<}E]M%��$��:ގ�Ü׵˔EtnOoZn3�z�'��}[)���4�8�\�k'���[Ԁ�            W���覊9��j��,k�ٞ��	1qN3U%��΃4��P-4ԭ��Uɿ΁Y�����x��I4~���t�I-#Q�{�:|�sq��׿~O[����g��������1��O×��:o���:\�R�MT��C�Mɔ�z��2x����m�uɴ�F�K,OT]d�+���j����p�"~��V��K�TP��\jbc�9i�;X���r����Q��t�:7�*��c�5Ud1��s�z������57���~�����'hJ)a�N�VX��T�G'�J��hgH�(�ME�H�^��7av����ƚ�KCkYm�m�Hd�F&�еZ�w�����                                      ��ʷ�_��:�*�u�@ ��&B.�dP P#'�w�I�ɻؠ\ B2��ctr��&�L�� (-tPE4l���SVDr������}��G3E)�2jɬ��rcU]��p)Em4+3%���f����[�U8*���}�.��t��ݶ��w�[��㯉t�RK]Vt��n�[_;�kc�q�ķ4l�'�+Qѽ��5z�x� AZJ
IU�%<oՍaMdψ��}i�t��:W������L�U˫�2���@��#��FǱ���{uUUSW9�ew'�sA�=��7�۞�'2`                                                                 G�o���uU��� 
� 	��L�]dȠ  �FO&�b�#'�w�@�(                                                                             G�o���UU��� J� 	��L�]dȠ  �|T�`� �N�fj���ܿ)QS~Sr�B[IS����� ��d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�6��gu~"�Ym����_��K͝���-d���gu~#i/6wW�(��V�K͝�������_���A[i/6wW�E����e9"a��kȮN   *�f���ZXv��G�k*'����-ƪ�*X�p�Y�F�ݜ��Qu��=��^f���T���r*�TN�R+nܪ&Sր ?��
```

## docs/market-top5.jpg

```
���� JFIF      �� C 


		
%# , #&')*)-0-(0%()(�� C



(((((((((((((((((((((((((((((((((((((((((((((((((((�� ��" ��             �� L 	 !13AQR��"aqr�2���#46st��Bb$u��78STUc���C���           �� 0       !1AQaq��������"2�B4��   ? �>�����������������������������������������������������������������������������������������'Z�Qm-���5�	I��<q츎`�+հ�SAS<�	�ake:I�I�⮚�*��l��<8Fs��TW�"4�	��=��
"*�" "�=���W�z��6(\X�4<��zA��7��m�� X� ��� к�)�~W�c��yN;�w��ȿ0� ��� ���?����z� GT�vtW
b}�clo�Z �
�&q� ��|��&=߷�U-W
{�����A%<�c�gש[\_�""������������������������������������������������#�+$�(��3�v�Gj��i��#�2;VK5��v�Gj��f�|����X,�ϕ�WY�r�X��DDhDDD@DDE������A�QNβ�~b?$�x� ��?T�e�x� ��?T�vuj�%$B\Z�c�=�*ڡEo��sK�N��פ�/+��A���n�tO����4�z�<�W������I������7�Q_�DU��	��$ge4�iD0����/����I����Y~?V���ۤΆ�K5L�iylL. g���1�{cp���y^�MT�m��C��n��f���7d>�����݌d�W�)���81ę��h���6�l�]���B[<]ML�78��Pڇ�M�u`�V�B��WeӸsyY�����7;�����[IWH��jfdVI)=�=�:pW���n/����ml�5� {ELf�ۍ�ǅ��=��?On�#��mk�!�25����d���t��ڪ�WD4��2H���W��� W'�Ջ�" ���e��C����{��+������`� �����zD�/��a�z�ylsU`�L{�>�˖J�=�P����cl��~�X�d�3�GF	t~�+(k=X���1�NؤkOݐ}�}����3��,7/L{Egsd����1��cw���`v:��Z��g[z���Giol~��c�yw�68�W��s��<
�CYK_Lڊ�ji��e���?8/�>�6"Ӷ��6�;��}=%D�m<rks�p�q��Y�z�F���]���kl��*<�׺x������x�h��[z���i�2��i��e%m҂�����cݞXi9Y��T6�ׯ��R�N��ҵ��`��W�m�����W�O�w;�±�?k6�N���Npy��V�җh �m�����������f>��C4�稒�k�ޯ}�l��|ߪ�/6���)).4S�ŝ�1N�=�疃���k}"m5~�Vl���m=EM5T�T�F2H �ǭp���.����w-���
�*Cd{�.. �k��r9]>��wݼ����]=&�D���̐����C#�ig�
��;e���g)���z�t[��=��fۻcm5�1�_T���������u�~�lg%Lt2:�h��*����H<X��H�=���/�돣�I���4��l���\ �-���\y�c��f�3���54�\,��Q���85�|���"r˺��H���;�'�˕��k|l�ܨ��'��22�F��ƾ75�p�sNA�~m�A��It7������넵F--��vA�� r�Clڋ����X�U�MIA3!���Lt�Zz�;:�T�������.?g�� �ΟV��o3٧9\������ǳT��+"�:<�>�#���������6��T\e���Ӳ��'M�D�`�i `r�s�\�n[-�;f�ɖ{�Ζ�8��Q��<� ��g���ڬa�e^�JNS8�ǭ��ZK��;�h$�Q���v��4H~�U��� ��En��v�+�D��U�,����i�@�������3�L�x�qE�k��$��� �l��i ��q{b� q�!m�����5��� g�eed[$�Z�^��1����Gp���-��qZ�-������he*j't�+�`��\�YY�v��Y5)$t­�67��`�?�ZL�6�[UTT����OynN �IIY5����l�VVJ�$Xxi���
�0���� d�}XlDDB�u��TQ�T���ɺ��7{���4���q��wjZ�Y/7V�[!�Kt����g��\��c)��=���4ΞVL���c2;�qZ�����T�>*�_;�q��^�]ْ=q��f���D�T�9��7ͪ{��=�f	=�Yp����fd��b�Tn���Z�i<rG�}��6���_%�a���e�Usq�~�,�ά��V�y�����D�ݢ�_�4��#xr�9�pW���j-�E��jw(]3��d�q�JQ�e�Z��Gq�ӹ���K��r�U)� ��p� �b� 7*[��ٴ�d�۾�,1�{���8�}�Q�2�a�d��aY���aIs˚/{cc��d���t�]b��m5-�9j	l`8`q���i/���Ɨ�r�#��ݝ|�������H裘i���ڐ��� ~)��q2�'ǜ����cju���5?���Y	|�8'Ks�Y�i������V���c!���Hp8#���H������jj�@�X���$���o�SZ �}�u+q��Y**�)]��8�`}Au�"�,}��X������z=��n�T��r�e9�ա�7����Bߴv����6���fl[�bps@�9��r��#S\+o��i�s#����������U��eTWs;}f�Ǫy2���{cx�k�L\�e��8�"6�򿫾�\��t���u� jO��=��H �:C��#���{k+娭����4��k�c����i~[�����Pam���&=�ۓLi�%���ˉLTo��Z���O�bYb������4DU�DDD@DD(:o��*Pt��PX\N�m�;=%m=���[E��2'�f2� ��+�^s�T4�smՊ��k*.S�P���S�?d����v�5�I����U%u���zwR�<,��9ڌe����g
���m�P�mT�=�j⥥�x��rǑ�惤��$��r��U&(��
���)PS��[��Ak���j��$��W�������z�?᫿��� �^G���o梿H""(��
����nD3$��1�����D�������A�u�틟K4>�Ѽ�Gl��k�k��az���'��q��e����c�HdC��A����1���ͯ� �� ���a�n�����N8E�|4��n���\hZ�[��N�:w r�~����_+�&1���h:u�=k�� �I� ��� ��� ж�B�^���k��9ttĸ�ݒ׆<�}��8ӧ,g��e�z�����4�M<�3=m�3�
�*�᫦���6K�,{2����Jxh�b�����CƎ�2�e:�e�^���xx�����Al��<�'��%<�/�f\��!���WS���u�b�$���r��}mG00���$��^��Z�M�����D�[�{_-��[GV�@2�=����/e�y�ݲ�V���Kx��5��SR��m'�Y$�w�R�ӽ��{�^�04��k:NsUԑ�]�}�^�Є�TUų�Up��j�L�Mi{Fy�u��<q�V�h�R�vsg���j�!�Hdl�3|�I�>#���"FyEn�!�zK�m���.��>m��;�|�}�KM�ވi/w�|�]jlWg��S��SۀA���ؽI��9,��瞎���Φ�[q��ާn�W8Ɩ��2x�$�u*v�D�Y����-�Y��ۃ2�	�FC���A���W\ݦ��x��ЛM⪷e����Y��д���o<�~+��oF?a�J����׷��}��Q� n:���x���5��������uͶ�^���9�ui�t��]X�YC�Xov��MMh��EF"��%���]�ё^�.�яs���9e��=F�Znn���Y�e�����1��5ߢ,���GsU�������������U45p:��,N�Z�q�fD�(i�!1RF#��� �rJOCO=e5T�ꞟV��>Ρ���" ""�WAOW54�뒙�ȎH��c*� �t�R�(�K]�KI#�9���d���QTCI��v�8���ĭ�+1�&,DEDDHڭ�]ᠤ2gV��s��㚺�1�cDlޖ�/�5ٞ��(����1�`�֌4@DD���g##aYF2�T^��9�k�S�{
i=�Fi�v�[de�Ԡ�ٍ1s�9�P썖���j=5X�#ݤ�etOaM'���\�&��m��]�뻡uƙ�:�$�[�|�
6���;���H[��8��[]'����R�g��Ϊ�G��k��ڨc���uOt�$�''����OaM'��֝�X����a��,�Fo}DDlDDD@DD(zo��+�C�� �����F�UCW[�WB4�WM3����SH${�B�	�cv}�'���������6:�e�5���eķG�V����h� D���� m� ��~�ݟy	7&Ќ�+~R��q..w2��""~�� ]� ���
�Z?���c5�[G�5w��_�+�h� {�����W�DA�Ak���j��$��W�������z�?᫿��� �^G���o梿H""(�����!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈!���⚝�>*h���>)���⦈"�O6�Ik���j��$��W�������z�?᫿��� �^G���o梿H""(����������������������������������������������������������������������������������������_��W�%� ����?���{��� ]� ���
�Z?���c5�AaDEPD_k'��Apm��T9�ph��!��ǚ�Yy�Q�GOU[O����3ǳ�\��Xn5.��i��o(�q~oC��3�;y.��o�TVSIH�6&��=�\��˱��r<x�TT3sr�Q�EW���ֽќ�qi � p���HDdLӼ{�`�sI��Z휧|�%�mb�r��!�=��T-v���K����O�$f:G9�o��=|Gf��nb���asg!��(.c����#��9+N��i�T��	$=Mi��?�\�����:T�5`��K"%�E&�N �#�x��\��[�h�-���X�2�8`��1��³�"{�E��I.t�>�|e���KH�%BM���mɩ�[�10<�NZ8�5ʺ*�[tM�����$F� ?Y��Z�~����I[�i37���oVǎ�X�V�.]Co�$|łh�+C�r�8�2x(��M ��80��e��.n� �y-(��TPR��i`����so8i��$*v-{(�n�he�]5�;��?�I��be�S߭�2�8&24���$�d~
l�P�Y+�2�wnY8��\���Yo�R�.��d/���F"���G�y�(��ϯR8���k�N�MQ�7��Np	V��杳+ {jdS��_��#���),L�3���=��>�Ϩ�O+(K㩑Ν�lw��#�溊8����6~ɱ �1�9ŠA�9����j�%��CR�%{�#����y��T�� E��7���:@8���IEQWv�z�1���T0��ƷvH�\��*����T���n��P찹�	�|1�:�w�4l�"Q�kc3�	�u�R�ije�8��$��iiaM��5N���f�3Nc,�������M�7h7��dld�2>�X�^�	%�s���7f�gKҎJ�WdٓS����s܉<=�B��pe@ 0��Z�4sp'��-l�Mp��9��(��L�7N�4�!������Fʙ~�d��#,q�:Hq�hg �<q�,��\�oEp��/<�`psKNppG#��ܾ�)�b%�jN"piÏ�s�S��(����������0� ?�i��rz�U�i*�OH��8�C������'�´�-�7J9��˙	-i�C\G0"F.Ċ�G-P��l�\XӤ�s�r��D���L�O��B�Y#4��s�8nx��I9��|����-��Ss]M3\��i'P�]َ���qKs���t0K�@	 pH=`���-�4���IC]22s+��q���ꔘ��Ek���j��$��W�������z�?᫿��� �^G���o梿H""(�����Ar�-����Iq�[)j���MRƹ�|A+�l�j�[%��l����ER�9ǟ je.!�"��ۘ���.���Č���Y��� �N=�&�zE�팒(n�>�Q�����$#� �HJ��K���q[�3f�����*e��7W��Fc�����
\��:I��4O|�p�E@~x;�1��t��j��j��8\��mճk��2�9�6��o�G��xpR"efi�"�m��c��T�$4�^��. vd�X�Ch)��gh�1�=H%�� ���%MY}�\��핯f��{u��=b�.�v�CVZ=��\A<��d���iv>NQk֙qތ6�=���\"�u�����Y�Zs��˱Vbq�����""�""" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ������I������7�^���W�%� ����?���E~�DDQT/w����%��Y)*j�ƹ^]����;/f��� /f�QCMm�ӑ.���0A?��WE���.�i�O���W��)�4��3�;� {�Y�ab؋�����U�-eG=n�x�d�rJ��1�}�y�S�=�*�� zZ��7� ᪅��۳����m�|T�h45M�8pi<��~�� zZ��7� �y� �A�F���}d̨�6z�P����`�Q��W�VcV��C����}����m�sYM��,q��j�><�`�g��-�Q�&�ǵW*{�q�%�����_���t#�?ю�[�m���T�}`��<;r�d��i���ѵ��lv2'��3+�s� 8�K�18�c�_��)���g���t��M����]�k^��<�mQ �:�uj#݌/��if���Gm��٧/��pK��9�W���純WZ�7�����:9D�����~���r��\��Pᯔ�-����Nߊ�FD�Z��`���1�~�l��k�tq�^%Kh�y伳�U�j��g�I��Db�t���g �X�^�k�eXh�T;M��K�l���n�ځi/w�sQ8̱�oS˽1m<�I�U�)�4�.�S<�qf�m'�X�@���]�l5~���[+��V�WӍv؉��}��?%���q�	��[+�֪���덫���=�f3���5������芶�z��%-��Z8��n��ñg� 59.��[��Vl5��.O���6/i^=� O��b�n��hY���6YD�:���{
�o���/��~�".N�" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ""~�� ]� ���
�Z?���c5�[G�5w��_�+�h� {�����W�DA�AW�����y���j�L�0H@�.=|;U�Dc�]���}�t1���=ȓXիHw�0�^�6Z���]�u�F�9?j�#9��V�x~m;��O��z]����&l��&66�6�0:�͛�}���e�i6����V��7�ñ��W���i7t�gO�i�x�������ݟ��EM]P��@~rN9���}E�r��-�6?K���T�7M:�!�c=��;cc��a��W5<�]N��q��gR�"���cB�T�%,�o�sTY���g���K����}�&E<ծ�����Ǽ�H�Ye9M�DV�",���������������������������������������������������������������������_��W�%� ����?���{��� ]� ���
�Z?���c5�AaDEPDDED&���F���!gXi8�*L�[�*�d<�LC~��ZxYu� ������c� ���<��+Z�ET�m��9a�����t�; 7'���j�3n���2(j#��H�9 ��sˬ,Q�mr2'6�H���>��T�� Gɒo�i^",ayn������x�Z��v��Lȍ\6��F���8�:8�O�8V��zT5��US?\�=���������5=��Y �'��d��
���{	O�IA��h��f���=���u�44p0Z�Z�+\�M��:���]��.q��C��0������S���*�lL{�K�����ݣt��NnrG&ܲ80#[�3�d��e�����LŚdq��������R�[ݴ7jZ)T[��zuug�g=\� ��MC`�k ��k]'��	����I[����T�׮�� o��d� �8���u*V������K5C��8�N�����	���V^�����<CR�;^��q ;���!c�^h�,s��4q���#i�{3�.kH��Rm-�
�	 ��Q$bm/�%��;ǜ�Oj���K=�8`�=[�.� 5��� �i{� ��JTl_7EMu�����33`���� �1���ў�X?�
{�m���5�ˈ�f8��g��Q�)��z�jW����C��
�h�O(}UU_�ꉱ�;kwLpp���<t���]1isNʮ�IKQ��>WO�Y�_+��!��|VZ*�z�]-4���Z촴��`���r�K�]�ʚVL#-�h$=D�2FA�J�lh��U`�6蔁�DH����S��d��+k[ޖY�w�Su�>Jvk{Zs��xv�W�s���	橎(�hs�ӑ���zJ�aU��6SE�c��ki�\���8��V�S2�Gb���;�#m#w��d �.v@���j�J.����٭��af@՞\��Ud�c!��֘�ҜJĎ �|R��Y砮������HD����pvs\��+%c�5mk�\kT8	�1��{��8�DD�r��TTguP�t���Ո�(��D�@S����vI���V���u�b��I�Y�z��E�O��d ?-M]���K�$M+������7����.Wm�&�mN�9��O�����Yj���`}L̉���d�Wj**�٧�-����t{$���� �;����QSEG) �����	 ��<� >���H���d36oY�ѱѝCSFH'���Oz����NL�s��cpk�y���.#�V��Ͷ�f�|�ٍD�K&1��c���X`��mk��"�z+t���SZK���s�G �An���A[�sb�ő��q�'��Q�)j�t:F��w,/����"��&�����f�n�;���q�\��g�8+/���^Y!0�:}쳜=�Rq�خ��EMΆ�m�M\1I�4��<�㮧��I�Jt��d��x�s��%M�*Z�j+���Xe%;ckN���W���T�_��"��]@@�FѻnZ�[�:��+5����˴4u(k�x��9csY���i�qpV��PEX�W�D'{\��]C���8.���j�	'����!�3`~�o�@�d'Y�8+gp��u�y#���
��>�� n`�WV~�s�gZ�ܺ�K�5U��4��{��4���P��EC!�a�~� 4��$7�1�r��V?d�i�f}]L�F0!W���'�-sE[n��6V�2JX�����G��H����+rr���w�7:YLupG -s�!Z�푍|nk��朂Sr��_y6���?Xn���B,c?tx��̾���E�/~x8i�ϴ�Ռ�	[Z���""�B" """ """ """ """ """ """ """ """ """ """ """ ������I������7�^���W�%� ����?���E~�DDQTW4t���h}\�1hx���AV��EC�ԩ)�}��Mf~8�KUDϚ��C,�9s�N�9��H���PS�ON� �8�h���h�W��۩&�R�RC/~8Z�x���X�[m��s][EMP��h��<B�Q�c�6GF�  ��@X����<L�!�ƀNO�ʈ1��3%tl2�ז�M��8e%s��X*Ӑ&�<ea����!$A�G�J�hj��F$`pvh9�,Ȃ�e��[.�����\c\����!e�����̢����:�a�0ۀ�"�##$nd�k��Z�dz�X*h(꩙OSIO4�lrF��VQAJ��n��{GAIO.1�(ZÎ̀��U�)�d�<a�x�#�DV�am,-�}P������e���+2(!,l��%c^̃��#��SDA�Hb�H�6=�X�4�FWR��l���U[�����$s��B��)Ij��K4�����"t-,o�c(�6�)w�t���N��k;2��ܥ)��(+���QRԽ�t�5����QQR���詠�c���c��+��Ks46V1�8���~ ��(1�T������%�X02NI�Iʌ��J��a���4��ܳ"���k���j��$��W�������z�?᫿��� �^G���o梿H""(�����dv�(��q'�u��6Lo�
��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����#�+;�w���w��R�GhL�Ь���o�n��o�YJ��2;B��gq�	�gq�	e+dv���
����&���%����Yݳ����2�eݡ$_rA�Á_P�h� ��� �K�x-�p1�������� I/�������j+�" ����8����'F�Am�cZ9��E%�8CL�20����y�A4EK��2F9�8{A�i�� �"#�B@x"" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ �8����EN��o�EPDD����� I/�������k޶��j��$��W�����������
"*����IFN����"(�nЊj�k�C���%mC��k�AǹymE=Xٻ}u[��5�KK=$S>G�O�5��$�p]��/X�[(nbp�����%���Pk�#��Kj,b�OA�0z�l5�իv���1��q���Je�?I����uU۽0����m���6fj���@8.�ַ'�WO�t����6��ս�q�ط�` x=��
���Ev����ͥ�cM<�jըK�kbvb]�}�I꠨��f�D�63�{��kQ1��zٙ��n?h�k"c/T�9-$��Y.�"�㥢����ON��a6R��킿�չ�W�.uq�QB��r�RCݥ��2z����f�m5��i��A����"��t�wa�D���+;-�_dZk���p�ڙjf� ���w�۠��>$�Li���'��/5�
��u��<2���MU�]8�,���7��3�\A8 s^�9.R���J�s���ۨj7����`stH�p �7���,�>+�5"",4""" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ �Qҷ�?���GJߔ��
���5�G�5w��_�+�h� {����׽m����I������7�Q_�DU:7|
�����DQDQ{����y�nh�E/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*i|yPM4��<�����A4P�����Ǖ�CK��ʚ_�TE/�*jsׂX�A4DA���o�E:���)�Ak���j��$��W�������z�?᫿��� �^G���o梿H""(��
2tn�%:7|
����za�5���aM �$�G��UTo.ϐf9bt/�����pK�KNs�up�W�YOCnd�N�����`��n:�դ�H���2H���r�s�Ok�9�@��;Uhi*�e��4��W�����A!��H�q�
��^��@ ���MS�THRhKM�L��'#�1�ّ�n�:����dm�w��0i�3���[Y{ӠE���#�UNtU;�H�U%�<4d]ǟ�B	k㒤ѿTO����u����J?$��-U�YIDǹ���lr�{<9�d�9���e�f���Y!�����v	98��h*����zJ�L����c�P9# ���)�[�,Oc�du.~���;r�ÒWR�-Yi�ч�=�u#%��:p �$g'���0ڟQ�����5�)���i9p9#�J-�"��^�Le�8gtq��$�c�z�I��(�" """ """ """ """ """ """ """ """ """ """ """ """ """ ""���MFn�� )A!�rD*:V���PS��[��AT�h� ��� �K�x-�p1�������� I/�������j+�" ���'F�RQ��w�����*�)��^�Hs~������׃�� �5��SQ��A&F�g4;#�=�g��	������qk����f޷��C�M�{�?Ew)�`��5���9�.s�c�<T)�����!��5�w�Ռ�[��?�~��oc��蛢Oc\�0�e��EM�R�Imk$� `sYw����z����EWe��7���R��9lMk���Ѿ�=n/pd�'��U��{�?D޷��C�WtFZx�0���d`����4P�!n�O�_�Y�����z����E`��IRF�[�O����q+�()���!���I��<�m�{�?D޷��C�Tc��	�c%���㆟�9(�AJ�#�зw� ���5�z����7���� �:x[,���95�{�?D޷��C�PM7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����M7����z�����Cz����7����MBn�� )M�{�?E��N!�d����" �Qҷ�?���GJߔ��
���5�D3�wp9����W��q���F�k�cZױ�x� ���Ql5���+c�W9��Ȟ����gĕӢ"(��
2tn�%:7|
����������������������������������������������������������������������������������GJߔ��
u+~S�(*�" �]jju���" ���'F�RQ��w�����+[~�qH�2�I�1��%�=���x.~k�=e��*�<o�{�6;1��׼9����ǭt��ڶ����~�:�u�dei�ه��o�{����@)(7.~Z[�����<���g(���%��]P��k#����9�����WV�f)�j�����:�r^Ƙ���s�y�%ljmv��L�44�Hx�\|HU�l���ڊ�O,�I������#��[ۑ��T�W�ML��k)!�S��������A[�ڻ�W�SEo�zgS�3��~�uD�l.�h�-PPш领h�kCx Ǉc��y���|ul�����Ut�������;ߕ��^EM��V���b��z	i&�0G)p#<��21�.^�ϊ������i�0e�W\�3�A�y���c4V��FU;yR^�lf�D\1�4dx�>��+eȲ�:��
����TO�KF3�����D�O�&&c�ts\�G55d��f��=�h-U.������7i|�9�2j�p�p�u5ttՌkj�᝭9V B%5�ԱC �:EA�� ��ᅖ�;�ڨ�����_��ep/�$c�*�=T�b�%1�S<�G�:]D�	%т���:�ڽ��L!�SEJ��AY� G?��vq��Q#Z �컀�U���4���'#c��'�Pn5Q�F��[�Ì|��a�9ʹw���T�����YX�5�U�"�8de�g�A[*=�t5ԕMG�:����:N�ݩ��qQl����,o/<ȑ����ZDK[a���`��c���2��ѩČoK�����O][Me\�Q��|�0<C]��g���[���Og��J��=�bf;�c\�F����F���/�mµ�:3Z�ў�Z���&y�Ar����Z7�U>�oW���Y�A�'W? ;U����-�1�6�+���S��ia�q<N��-�]�	�dRKL�C�$�����A�XYclQudU�#��\�;�t�C��8%�T�TW���X���qO�<<5���rs�c�im7������Y��[�h��M6���q���p�#]<��鄓��y��?��W��� �M� ;sy~�w���1�LN��",6""" """ """ """ """ """ """ """ """ """ """ """ """ """ �Qҷ�?���GJߔ��
���'Z��]jj(��0�"�(�ѻ�T�d���(.""�""" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ""+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(���=K���I����?0009 Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" Ǚ{��f^�<��"y���9�&e�3�~�" ǪA��� k��)��ܹ�`�/����9�����GJߔ��
u+~S�(*�" �]jju���" ���'F�RQ��w�����*�)����0����WM���Mc�.��]S .�z�1�Y�9��-E�i�wɤ��x���u=����v�j��CAWEMYS5�1S���p�������.��-(���SPӗ	j%�Q�2z��v�쫡����m[��i�Y$�kZ\p�rx�+�EJ�s��Y�tZ�Z�&���ip��WU���H��DQDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DT%��b�0I_LɁ����_EV�_Opl�qp�g@��a�8*t�pU�ZVɹ����ØA��ڒ��*1�f��dPI)!���{B�=Қh���G˝QO$ �������ξ[����s��Aq�܁�R�z��J��3^�h��A��ZU��TmWZ;�r��G=��C�F�q�a�D,��* �]U8w#+�s�t-i*k�Mg�S��$�o��--�[ϗ0T$���ռ�R�O<��lV�����5��H-��� �O`U[|�|QI�p�qM����z�� G��l�k�oTT�2S��I4x��)�F{�q��tUPV�2��F��8x�ٔ&�_�5����$A�`��[��AN��o�EPDD��MB.�5DDQTd���*J2tn�E@���?�SP=0�O���zL�V�v�N�:&�D-q�+K�h˜ᑒ�-y����ܪ�������Hex5�i�Nrp8��D��eu�Q�k���^��\1Vc����L)���N� �Ñ+�dv�m+`�]j)�v�omTQ?}�L�]3����z��
?E/G#�u�ύ���}�_aX?���� �?� �/���Qq=�i�㽯�{�k�_Y�V�en��S�Xl���A!���x�+ϭ7��d�N�j��Y�v�}r�D/���v�k����'e-#�dťͫ��23��ĭ���G[b����#j�|:����j��"k�陘����Y�� f�1� �A�uKW�֑aٻe���; ��פc8�[D�LNs0�D�1""�B" """ """ """ """ """ """ """ """ """ """ """ .N��d��i�^�J i�.��v��OfOQ�8��u��MM�Ÿ�5�6˼t1��Z�n�n���:���gh��Ik�et�j�6��lŧ��]�� vA=evA���=����58�'��H`�{������1�Ǚ>�c*I�s\�WJ ؟5c��Ӳ	$�Lp/���n>�2�ۙUYKw��j�J�F�$��,d����W4g�'~]YGK[������l��������GO<d�LL��ږ����i*����mu�G<��i�p� ��O :՝��2�H�`{���^ �v���� L��C�ck����D�Fd;K��9��ն�ut�J�
J� �4-y�$$d�\���6Y�zI��3Z�dq��1��{��#����GU_B�U�2jjHv��;����y c޷4tt,s(�)���6(�=�YI��ȍ����MU�¦V>����J� ��fz�r�b�'����6A�Z��`���@Ɛ��^����ݏX1����8�+2FTS��S������SI���.O�hq#����m��Ro��F{���`c� f0�2�x9�^�SOT�����i���Cf��ǲmly�d�9�ゑ4LmNV�ښ����*%|O�-,� ��٨��$.�dd�٘Y)�{[��C��;' �ʵSe��N�m�SL�� c�~$�j��
H$1A~�q�5���	{Q[�*���R��7B� �����9"+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(��|��
j�)�" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ""���R��7B� ����9"+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(��|��
j�)��;I�[���訉�Bz7����ϱt+���:+�u+���R3�m���s�-�du�¸��Ǐ�X��}z���6��:�.����|A��HZX4�9�<�r�K�u��I5��QMf��I(�Α���ђ��ˇ�*���l���Z"��I娆	��N�.-q:3�Y����B�z���MD�1���jt����8�3ۜ-�Eד͗��?>^>������+�����ibc��i˞1�{V��r�
ZZW�B���]#�Q�Ζ�. gܬ��6SMG.BZ�@����� ��q�-w���'\)����#Y,oh�p�CH#c�f)�=Q��[}� J��KSCIpeU$M��n�#�{�����9��{��[�lw���*zv��t�����#Pp c�-��r��\j�i5�O ���dqs�ƣ�<1�+��X���_-/�<i2M3�~;�I�ژǵ�?��χ��J��S]p�(M��2w����k�]���W۫+�8lQQ�+Pn1�1���^� Fq���vjO(u�NS3���""" """ """ """ """ """ -.�\j�)�Hh����m9�1�<�j��+�+h�:�v�������F �W[:pg�'.JT��f��S�i�����P��4;�i�[�������S�&s��l1� :���k��h6���f�8�&.����:V��g3�ح��ds9�̷D��L�	o���c�U�S�Eǆ�?����j�{9OZȣm[��{|� �Nr=�*4���-��/���V�xc��<s��� 2��LrC�����i���ē�Uz{el6KQ�6z�	չ{��An���jm����8�����l�k(ꩣ��a�x����C^y5���@��p�kM�\����1)c�d:�d`�ㅒV�^��eE��L��f��t�i�Z��xdI�.K���<��_O!�l�I����Ť3Qo"/��p����-��W�I)�R�i[�#+�Q&�� ���[H��o��������X%V\Z����?u���O�?gg�栳RRԹ��6a�I qΐO09~
ĸ�:"c�`��N"" """ """ """ """ """ ""���R��7B� ����9"+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(��|��
j�)�" """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ """ ""���R��7B� ����9"+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(��|��
j�)�" ""��26��k{\p���ӫ��=GN�
��2��N{)� ��d��編�X��љQ�ɣs� 	S��zu7Wfx��>�6���<�썭��b�V�A޵���oΞ|x+KI=��=%�J+�_[��Qu�=���4���gN�.����ϴ�f:?ASUS�1咽)��9Ѽ85Ø8��.�����?D�r��int���l�2ڹ ����kFA�5�V�h�VQ�����m��P�O]�Md����1��k:b�;��_�մϟ�� s�h����##��.{� ����49���G"�?�^�W>Z����o�QA@�Ug���8=d7<
��ڪ�����*���h�����ܒ@�'��8�#	�l��i���؈��������������������������_�5��Jښٛ;"!�;8nx��T��X�W��Y�9�1�Yྗ47Qp�۞�5F-�6_��`�L�Czp���~�Y^�����틱l���*%���ݻ�	`q�s˙� g<�Y�Ӝf��Z�b���o:Ʋ��V�x�Z�����?����.�J֪�C�L�٤�W�\����z�G�:��3��������it3:H)�B�__y9;���2rr��^���?]�Lцk203��aE�0=���78�������-^�E�F*�ts���R3�8`��g<�.e�)k6��Sk�b���K<�� t$81�K���~
�5)9�\?M"4堑��"��""" """ """ """ """ ""���R��7B� ����9"+~S�()�t��O蠪��qu��E֦����
"*����IFN����"(��|��
j�)�" ��q��iim�dF��$k�u4�O����T��G5ޖ�^�%<o���~��ʮ�C��k�q�M��2�>��;*��<ja�i���+~�UT�I	��h�j{�A��v�m-��u��Hm����O��c�p$���Jwm���i��5�:Y���OM*���-�yr]��8�YS%T�ܐ�iw����Opo���� �s�n.+Z���l�}CM���S]_ uK��	M3�#�'��~����g`|�����v�nR��v�<O�w�6<5�k\�H� sU���W���v�O�+N��x�	�M0�>�X���m��G\�"l,���&�8e��Gfv:�gv��q�2�����Z)`�F��a�<8��]e5lfJI㙀�7YԹ��Ei�b���������4���9�VV��d�5��k栢s��k��L�v0I����uc9�#��m#�4q��6��N����(�D���]��N~�]��KSuuE���)"c��0��`$�M%�v[���m�,��=~*�=�l��C-#� ��"A���r�i�J���s5Դ�x�1��}�N~�秷x+��xg��ǿ������USl�*�>�+�{�un�5;�	��j(.5uW�+ܵpSS�;+XȜ�<��d�h<,�����Y����tu����;]���iD������-��G.��:�I���є��u���+n�so��T�Ǽ�2h�OJ��d����9wGǂ���� k][��`�3LT�n��c�x�h�9�<��Id|�JQ�si���Thn3�i�}�qǟ
��T��jb���q���k�Z��o�:�du��7.1��|�����]:".oh��5[Mp��ڟYL؟�su�L��p�_�i�A�
���˥�Z9^�2M9sy�8�] �z����-{C�y�2�''�Ps���/�8/��2:'Rn7C�/՟�����ZE]�uE��U���5i-�i������QնCKU�?�X�t�W�{�DR�\G�s^oǱ[���*&�ƒ�c�S^]t�C_��x��8�8�<p�m����>�캣S�Nw�an=���;���TGYN�#�� -oģ�t-�mK�)�N㥲 i=��K���ۭ�f�؍��/�sed�0<0�ji���
��l[������K ��e�::S����i��G\�i-Ά*fT�YN�y>�A��֭1�{�89����y�7�DYQ �9�*w�gdm���̲5��ӎM� q�#��UM\.�����$hsO�V��e�������~���8H:���=g�I�N����5��j���7������:�L����5�aǘ@��e�d���y<��)�q�VH[�}��`䞡�d��U550uE;g��K���4���Q<�R��T�-MC�cuUD�t�lXhcxi=�㞵"&%�<�s��U���ܨ�_t��|�SL�6;S��ځᓌp7
˫m��1�tкi䍡��Hn�����V���ESV�mk ����d���� \ӑ��8�_]ftЛuF�zF����i�C�GX �R�ua�᷇]���T�ܩ㫤��e|�MK"i�B�gH.#���
�7��rU�H��VT1���g��H[��c��}Eo��e\��l��'&]��4���N��馤�o�F$IQ�JdƧ����pR�k�\������ߴ�49�9�d־���6���Ԍy{a``q�p�.��N��R��7B� ��$9"H�GJߔ��
u+~S�(*�" �]jju���" ���'F�RQ��w�����*�)����0���������讖ʹ#�JXw��6�=��H���[�A�K�X%���t��H�/��� ,�q�.<GWVU{��]������<4�26�2r�����'�w(�M%96:��B����P����LM��%���y�|H
�e5Eemd�?\�F�kpǂF;\�=�.��j-�zʨb�:wE3$n�[�vN�[tEDD@DDD@DDD@DDD@DDD@DDD@DDD@Z���j�t�3I��3×��l)rc�m���i��tN��Ւ1��ˀ��T_5D�CW8�ܽ�5�.�Î{y����*�T�ؤx�����d����ϳ�H-<����$���ki����$�o� _�#�D�e9Ztr[�*����a�8�{cI- ��u~ku��>L�7Fr��miq ~ ��D��DQDD@DDD@DDD@DDD@DDD@DDD@Q���T�f�_��$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@Q���T�f�_��$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DDD@DT���T5tT�u����:vs#���Au���{d��WWG�P
��C��"pp9eg�_-�k;�:�S��]3� !�9	E�(���]��Z�i�wX*�"n����7� ��U��.��g� ȳ�� eˤ����ԥîE�~�[[���+$��k]��?kA#�j�lۛ5��Mm���WPbeE���2p\��&��\su��"�̏���(��VÑ��M�Cr9�m�;CI�P��B�)*��yx^�d�Êi�f��nEex�'��֗{�I���ƺ�k���"2�����ur���6������ԮuQU�=������s�j�3	pޢ���mm�_c�6��I]$.����|�� �q���׺�Lr8�R���f���g?�I��&%�E�3o��gmׇ6�wpy���8��ᜀ��D�����**�MK�M�����Hfw�dk�[��]3=Q�%[�d�+�(d�Ӛ���v�SA%��>c��%�����<Tt��t���1;C�y�8g<��5e�ӱE�W�G��_^�U��R0o�J[#F��[�g��ǂ�����psOA�)S�O�����������������������7B� ��(�п�($9"H�GJߔ��
u+~S�(*�" �]jju���" ���'F�RQ��w�����*�)����0������lϻAʥ�tnad�c��v_#�X#�>�׫[Z^�/4���]��fY秂��K���2�4�6�	��^���2�������Kh=JF���L?>m�W�j� �hj��?��H},&6iޜx��Җ�Y���꠴���52���1���1����z��4��WMK���$/�����U�b�F��]Y ��)��s�Ï�3�}+�6ƍ����<��,�ޒm�~�Sm,�[*���dqD��D���$ 5u�.�h�U0���h�)N�����HAx�s_�h�:�J���X÷15��8�o���ftZ���<�''�wjk�^f�y�s"��k�4ghn�Tun����4����5�H$uu,���j���WԾ�OP�d��_�����>�o�upǹ{l;\4�S
������vJ�v{dok�Q��9l��]qs=�j#���lm�M�����
Z�_$&���C���<H�r�o@Me.r2��1�t�H��CCp�	����	�w�����9�e I.��. `g-���l��i)���s��c>�=�F�O���p��z��mst|{�u=�k{I�ZM��������%Ca{��I��>�`�G������+팹\#����:c����y F����mnyqq��{��F���3��+�\״9�9��+�u����EQ5j)c���[i{Z���t�j!�G<���Am6\�ꪶѺ������S;�x8��8qVqsǍ3�c1�����o�ѭ�������685�k\yq���:g�-9��[_�܆�4`}���~�R�P[(.��&�A�
��](Ɋ6��4� ���ì�+k���cƜ�LG�� ��1���'���T� �H����QMU���J��M��IW��N$f�	 qVlW���.Ե.x��-��,�.�΢�7S���9t����㛽DE��DDZ}�t1���U���Ǉ<@�/��0y�8��Ke#���N۔����>ӵ9�$����*�֗�6�]�QT�c������GL��&��d�<8-���l���c�i���\5K����͆��XN#����v��6�e�w��ن�:�����N�4���:'���q^�����6�+^�7�kj% |���I4L����k7a�'��1�|�l��9c�������Ί�Cf� ����V�� xj:� �@q]�Yn՛Ys���v���ԮpO��-p�1�Yh9'�9^�g�Q٭�[���(�c�t���ִ���U���U�)䪝�哈/8�N
�gs$aP��vi�/��\h/��>������Ifo�CK]�-�l��l�Su��*��<�7*�k���<Z܀�� e{Ӷj���CC�RO���rz��ji}�%]=Lx�=<��'dv�D�pW%ere��Q��6�j�u���'���i�]�#��ʃ������H=erc�����J��$���z恤6�=��F �xv������k⑥�k�C��
���ݢ�*�ࡎ8�lUi!�c[���p oY��ŭ7�e/����IYN�[��x���|q�01�g!��cH ����44��qR�B�)�n�F���v ���l�Lk"�1���� ��Z� ��󌢡�0���'AR}������ɐ�B�C��ӏ~Qc˔-��F����o�F�����䠥u�[t#¦���srI�]̗vu�}�����-�!�q�ڪ��eэY�]��Z{?��n��H��\@���=��Ú[۞
��'҉nzM<xCϲH����\��T�i��,���vRJt������gFH�&S9E�Ӭ0��=�G3�}in��[۞�4������J(*)��w21�go�dr=���SK+��D)�b��$⚔��H��$|�=�Mn��4eu/@E���*�(j��1J���`����m昘��Fn�� )RQ���Q�$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DD*��ں�QUAK4� d|Ms����� *W+��0��$����1��2NI ��WV��IP��J��)�ٻ��{_��@�E#|c��sIQ%\�s=W-io��IӁÎO1��|��m���52���VF�DA�S�'<8���]��F)����Ddsc"M9hv�xhoq��*o�֋v�����G�<3��e�#I�s�x��U7g���S<v��%�6��ꉦ0�x猞�y/�n�����&2��Ν�f�1�\�񅯨�U:��L��q����i9�x���?9��)�C�un��s#u�8�o��q�vM�
;�*g�J���	�ӢR8� �dF@�n�4V�}B���
*$c�_.����x<NqԷ�MtX��"(�" """ """ ""
8.3��3yO;r3$ji##�Un�Z����L}]��1TIi�3�8-�%�8�8k[d��h^*e��ڞ٪���\59��,�iV礆m�� x�0��@ r����Ί�cD5'gm��ַ2j2o�{�7[�z�z�g<s�|W˖�[.5.���d����(������D�I��;T*�n��ԦXZ�L�p�$5����Vyu*�X-�\�{�q��$#z���0Y�%�u��m.Vp�y���4""
����u,5,k�5��8�3֧IK"Hc� rCG�Y�b�����Z��i�&��� ���j1p���9łfjG�����J�"Ȍ�K���s#I<G���]�ϒ:�Y�^�����坹i#�X*�E����~��h����~\H:�Z1ţ���e��s���6�'�w,�9���v�Z0�1��<�Mםvs�̭����'�@k�a�u8p<�x�B�<��I�vI]�Ȝѩ�#�v ����z�I<*JHjfi�K�o�8�x}}yj��>�ژ+�d�c�>�F4����ɻ3oluSXijJ�w�:t��uc<3�kl���f:3���@������t�����r�[�:/QQji�z�M1�V��
ɴ��Ku��/�l�U�!VǾC+��L�����ᅵE*!�x�I� ��Z��-l[���,�o���ï� ��r_>ġ4΁����px2T��5Ñk��i��H�	��W*4��JzY���i�;�:W���/'W/z�]���!|%��ǹ{�,i �p{���3���)᎞၍�(�ִ` :��`Q���T�f�_��$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@Q���T�f�_��$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@Q���T�f�_��$A���o�E:���)�AN.�5���QaDEPQ��w��(�ѻ�P\DE���aM@���?�S@DDT+o6��m�r�3Z�\	W�7�[Y�z�-����ֽ͂����S�Ā �]"�} Y��]lw흦����fa��]Б��I!�8 �|S��J��^�tֺ!%p�se�ůh�G0��ȷOj���G�S]��}�ۡ�3\�m�x�$'��d�N0	^5C��l����=i�[��{	,3:w�`��_����m5@�l�T�Gg뮢�뉟F���G��e�q�vӎ�s����j�w�~��� �X�/��P�#�n��M/�%C�n�d IwoR���2����$W(�?�Q�86H�7���+��Kx��A����K}��!~��$q��sOnB���6r�d�\i6����M<�\}`3:Y#kCI��c�q�ߺ>q���Y�Q˾~����{O�>�f������|t����E�1p��@p��;7��^v����t�qECcEF���\ r�'��6�e��hn�Oi�ۥ����tS:�Is\X��4���r�;n'ҭ�^ ���m�����S#@~=��c�x��')�}�oPDE��DDD@DDD@DDD@DX�g���Y�xdQ4��<�$�ȋSK���l����&pj#,�������_m��Zژ��C$�2C���Jь���9�R�k�{j��ʺu)����A�s�N ��������[wQQP#�>8#/s�{2A�Y�Qg8�r�"��m-�&F��c�%��\� S��{�ܩ�_o/��o����uz��ۂ�JG�+���b" "�_]Io�M_S4D��သ̟��]=u;g��*�]�$���8���k�3�-��T�K$�-l��\d�� ��9������� Ka��82%-f���3��-�zE��썊������|��\!1��p%�.�z��l5���X���/":�ᒷ�Q���ϑ�N���X}!�虱�jg���S��*�>E	�y��<��,�t�O��\�O�����lO����m���AN�6�W���;�Ku ƀ5{�<{����P�O���ꭑ	&�Eq�e��8��Xp���PA�(&���RR��Wh};�����aia?1�
��a�ϱ����IGSQp���Q�	4o�N�!���V�bb���ҩ=#K-�9h���Sq�����@���d��w 1�^OJa�v�w�ꡪu����R7����Y�!����Z������ccj[����������#�#K>�ܩv�e-�UAj����,�>:����]˸������#n��ߴՖ��������M �Fx��|cZ�5�kF ����""" """ """ """�5|P�CK#%�!���8�nZ�L�[ER�_{&16Fd1=�7I�?�.�=�,d&Zr���~�՜�8-�\�rlQj~ޥ���Y$Ncn��s��@ee�_Tߝ�k�ݖ{��N��ӊ\,𳎍�"*�(�п�*J3t/�J	H�� �Qҷ�?���GJߔ��
���'Z��]jj(��0�"�(�ѻ�T�d���(.""����0��za��)�"";n]=L����W���j}	)�vyHq�|H���H������ԕ���Yu��mm���2����g#'.�E_��Ѿ��hp{u�.����Bˍp���:���R����k����B�t���h�[�x��|a�8Yw���+Im�T�Be0�fWk�K@����W�T�� ������QCi����A��RX ':xGVz�Y�T\_O��<�d�W��5�KC	�9��R���Ki�mC�lQ����H59y�V�U�����ֶf��<7��<����ʺ����������������A���ӱ��e�qkI��<1���̆�5�:vQCS3�'�9� p`��uh�M[a9LM�qvz�n�U�MQ]H��ৣ�f�#���� ~��� j��S�U^=~��*�v��,��ݙ�/q�ui �  Npn��NQ�������nh'����T���Z�F*(ec�m�Wg.�x4�<}�Ú�0�

�V�� q����j}M�4��B܍�ē�q�9/B#<�5tI�y�������8�����j��c��|"���&�Z�Hc\I��e����z}�����q�%+�;����g���'%z:u�e�e��q8�W�_舋/H��5�E>���b�{%���F�rD��`� `y��D=50�ǽ�ǡ�=GK�ާĭ�+�$��"�x��:�UV��poi�
+1��$�D��) �HLRE�#�[���\��&��|���G ����e�j�8�9��5��7B��O��Lp:2]R_��9��یq�Z[�����=�G9�cCG�Y�J��Gs�USG�ro�˵4�;��'� Z��T��t���PӲYɈ���W 4���rQm�q� Dlk%�H�Oj��C,��X�{�:��4�� �,6��[n��s#�A�Z�������������������+�:�����od,��+_q����։7��I ����-�)M㞞����*I��v���#i�9s��������}����:�;�[�R���H�����4�b��$�i\��� [�f�����F=�s�d�t��N(a�K$sִɻ8xd~��~�W�"��sx{L�wj����픵1nf�6����$�mm癹�f�_�%���!�rD*:V���PS��[��AT��SP��MEDU:7|
�����DQP=0�O��L>S��4D@DDR�@��ӷ��<.��cSr0y�#����|6�"����q�S>�;.{�r]��yab�������c㈗�0�s-:rO��[TA����RE�ոB�����### �A�W�b�8��z��j^]P�4���]�--9<yp����J�
H�i#��F����O2I�$䒳�(�" """ """ """ """ """ """ ""�Su4��;⑥�i��Y����]#����{�ܵ�9�c; �9'�X��2JG���z"k�CxcW͎������B���$�W��~�fL��`�� �ˀ?��}��s�㩩���t�����r,��2x��(�t�GMO42(�֎�DDD@DDD@DDD@DDD@DDD@DDD@DD���IFn�� )A!�rD*:V���PS��[��AT��SP��MEDU:7|
�����DQP=0�O��L>S��4D@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DDD@DD���IFn�� )A!�rD*:V���PS��[��AT*�f���ZXw�̏8�@��~�n5U�R�k�������g9^�Z�������5�t�K���� u����#�""��
```

## docs/ui-preview.jpg

```
���� JFIF      �� C 


		
%# , #&')*)-0-(0%()(�� C



(((((((((((((((((((((((((((((((((((((((((((((((((((�� � " ��             �� D 	  �!1abA"Qq2�#�3Br�$R45S��FTU��������           �� ,        !1Aa����Qq�"������   ? �>�                                                                                                                         ��cb���6\8��q�e͓Θ����Y� Ow�O�׊�� �t�� ���4�����}W���8M����&?6�׊� �֟� ����� �A��R��i��9�T��sǴ���J�����^f��?C�W�w���|;���8�yMm�T�z�}�W)�~�9Fqc�@�                                           d�P����p����Y��w&;s<H���                                                      |��&g���6�o3����B����B�����r�
����Ɏq�135����     ��z���VmF{M��佧�3<�1c�l�Ǌ��KO�c����=C�z\[9�lz�.��Y���d�M��h�֝SZLs��>� g�)����N�\��w�m�~�r���hp_6�-�k����/�ݯm�gM��u6�nx�ߝ�KD⭼��~<���}�W��5���iŵo���k5�=?[LVgG�ͧ�|���&�O�޴���i��l�ZG6�q3?��FS2謹����sӟo?�����m.���L��|9+_�m�� ��g�<[���C� �� ��R�}�4��mW���8�}z�'�=�yu���}7������/5�?�i߳l~����31�,L�:LO�G��?~b?���ɩ��x6��96-Ni�Ǩ�~���qoH����쯋C����?��W1��������n&x����O��[��5QO�SUH�L� W3�TG� ����c�Q����z���'(�z�y�1������7M�Ǿ�g_�C��m:ly3���f����k���<3��W_�o�ݵ�t��� KS��^?��9�鈉��~��� 'ڈ���5�DjL��v�K~��|q�J���/q�����`�sLZ��S6�#����>�8�5��v�ś6��Ͷ羚����Z+�y�G�<�|��s��������~'x�I�=���F�9����zۧ�[�g��x����9�w]���S�}V�^���ipţ�c�'��=y���bc��t;.��7�gc��b��i5WŤ�j�q���"�>�3~s�,��O^����n����a�˪�_�^˶�z�Eq�u�����y�o)��z.��݇m߶��>���nu��ю�jڶ�+31��ȵ^5�ς�������wM�3V?5�[Z��KDǔ�8��"}�~(xGk��+������$�S�'Uy�^�GG��qǯ-l��#�gt�L�?T�~8�k��$���nɺj��U�D��Z��rŦ�13s����u<g��� �[�ͼxgv�f�js}-N�Qx� 3�?H����~��� ,c�Msףs��n���'��|���]�M�L�L�Jd�f>�Ǜõ�}o�������;��G��u�Ɵ����W�'˙�癉�M���w�O��_L;��^���G�&׋q�ϔW�o_�q�ng��9^U|�/��گ�3I�k����5�Y�zc�L}�e��l>(�o[��M\m[V]D�S��\�k���Ǘ�>o�~ش>ٴ�f׏��׈�y���i���z�F<���g�PP                               qe��������.���Y��R��jp��i�-��H���n���F�6<W�c��EmO���b���<�|���DF�l���us6����X��ݣk�W.���-V�S��`�s��~Z���W���?~|�4���-��'��3Ũ�ͦ��O��4X��zm�٫������n:m~]^=5�����9y�8�<�E�=N�J��K�ǎw\��m�g7������~���T���#�sa���c�O\ߢ�|�����~^�뇊�-M�޿�ٻ���U����`�u#p�N�:���Vq���������;f{詖��8�ҥoh�ߋLD�y���zt� �E>��:p����G_<���-�����o�1�㩮��G13�����|G��z��hu��g�tDLO�󆵻��u�+��gS���SI��Y����}f����c��]�q�n�:�e����SMj��a�V)�1���,b��Ҁa� ��M�F:�^g��j)33�q�!>��hu96�_�m�.	��u7��x�>:}��ZL�tžm9�W-�C|��+Z�)33�Drc����k�硾[OLR��L�������l�S�;�i��ָ��/�#b)o��^R��K��~�%�-��z�?����c�O�<��ڨK�� �@ 1�޶��4ܴV�6�q��i�ێ}]��#��iâ��E��ѣ�]�,�Ϭ�(�e���������\��Cd�� m��>�.����r��ˋ��1���}�5�ut˦���׏���<DL}�Zu4�>����<�v�UN�uV�>S���̚V�5ٷ}>]�Y����}.KWc��:>��-�O�9e1��m~�O��L������q�g�i�N}�G�6����{�c�O=S�<y5����϶it���J��Y��^"�?��>|�� mۅ�l�W\hu[�,x��#����t����)��e���kp�2e�u�kc���#��S��4��^�M��9t���8�f9��x����MV�/��i�8��|x�d�|v竮��)���8d� 駦�}�$Z���.+~�bz|� ����#,�����                                >[�����n���� �?��$�;޴������4�����33>�s3�1~�~������o�tw��8���Q��o1�s3������x����?��.����:��~�>�}Nu�v� �� k�o�0n�~��mV���Ly�^��KLLLLDD���TR\�yF��O�g�����5�%�skwJj��0����R�<Ÿ�|�c����O�g���[�p      �a���,�5�-5�O�cպ�+�v�>�_�e��m�O���c��c��<��{�_į��V�sͺ�{���3|�kOL�}�Y��g������.�������:�7/�<.��8�����z<_��$b����9�9�?�u�uz� O��O�7��O��S%)�I���窔���}��w� <W� ຎ�� ��m��(��k�.���ɞ����X�c�g,<V�l�'������ �bz-l���>�?�f`���7��<[~��Rbz���r^}g��μ���_U�gCC<���x�� �G�m{��y�7�#iɩ���L�֟���LqϤLy~�����{��_�[�wLzi����~�L�DDyy�G���ЍI�y�%���kh�o�;^�h�F߭����<c�b��o.&���>!��Y���i�����s?Ry�)�5���9�9�G��<7��7�;�m�kӏS<�V<��}�XԜb+�8\ͼ��?���<a��ݰ�ێz��p�迼LD��Snyv6�x�'��G�ľ%�~�t��,���L�\������w�Wl]��¾�v��Mo�u�%�����\����M�㙘���5���5�z�_�Ã|�gɟM��uZ�ꘞ��"x��c����s33���TC��~x�ē���i�>}�H���f�/��X���f|�im?�� �y�C&��:�{n��1�'=�Ls3yyO��9�	C�|O�a�x�gٷF��v����|�<�Zf"x���^?)t6�¿�� ��� ��:�.��Xt�9�����DOϬϧ��B5&:�OW�x���w��o�n����4q�Ŗ&)/9���^#�����ڿ�I�l���>"����O\u�x��ˈ����#�8����/f2�ڻb��7�˩�&�xoU�EΗ5���c��Z|�g��&<����Ҽ����h�E���w�wִ͂d����DO<z���s7}��"��                               �/�G��.J��$s˨�o۷mm5�����"����yV�x�?�fŉ��s��+(���j����e�k͵��>N����G��� "�D��aX� ���^'���@�c�`��m�-�[`���zy� �lX7|�\�3�pe�M��_�c�����xk�t��mf�S��9�Y�e�����bfb�@ `pxGb���|;n*f����M���>��5�&-�ǣ���f�ScQ������G��M��MM>�b�Nzi�����  qҸ��Zֱ��!@0�����V�AՖpk/��&f9���<y1u�>��5��pɏ�j��bk�g��{6�bf:$�OV?zڰn�Z`��-kL��[c�M���<�z���+��p��_<�m>��g&`�هE��j�Z�Yj�$Z|�b8��                                  -�� �?��u-�Ö��#����ߏPt|I�h|E��C�R��6�������u�mqh��Z� q�,��I����8�1�%���Z�[���n�_�=���� y�+0LD����l�i�Z4���HǏ#��c�ڏ�?��|��� y�.<�>�t�'���	                                                                                                                             u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+u��']}�J�G]}�I�_~Ұ�_~�u�ߴ�u�ߴ�u��+                                                                                                                                                                                                                                                        ��w]6ɵ��5����WEz��1�3� ��L�z���o�)�� *c��s��?G��gzm�T���}��}�U��5��ΗM5�Ŏb<�֚Ǭ�y������Ŧ����n�<ڨ�i�ڟNi3_ߛO?�N3_;�K;����[P��3�{��M���v}v-y�N|���DL�3y��~Ε|c�����ߒ�9q믢��h��3N:��-13<}�*Vۈ�t%�}�K�Q�Xŧ˒)�5uw��_�\[b�]� x����u9p�&,����6�\qH����i����Im�h�W��u�.۵hp��,���a�4�1������|I�k�᦯h��O�S�KMD_�m{Ek<u�q��˶n���5�?�pV�$͸V�}.͟�[$L�m_�[�������Ym����e�t{u��Z��N~�L��b�h�8�y}ҦK�mZ��4{����qɦ�i�سd�V�Q\U����~S�W���ٿl��kb��]�[���4ښd���b�>EMYqђo��]���Z�����6H�ä�}��s[��8�nb?~x����5�7�~=.��-�s��OU/Kc�E�Ӊ� �SV_4��>-��W�c���h�j���U��o�X��� ��Y�1����^+��G�x�a��7�,�b���5�mh����6����%�Ϟm�aw���n��h놹#q�[�6㣌v�1��p��'��{Ώg�N����kj-|QX�Zki㯫�c�䈲�/���o�nmU��Ǫϧ�s�c�5����4�                                                                                                       �6�N��f�C8�Q��i�m5�5�[�b&c��h���v��_�bÖ����5��5�~[4L�-J־}1�G����G[y�Ƿ�=?���I�_9v<:,�{f�S�����3h����_f�2�4�v�S��54�5��jL���kq�����vÊ٫���9iZ�kQ�?٩�����،+��+��>�v�m�m�A��JM��SM�SY�f�35����x�Xlx6�_������h�|��9�<�-�ڽ_�����bn���~w�t{x�i�ݯٳ�ɪ�'�iq��R'�j_���s��z➯ݷ���pe˨�=o|צ8�?��آ?��m������-1�9�$cV� d�h����G��L�m1�L���ֵ��$Z#Ӊ��y̶7��z]~�����>}f]N-v�Qjf�Z��ya����,�H�J�1J��B�ϒ1��o�t8�x�o�h�:�M��_9�[�N|�����u1`���^�y��MW�1W�����Y�3z䘎��qN9�?>yz�n6�M����G�m�m~���0���3RsF����t��~�fz��ӟ�#�V�[�q�x����ת�1[Mo����V&#�>��H��S���4"ˏm�Sj�u�^���Ut�z�<E"�N�y�^���VS���w˻g�O�刍.�=s�S���k����^��f&&<���31��L{��De�$�6�=�Ļߴnv����t��7����mj֕�L�u�"<�#�͓f�w-v��-�g�hm��i�g��":m��q���},s�J�TDDqPn���+���� |���J��-� ����|�Gп=V�k���sûw�v-.�G�E�f�}f}Esd�d����6�ig�"�7I��9�G�ͭ�θ4;.�WѨ�L����&�#� h�D��V<��"=ۆ�rŪ�Fa�R�6�VL6�x��f9��|�>����	v� �                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX��[���u������+wX      �����^)�^���ϵ�mH�mY�bb|�N�h�n[��mJ��l֦zF����DyG��<��٭�M����mÆ'>\1����֑5���=#��k��Y�͎�k�rV2Z&լϜ�q���㹓.<U�ɒ��1�x��!��-m��l:����mڜ1�b�<�ӎk1���ƏY�<��j"����s����h�ǬG>�F1=�r��1_8z�Z�b֬M���Ϭ�>[&:�;^�{��Y�;q��}������ͮφ�[ʹ�ã�5��:������#��U���W��#�ⶮi���Fl�8�/�g����Y����&Jb�VK֕����1�:�����c�3h���E�E��I��;��mtÏ.lQJ�ɩ�o�
c�rFJ��8���c�&=|�"�f�ޑ��y4��&�I�j�ǟ-59��Ӷ\O�Ds<b�Lyz������d�6��k��8�O[[�in8��Q��ŭ�M�u8#?М���� �:�9��!֍�l���7�t�#=y�ӎ9�i[�|I��F�4Mbq�+����"�s� ywu:�v���ͫ�;~L���ߔ�z�򘏭��n"���L߫��tU����z�x�����n\u�4�_Q]v��zOM��j�bi�xb|O�[�4��`�������&���g�+nc��[L��nx��-w5��rd�K�Mb&�Y���}Y��a�`ܴ:��i�x3u�k_��-��s1���eˏ;d�z��X�mi�#����i3iu�V��u\3���I�4�s�O۪?�C��۵]�Q{io��h'���� �f��zZy��\.ؙ��5oCq~gѾ_���S���G�י�p�7��6m�W|[|��_W�&G^)^_5������3j�#�h涜���1OE��7��t�� d�-o�g�ۮݪ����&l��Ly�i���fˏ9�[֔�[Zx�j��I�^3�6l8/8����8�"�����X}^���m�<m���V���cD㈵bb��5爞=���غgtշ�^�K��o�������N[�"g��}f�Sy��><����s3��}��������i�O��k2�1V)����ϕ���'��h�=F��[I�l�\�Lz|Wǖ�{�VN|�+?�<��e��ڶӦ�i5Y/M6�k����$Zk��z93�ǃ��i������6]E�ۆ�׃$�3�O�����'�L�z�D-�n�\��C�E��~�(�1Ke��Y����������M�7���Ւ�R�X���Ts^}9��-� G�>M��� ��c�H͋8���t�+3>������m��N=�C��ҙ'G�ǚ�I�����Ts��� vb"�V����L}?R��T�תx�h}�z㥯��ZV9��x��ݨc�s�4������g�zq��u�9���՛K��M�I����'��:x������$�AsM����[��j�9���&1e�Z��o3Y��<Lz�S�tX�Y��f����I��9>�o�5���ϧ�2~�����KVi:����5�s�3���,jf�"Y�h                                                                         7�^)6�\�1^|�ҭ�Vzj����O_���}3_����.�v�cɬ�]ε�0^�Ţ�����^c�9�fg�=�m�ʛ�ԩ��m���o�O�l�� ��=u{���ǟQ��pSp��-v�����q?N�4�G������)m�R��bԴZ����ҫ�������i��>d�m���x�q?�Vb=c��y�y7<���Wp���Q\x�\W��s1����c��%ڛ�M�+6���9����7_��F׺Fm�� 585������[q��\O3�<��Q�x��i��Z�t�1�i��~�����_d�-o�f��_Y��_Zǉ�_>���u��9��5��?��zm�����u��4�p�Ϗ+�/���i[^f�Ӌs6���8���4�Ƨ���X7^<yc6�����Rkh�)�E��h���ĺ�M�?��ɫ��c9�L��lw�q��Z��[ӄ�st|��c�LD~�Զ��Y�ͣ�ML�>�~f�[}H�Vk\q���[6��ݖ�[����;f��+�E��>޵�y�-�y�w����i7Lx�_Q�Kh�;^��x�Mg�����o��y�ZNKd���x���1Y���6�� �%-�'Ș�������i�w\��h�n���b��d�V~����#��~����N�}�a�_��u6�fm���^>�Ϭ� ��Ssk=�������8�L���V+zc���g���� -�������x�X5U��:�,d�LZ��G36��O�y��6�Z�4�F���sgłuەt:~��s���o���c��"'���&}�[]���jV�|u�KZ�����m�1�<�>��&�M���e�    ts�n�-��6�\������?��;��\t�1ֵ�c�ֱ�D~Р8��Z�VrV&��ǜD��O���Lt�^�����O�c��X����5�X�ipj"���q���9v@pi4�m9��O�&y��V&~!����W�%���<�_�^�~x���vÊ�+���9+���1�ǔ�#m�ƫ�1��F�����������`�:R��)Z��ͦ#�����_;ޗ�+k�fki�:���e�L��-+z[�kh�'�,��Lc�i3i������E1��iJ�o=V��:���6,y��2ҷ�����J�pj��}f?����>>y��H�s��(�m�-�tzM>�mZqb�9�x�h.��l81�kN��k�y���ɛ<��5+��kh�%`�X���R�k��1v�ӟ�`:8v��Z�������[�bc���r��JZ�+���������@&��)ZұZ�8���"1�8��J�&ff+yϬ�                                                                           �#�x�p��b�|��[-��3?~"?�����?w�Ȉ�C�>~�>q��} 8}�矹�y�G���� �z>�85:lZ�V�c���8�<�y�7�G�>Ls�q��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           ��
```

## lib/actions/auth.actions.ts

```
'use server';

import { getAuth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await (await getAuth()).api.signUpEmail({ body: { email, password, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry } })

        if (response) {
            try {
                console.log('📤 Sending Inngest event: app/user.created for', email);
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                });
                console.log('✅ Inngest event sent successfully');
            } catch (error) {
                console.error('❌ Failed to send Inngest event:', error);
                // Don't fail signup if email fails
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await (await getAuth()).api.signInEmail({ body: { email, password } })

        // Update lastActiveAt
        if (response) {
            try {
                // Dynamic import or ensure path is correct
                const { connectToDatabase } = await import("@/database/mongoose");
                const mongoose = await connectToDatabase();
                const db = mongoose.connection.db;
                if (db) {
                    await db.collection('user').updateOne(
                        { email },
                        { $set: { lastActiveAt: new Date() } }
                    );
                }
            } catch (err) {
                console.error("Failed to update lastActiveAt", err);
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: 'Sign in failed' }
    }
}

export const signInWithSocial = async (provider: 'google' | 'github') => {
    try {
        const { url } = await (await getAuth()).api.signInSocial({
            body: { provider, callbackURL: '/dashboard', errorCallbackURL: '/sign-in' },
        });
        return { success: true, url }
    } catch (e) {
        console.log('Social sign in failed', e)
        return { success: false, error: `${provider === 'google' ? 'Google' : 'GitHub'} sign in is not available right now.` }
    }
}

export const requestPasswordResetEmail =async ({ email }: { email: string }) => {
    if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
        return { success: false, error: 'Password reset email is not configured.' }
    }

    try {
        const configuredBaseUrl = process.env.BETTER_AUTH_URL;
        const baseUrl = configuredBaseUrl || (
            process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null
        );

        if (!baseUrl) {
            return {
                success: false,
                error: 'BETTER_AUTH_URL must be configured before password reset emails can be sent.',
            }
        }

        await (await getAuth()).api.requestPasswordReset({
            body: {
                email,
                redirectTo: `${baseUrl}/reset-password`,
            },
        });

        return { success: true }
    } catch (e) {
        console.log('Password reset request failed', e)
        return { success: false, error: 'Unable to send password reset email.' }
    }
}

export const resetPasswordWithToken = async (
    { token, newPassword }: { token: string; newPassword: string }
) => {
    try {
        await (await getAuth()).api.resetPassword({
            body: {
                token,
                newPassword,
            },
        });

        return { success: true }
    } catch (e) {
        console.log('Password reset failed', e)
        return { success: false, error: 'Reset link is invalid or expired.' }
    }
}

export const signOut = async () => {
    try {
        await (await getAuth()).api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}


```

## lib/actions/finnhub.actions.ts

```
'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCKS } from '@/lib/constants';
import { cache } from 'react';
import { QUOTE_TTL_SECONDS } from '@/lib/market-data';
import { hasFinnhubQuotes } from '@/lib/markets';
import { getSession } from '@/lib/better-auth/auth';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
// Key pool: each free key has its own 60 req/min, so N keys = N x the quota. Rotated per request.
const FINNHUB_KEYS = (process.env.FINNHUB_API_KEYS || process.env.FINNHUB_API_KEY || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
let nextKeyIndex = 0;
const FETCH_TIMEOUT_MS = 5000;
// Finnhub stalls bursts of parallel requests from one key (measured: 4 at once -> most hang),
// so calls are queued. ponytail: per-instance limiter; a shared queue (Redis) if instances multiply.
const MAX_IN_FLIGHT_PER_KEY = 2;
const MAX_CACHE_ENTRIES = 1000;
const FAILURE_TTL_MS = 60_000;
// Quotes are shared across everyone looking at a symbol: Finnhub cost scales with symbols, not users
const LIVE_QUOTE_TTL = QUOTE_TTL_SECONDS;
// Long-lived responses also go to the Next data cache, which Vercel shares across all instances
const SHARED_CACHE_MIN_TTL = 60;

type FinnhubQuote = {
    c?: number;  // current
    d?: number;  // change
    dp?: number; // change %
    h?: number;  // day high
    l?: number;  // day low
    o?: number;  // open
    pc?: number; // previous close
    t?: number;  // unix time of the last trade
};

type FinnhubCompanyProfile = {
    currency?: string;
    exchange?: string;
    logo?: string;
    marketCapitalization?: number;
    name?: string;
    ticker?: string;
    finnhubIndustry?: string;
    weburl?: string;
};

type SearchStockCandidate = FinnhubSearchResult & {
    __exchange?: string;
};

const FINNHUB_EXCHANGE_SUFFIXES = new Set([
    'AS', 'AT', 'AX', 'BA', 'BK', 'BO', 'BR', 'CO', 'DE', 'F', 'HE', 'HK',
    'IL', 'IS', 'JK', 'JO', 'KL', 'KQ', 'KS', 'L', 'LS', 'MC', 'MI', 'MX',
    'NS', 'NZ', 'OL', 'PA', 'PR', 'SA', 'SI', 'SS', 'ST', 'SW', 'SZ', 'T',
    'TA', 'TO', 'TW', 'TWO', 'V', 'VI', 'WA',
]);

// Thrown instead of calling Finnhub while an endpoint is in its failure cool-down; not worth logging again.
class RecentFailure extends Error {}
const logFailure = (what: string, symbol: string, e: unknown) => {
    if (!(e instanceof RecentFailure)) console.error(`Error fetching ${what} for`, symbol, e);
};

let activeRequests = 0;
const waitingForSlot: (() => void)[] = [];
const inFlight = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { value: unknown; freshUntil: number; failed?: boolean }>();

async function withSlot<T>(run: () => Promise<T>): Promise<T> {
    if (activeRequests >= MAX_IN_FLIGHT_PER_KEY * Math.max(1, FINNHUB_KEYS.length)) await new Promise<void>((resolve) => waitingForSlot.push(resolve));
    activeRequests++;
    try {
        return await run();
    } finally {
        activeRequests--;
        waitingForSlot.shift()?.();
    }
}

// The token travels in a header, so cache keys are the same whichever key served them.
// On 429 the next key in the pool gets a turn.
async function fetchWithKeyPool(url: string, ttl: number) {
    if (FINNHUB_KEYS.length === 0) throw new Error('No Finnhub API key configured (FINNHUB_API_KEYS)');
    let res: Response | null = null;
    for (let attempt = 0; attempt < FINNHUB_KEYS.length; attempt++) {
        const key = FINNHUB_KEYS[nextKeyIndex++ % FINNHUB_KEYS.length];
        res = await fetch(url, {
            headers: { 'X-Finnhub-Token': key },
            // Without a timeout a stalled Finnhub socket holds the page for Node's 300s default
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            ...(ttl >= SHARED_CACHE_MIN_TTL ? { next: { revalidate: ttl } } : { cache: 'no-store' as const }),
        });
        if (res.status !== 429) break;
    }
    return res!;
}

// One network call per URL at a time, however many pages ask for it
function request<T>(url: string, ttl = 0): Promise<T> {
    let pending = inFlight.get(url) as Promise<T> | undefined;
    if (!pending) {
        pending = withSlot(async () => {
            const res = await fetchWithKeyPool(url, ttl);
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`Fetch failed ${res.status}: ${text}`);
            }
            return (await res.json()) as T;
        }).finally(() => inFlight.delete(url));
        inFlight.set(url, pending);
    }
    return pending;
}

// Stale-while-revalidate: after the first fetch nobody waits on Finnhub; expired entries
// are served instantly and refreshed in the background.
async function fetchJSON<T>(url: string, revalidateSeconds = 0): Promise<T> {
    if (!revalidateSeconds) return request<T>(url);

    const store = (entry: { value: unknown; freshUntil: number; failed?: boolean }) => {
        if (responseCache.size >= MAX_CACHE_ENTRIES) responseCache.delete(responseCache.keys().next().value!);
        responseCache.set(url, entry);
    };
    const refresh = () => request<T>(url, revalidateSeconds).then(
        (value) => {
            store({ value, freshUntil: Date.now() + revalidateSeconds * 1000 });
            return value;
        },
        (error) => {
            // A stalling endpoint fails fast for a minute instead of costing every visitor the full timeout.
            // A stale value keeps being served, but its next refresh also waits out the cool-down.
            const existing = responseCache.get(url);
            store(existing && !existing.failed
                ? { value: existing.value, freshUntil: Date.now() + FAILURE_TTL_MS }
                : { value: null, freshUntil: Date.now() + FAILURE_TTL_MS, failed: true });
            throw error;
        },
    );

    const hit = responseCache.get(url);
    if (!hit || (hit.failed && hit.freshUntil < Date.now())) return refresh();
    if (hit.failed) throw new RecentFailure(`Finnhub request failed recently: ${url.split('?')[0]}`);
    if (hit.freshUntil < Date.now()) refresh().catch(() => { /* keep serving the stale value */ });
    return hit.value as T;
}

function getExchangeLabel(symbol: string, exchange?: string) {
    if (exchange?.trim()) {
        return exchange.trim();
    }

    const parts = symbol.split('.');
    const suffix = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';

    if (!suffix) {
        return 'US';
    }

    return FINNHUB_EXCHANGE_SUFFIXES.has(suffix) ? suffix : 'US';
}

export async function getQuote(symbol: string, revalidateSeconds = 0) {
    try {
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}`;
        // Real-time by default; shared views pass a short cache to stay inside Finnhub's 60 req/min
        return await fetchJSON<FinnhubQuote>(url, revalidateSeconds);
    } catch (e) {
        logFailure('quote', symbol, e);
        return null;
    }
}

// Shared, short-lived quotes for anything shown live on screen (pages and /api/quotes)
export async function getLiveQuotes(symbols: string[]) {
    // Symbols the free plan can't price are skipped instead of spending a request on a 403
    const quotes = await Promise.all(symbols.map((s) => (hasFinnhubQuotes(s) ? getQuote(s, LIVE_QUOTE_TTL) : null)));
    return Object.fromEntries(symbols.map((s, i) => [s, quotes[i]?.c ? quotes[i] : null]));
}

export async function getCompanyProfile(symbol: string) {
    // Profiles exist for stocks Finnhub free covers; crypto pairs and non-US listings have none
    if (symbol.includes(':') || !hasFinnhubQuotes(symbol)) return null;
    try {
        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}`;
        // Cache profile for 24 hours
        return await fetchJSON<FinnhubCompanyProfile>(url, 86400);
    } catch (e) {
        logFailure('profile', symbol, e);
        return null;
    }
}

export async function getWatchlistData(symbols: string[]) {
    if (!symbols || symbols.length === 0) return [];

    // Fetch quotes and profiles in parallel
    const promises = symbols.map(async (sym) => {
        const covered = hasFinnhubQuotes(sym);
        const [quote, profile] = covered
            ? await Promise.all([getQuote(sym, LIVE_QUOTE_TTL), getCompanyProfile(sym)])
            : [null, null];

        return {
            symbol: sym,
            price: quote?.c || 0,
            change: quote?.d || 0,
            changePercent: quote?.dp || 0,
            currency: profile?.currency || 'USD',
            name: profile?.name || sym,
            logo: profile?.logo,
            marketCap: profile?.marketCapitalization,
            peRatio: 0 // Finnhub 'quote' and 'profile2' don't easily give real-time PE. Might need 'metric' endpoint, but skipping for now to save rate limits.
        };
    });

    return await Promise.all(promises);
}


export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        if (FINNHUB_KEYS.length === 0) {
            throw new Error('FINNHUB API key is not configured');
        }
        const cleanSymbols = (symbols || [])
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        const maxArticles = 6;

        // If we have symbols, try to fetch company news per symbol and round-robin select
        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch (e) {
                        console.error('Error fetching company news for', sym, e);
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            // Round-robin up to 6 picks
            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;
                    collected.push(formatArticle(article, true, sym, round));
                    if (collected.length >= maxArticles) break;
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                // Sort by datetime desc
                collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
                return collected.slice(0, maxArticles);
            }
            // If none collected, fall through to general news
        }

        // General market news fallback or when no symbols provided
        const generalUrl = `${FINNHUB_BASE_URL}/news?category=general`;
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break; // cap early before final slicing
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;
    } catch (err) {
        console.error('getNews error:', err);
        throw new Error('Failed to fetch news');
    }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        if (FINNHUB_KEYS.length === 0) {
            // If no token, log and return empty to avoid throwing per requirements
            console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
            return [];
        }

        const trimmed = typeof query === 'string' ? query.trim() : '';

        let results: SearchStockCandidate[] = [];

        if (!trimmed) {
            // Shown in the palette on every page, so no API calls: Finnhub's free tier is 60 req/min
            results = POPULAR_STOCKS.map(({ symbol, name, exchange }) => ({
                symbol,
                description: name,
                displaySymbol: symbol,
                type: 'Common Stock',
                __exchange: exchange,
            }));
        } else {
            // A public server action: only signed-in users may spend Finnhub quota on searches
            if (!(await getSession())?.user) return [];
            const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
        }

        const mapped: StockWithWatchlistStatus[] = results
            .map((r) => {
                const upper = (r.symbol || '').toUpperCase();
                const name = r.description || upper;
                const exchangeFromProfile = r.__exchange;
                const exchange = getExchangeLabel(upper, exchangeFromProfile);
                const type = r.type || 'Stock';
                const item: StockWithWatchlistStatus = {
                    symbol: upper,
                    name,
                    exchange,
                    type,
                    isInWatchlist: false,
                };
                return item;
            })
            .slice(0, 15);

        return mapped;
    } catch (err) {
        console.error('Error in stock search:', err);
        return [];
    }
});

```

## lib/actions/profile.actions.ts

```
'use server';

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/better-auth/auth";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";

export type ProfileInput = {
    name: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
};

const isOption = (options: readonly { value: string }[], value: string) => options.some((o) => o.value === value);

// Every call acts on the signed-in user's own session; nothing here takes a user id from the client.
export async function updateProfile(input: ProfileInput) {
    const name = input.name.trim();
    if (name.length < 2 || name.length > 80) return { success: false, error: 'Name must be 2 to 80 characters.' };
    if (!/^[A-Z]{2}$/.test(input.country)) return { success: false, error: 'Pick a country.' };
    if (!isOption(INVESTMENT_GOALS, input.investmentGoals)
        || !isOption(RISK_TOLERANCE_OPTIONS, input.riskTolerance)
        || !isOption(PREFERRED_INDUSTRIES, input.preferredIndustry)) {
        return { success: false, error: 'Pick one option in each group.' };
    }

    try {
        await (await getAuth()).api.updateUser({
            headers: await headers(),
            body: {
                name,
                country: input.country,
                investmentGoals: input.investmentGoals,
                riskTolerance: input.riskTolerance,
                preferredIndustry: input.preferredIndustry,
            },
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e) {
        console.error('Profile update failed', e);
        return { success: false, error: 'Couldn’t save your profile.' };
    }
}

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    try {
        await (await getAuth()).api.changePassword({
            headers: await headers(),
            body: { currentPassword, newPassword, revokeOtherSessions: true },
        });
        return { success: true };
    } catch (e) {
        console.error('Password change failed', e);
        return { success: false, error: 'Current password is incorrect, or the new one is too short.' };
    }
}

```

## lib/better-auth/auth.ts

```
import { betterAuth } from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDatabase} from "@/database/mongoose";
import {nextCookies} from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";
import { sendPasswordResetEmail } from "@/lib/nodemailer/reset-password";


type MongoDb = Parameters<typeof mongodbAdapter>[0];

// Typed from the real config, so additional user fields (country, ...) show up in session types
const createAuth = (database: MongoDb) => betterAuth({
        database: mongodbAdapter(database),
       secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        // Onboarding answers live on the user so the profile page can show and edit them
        user: {
            additionalFields: {
                country: { type: "string", required: false },
                investmentGoals: { type: "string", required: false },
                riskTolerance: { type: "string", required: false },
                preferredIndustry: { type: "string", required: false },
            },
        },
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
            sendResetPassword: async ({ user, url }) => {
                void sendPasswordResetEmail({
                    email: user.email,
                    name: user.name,
                    resetUrl: url,
                }).catch((error) => {
                    console.error('Failed to queue password reset email:', error);
                });
            },
        },
        // Signed session cookie for 5 min: pages stop paying a MongoDB round trip per request.
        // Trade-off: a revoked session can stay valid for up to 5 minutes.
        session: {
            cookieCache: { enabled: true, maxAge: 5 * 60 },
        },
        // No account linking. Sign-up doesn't verify emails, so linking a Google/GitHub identity to an
        // existing account with the same email would let someone pre-register a victim's address and
        // later capture their social sign-in. In Better Auth 1.3 this switch also blocks explicit
        // linking; revisit (email verification or a newer Better Auth) when social sign-in ships.
        account: {
            accountLinking: { enabled: false },
        },
        // Providers stay disabled until their env vars are set
        socialProviders: {
            google: {
                enabled: !!process.env.GOOGLE_CLIENT_ID,
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
            github: {
                enabled: !!process.env.GITHUB_CLIENT_ID,
                clientId: process.env.GITHUB_CLIENT_ID as string,
                clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            },
        },
        plugins: [nextCookies()],
});

let authInstance: ReturnType<typeof createAuth> | null = null;

export const getAuth = async () => {
    if (authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const database = mongoose.connection.db;
    if (!database) {
        throw new Error("MongoDB connection not found!");
    }

    authInstance = createAuth(database);
    return authInstance;
}



// One session lookup per request, shared by layouts, pages and actions
export const getSession = cache(async () => {
    const requestHeaders = await headers();
    if (!requestHeaders.get('cookie')) return null;
    return (await getAuth()).api.getSession({ headers: requestHeaders });
});

// Server actions are public endpoints: never trust a userId sent from the client.
export const requireUserId = async () => {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");
    return session.user.id;
}

```

## lib/domain/aggregate-bars.test.ts

```
import {describe,it,expect} from 'vitest';
import {aggregateBars} from './aggregate-bars';
const bars=[{date:'2023-12-29',open:10,high:14,low:8,close:12,volume:100},{date:'2024-01-02',open:12,high:20,low:11,close:18,volume:200},{date:'2024-01-05',open:18,high:22,low:9,close:10,volume:300},{date:'2024-01-08',open:10,high:15,low:7,close:14,volume:400}];
describe('calendar OHLCV aggregation',()=>{
 it('uses first open, extrema, final close and summed volume within Monday weeks',()=>{expect(aggregateBars(bars,'week')[1]).toEqual({date:'2024-01-02',open:12,high:22,low:9,close:10,volume:500});expect(aggregateBars(bars,'week')).toHaveLength(3);});
 it('separates years and months and preserves input',()=>{expect(aggregateBars(bars,'year')).toHaveLength(2);expect(aggregateBars(bars,'month')[1].volume).toBe(900);expect(bars[1].volume).toBe(200);});
 it('sorts daily rows and handles empty inputs',()=>{expect(aggregateBars([...bars].reverse(),'day')).toEqual(bars);expect(aggregateBars([],'year')).toEqual([]);});
});

```

## lib/domain/aggregate-bars.ts

```
import type {Bar} from './market';
export type CandlePeriod='day'|'week'|'month'|'year';
export function aggregateBars(input:Bar[],period:CandlePeriod):Bar[]{
 const sorted=[...input].sort((a,b)=>a.date.localeCompare(b.date));
 if(period==='day')return sorted;
 const groups=new Map<string,Bar>();
 for(const bar of sorted){
  let key=bar.date.slice(0,period==='year'?4:7);
  if(period==='week'){
   const date=new Date(`${bar.date}T00:00:00Z`);
   date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));
   key=date.toISOString().slice(0,10);
  }
  const current=groups.get(key);
  if(current){current.high=Math.max(current.high,bar.high);current.low=Math.min(current.low,bar.low);current.close=bar.close;current.volume+=bar.volume;}
  else groups.set(key,{...bar});
 }
 return [...groups.values()];
}

```

## lib/domain/market.ts

```
export type Instrument = { id: string; code: string; name: string; market: 'KOSPI' | 'KOSDAQ' | 'US'; currency: 'KRW' | 'USD'; kind: 'stock' | 'etf' };
export type Bar = { date: string; open: number; high: number; low: number; close: number; volume: number };
export type Provenance = { asOf: string; fetchedAt: string; source: string; sourceUrl: string; isMock: boolean };
export type PriceHistory = { instrument: Instrument; bars: Bar[]; provenance: Provenance };
export interface PriceProvider { history(instrument: Instrument): Promise<PriceHistory> }

```

## lib/domain/themes.ts

```
import type {PriceHistory} from './market';
export type Theme={id:string;name:string;description:string;codes:string[];version:number};
export type Period='1w'|'3m'|'6m';
export type Weighting='equal'|'cap';
export function periodStart(end:string,p:Period){const d=new Date(`${end}T00:00:00Z`);if(p==='1w')d.setUTCDate(d.getUTCDate()-7);else{const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-(p==='3m'?3:6));d.setUTCDate(Math.min(day,new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate()));}return d.toISOString().slice(0,10);}
export function calculateTheme(theme:Theme,histories:PriceHistory[],period:Period,weighting:Weighting,caps:Record<string,Record<string,number>>={},commonEnd?:string){
 const series=theme.codes.map(code=>histories.find(h=>h.instrument.code===code));
 const endDate=commonEnd??series.flatMap(h=>h?.bars.at(-1)?.date?[h.bars.at(-1)!.date]:[]).sort()[0]??'';
 const empty={theme,startDate:'',endDate,members:[] as {code:string;name:string;returnPct:number;weight:number;contribution:number}[],index:[] as {date:string;value:number}[],returnPct:null as number|null,reason:''};
 if(!endDate||!series.length||new Set(theme.codes).size!==theme.codes.length||series.some(h=>!h?.bars.length))return {...empty,reason:'구성 종목 자료 부족 또는 중복'};
 const valid=series as PriceHistory[];const target=periodStart(endDate,period);
 const startDate=valid[0].bars.filter(b=>b.date<=target).map(b=>b.date).reverse().find(date=>valid.every(h=>h.bars.some(b=>b.date===date)));
 if(!startDate||valid.some(h=>!h.bars.some(b=>b.date===endDate)))return {...empty,reason:'공통 시작·종료 거래일 자료 부족'};
 const cap=valid.map(h=>caps[h.instrument.code]?.[startDate]);
 if(weighting==='cap'&&cap.some(c=>!Number.isFinite(c)||c<=0))return {...empty,startDate,reason:'시작일 시가총액 자료 없음'};
 const sum=cap.reduce((s,c)=>s+(c??0),0);
 const members=valid.map((h,i)=>{const start=h.bars.find(b=>b.date===startDate)!.close;const end=h.bars.find(b=>b.date===endDate)!.close;const weight=weighting==='equal'?1/valid.length:cap[i]/sum;const returnPct=(end/start-1)*100;return {code:h.instrument.code,name:h.instrument.name,returnPct,weight,contribution:returnPct*weight};});
 if(members.some(m=>!Number.isFinite(m.returnPct)))return {...empty,startDate,reason:'유효하지 않은 가격'};
 const dates=valid[0].bars.filter(b=>b.date>=startDate&&b.date<=endDate).map(b=>b.date);
 if(valid.some(h=>dates.some(date=>!h.bars.some(b=>b.date===date))))return {...empty,startDate,reason:'기간 중 일봉 누락'};
 const index=dates.map(date=>({date,value:100*valid.reduce((s,h,i)=>s+members[i].weight*h.bars.find(b=>b.date===date)!.close/h.bars.find(b=>b.date===startDate)!.close,0)}));
 return {theme,startDate,endDate,members,index,returnPct:members.reduce((s,m)=>s+m.contribution,0),reason:''};
}

```

## lib/providers/dart/index.ts

```
import 'server-only';
import { required } from '@/lib/server/analysis-env';
export async function dartDisclosures(corpCode: string, begin: string, end: string, page = 1) {
  if (!/^\d{8}$/.test(corpCode) || !/^\d{8}$/.test(begin) || !/^\d{8}$/.test(end)) throw new Error('DART 입력 형식 오류');
  const url = new URL('https://opendart.fss.or.kr/api/list.json');
  url.search = new URLSearchParams({ crtfc_key: required('DART_API_KEY'), corp_code: corpCode, bgn_de: begin, end_de: end, page_no: String(page), page_count: '100' }).toString();
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`DART 요청 실패 (${response.status})`);
  const data = await response.json() as { status: string; total_page?: number; list?: { rcept_no: string; report_nm: string; rcept_dt: string }[] };
  if (data.status === '013') return { total_page: 0, list: [] };
  if (data.status !== '000') throw new Error(`DART 오류 (${data.status})`);
  return data;
}

```

## lib/providers/kis/client.ts

```
import 'server-only';
import { required } from '@/lib/server/analysis-env';
import { kisQueued } from '@/lib/server/request-queue';
import { pause } from '@/lib/server/shared-store';
import { kisHost, kisToken } from './token';
export const endpoints = {
  quote: ['/uapi/domestic-stock/v1/quotations/inquire-price', 'FHKST01010100'],
  daily: ['/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', 'FHKST03010100'],
  investor: ['/uapi/domestic-stock/v1/quotations/inquire-investor', 'FHKST01010900'],
  etf: ['/uapi/etfetn/v1/quotations/inquire-price', 'FHPST02400000'],
  holdings: ['/uapi/etfetn/v1/quotations/inquire-component-stock-price', 'FHKST121600C0'],
} as const;
export async function kisRequest<T>(endpoint: keyof typeof endpoints, params: Record<string, string>): Promise<T> {
  const [path, trId] = endpoints[endpoint];
  const token = await kisToken();
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await kisQueued(() => fetch(`${kisHost()}${path}?${new URLSearchParams(params)}`, { cache: 'no-store', signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${token}`, appkey: required('KIS_APP_KEY'), appsecret: required('KIS_APP_SECRET'), tr_id: trId, custtype: 'P' } }));
    if ((response.status === 429 || response.status >= 500) && attempt < 2) { await pause(500 * 2 ** attempt + Math.random() * 200); continue; }
    if (!response.ok) throw new Error(`KIS 요청 실패 (${response.status})`);
    const data = await response.json() as T & { rt_cd: string };
    if (data.rt_cd !== '0') throw new Error('KIS 요청이 거절되었습니다. API 권한·파라미터를 확인하세요.');
    return data;
  }
  throw new Error('KIS 재시도 초과');
}

```

## lib/providers/kis/index.ts

```
import 'server-only';
import type { Bar, PriceProvider } from '@/lib/domain/market';
import { kisRequest } from './client';
export const kisProvider: PriceProvider = {
  async history(instrument) {
    let end = new Date(); const rows = new Map<string, Bar>();
    for (let page = 0; page < 4; page++) {
      const start = new Date(end); start.setUTCDate(start.getUTCDate() - 150);
      const compact = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '');
      const data = await kisRequest<{ output2: Record<string, string>[] }>('daily', { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: instrument.code, FID_INPUT_DATE_1: compact(start), FID_INPUT_DATE_2: compact(end), FID_PERIOD_DIV_CODE: 'D', FID_ORG_ADJ_PRC: '0' });
      const items = data.output2.filter(r => /^\d{8}$/.test(r.stck_bsop_date ?? ''));
      if (!items.length) break;
      for (const row of items) {
        const raw = row.stck_bsop_date; const date = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;
        const bar = { date, open: Number(row.stck_oprc), high: Number(row.stck_hgpr), low: Number(row.stck_lwpr), close: Number(row.stck_clpr), volume: Number(row.acml_vol) };
        if (![bar.open, bar.high, bar.low, bar.close, bar.volume].every(Number.isFinite) || bar.close <= 0) throw new Error('KIS 일봉 필드 검증 실패');
        rows.set(date, bar);
      }
      const earliest = [...rows.keys()].sort()[0]; end = new Date(`${earliest}T00:00:00Z`); end.setUTCDate(end.getUTCDate() - 1);
    }
    const bars = [...rows.values()].sort((a,b) => a.date.localeCompare(b.date));
    if (!bars.length) throw new Error('일봉 자료 없음');
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: new Date().toISOString(), source: 'KIS · 수정주가', sourceUrl: 'https://apiportal.koreainvestment.com/', isMock: false } };
  },
};

```

## lib/providers/kis/token.ts

```
import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { required } from '@/lib/server/analysis-env';
import { keyScope, locked, pause, redis } from '@/lib/server/shared-store';
export const kisHost = () => {
  if (process.env.KIS_ENV === 'demo') return 'https://openapivts.koreainvestment.com:29443';
  if (process.env.KIS_ENV && process.env.KIS_ENV !== 'real') throw new Error('KIS_ENV는 real 또는 demo');
  return 'https://openapi.koreainvestment.com:9443';
};
function encryptionKey() {
  const key = Buffer.from(required('TOKEN_ENCRYPTION_KEY'), 'hex');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY는 64자리 hex');
  return key;
}
function seal(value: string) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}
function unseal(value: string) {
  const data = Buffer.from(value, 'base64'); const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString('utf8');
}
export async function kisToken(): Promise<string> {
  const scope = `kis:${process.env.KIS_ENV ?? 'real'}:${keyScope()}`;
  const read = async () => {
    const raw = await redis().get(`${scope}:token`);
    if (!raw) return null;
    const stored = JSON.parse(raw) as { encrypted: string; expiresAt: number };
    return stored.expiresAt > Date.now() + 300000 ? unseal(stored.encrypted) : null;
  };
  const existing = await read(); if (existing) return existing;
  return locked(`${scope}:token-lock`, async () => {
    const second = await read(); if (second) return second;
    const interval = Math.max(60000, Number(process.env.KIS_TOKEN_MIN_INTERVAL_SECONDS ?? '60') * 1000);
    if (!Number.isFinite(interval)) throw new Error('토큰 발급 간격 설정 오류');
    const last = Number(await redis().get(`${scope}:issued`) ?? 0);
    const wait = Math.max(0, last + interval - Date.now());
    if (wait > 15000) throw new Error('토큰 발급 대기 중입니다. 잠시 후 다시 시도하세요.');
    await pause(wait);
    await redis().set(`${scope}:issued`, String(Date.now()), 'EX', 86400);
    const response = await fetch(`${kisHost()}/oauth2/tokenP`, { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', appkey: required('KIS_APP_KEY'), appsecret: required('KIS_APP_SECRET') }) });
    if (!response.ok) throw new Error(`KIS 토큰 요청 실패 (${response.status})`);
    const data = await response.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token || !data.expires_in || data.expires_in <= 300) throw new Error('KIS 토큰 응답 형식 오류');
    await redis().set(`${scope}:token`, JSON.stringify({ encrypted: seal(data.access_token), expiresAt: Date.now() + data.expires_in * 1000 }), 'EX', data.expires_in);
    return data.access_token;
  });
}

```

## lib/providers/mock/index.ts

```
import type { Instrument, PriceHistory, PriceProvider } from '@/lib/domain/market';
export const instruments: Instrument[] = [
  { id: 'KR:005930', code: '005930', name: '삼성전자', market: 'KOSPI', currency: 'KRW', kind: 'stock' },
  { id: 'KR:000660', code: '000660', name: 'SK하이닉스', market: 'KOSPI', currency: 'KRW', kind: 'stock' },
  { id: 'KR:069500', code: '069500', name: 'KODEX 200', market: 'KOSPI', currency: 'KRW', kind: 'etf' },
  { id: 'US:SPY', code: 'SPY', name: 'SPDR S&P 500 ETF', market: 'US', currency: 'USD', kind: 'etf' },
  ...[['012450','한화에어로스페이스'],['079550','LIG넥스원'],['034020','두산에너빌리티'],['052690','한전기술'],['277810','레인보우로보틱스'],['454910','두산로보틱스']].map(([code,name])=>({id:`KR:${code}`,code,name,market:(code==='277810'?'KOSDAQ':'KOSPI') as 'KOSPI'|'KOSDAQ',currency:'KRW' as const,kind:'stock' as const})),
];
export const mockProvider: PriceProvider = {
  async history(instrument) {
    const seed=[...instrument.code].reduce((s,c)=>s+c.charCodeAt(0),0);
    let close = instrument.currency === 'USD' ? 520 : instrument.kind === 'etf' ? 35000 : 30000+seed*120;
    const bars: PriceHistory['bars'] = [];
    for (let day = 0; day < 420; day++) {
      const date = new Date(Date.UTC(2025, 7, 15 + day));
      if ([0, 6].includes(date.getUTCDay())) continue;
      const open = close; close = open * (1 + (seed%11-4)*0.0006 + Math.sin(day * 1.7 + seed) * 0.012);
      bars.push({ date: date.toISOString().slice(0, 10), open: +open.toFixed(2), high: +(Math.max(open, close) * 1.008).toFixed(2), low: +(Math.min(open, close) * 0.992).toFixed(2), close: +close.toFixed(2), volume: Math.round(1500000 + Math.sin(day) * 600000) });
    }
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: '2026-10-09T10:00:00Z', source: '합성 목업 · 실제 시세 아님', sourceUrl: '', isMock: true } };
  },
};

```

## lib/providers/us/index.ts

```
import 'server-only';
import type { PriceProvider } from '@/lib/domain/market';
import { required } from '@/lib/server/analysis-env';
export const usProvider: PriceProvider = {
  async history(instrument) {
    const to = Math.floor(Date.now()/1000);
    const response = await fetch(`https://finnhub.io/api/v1/stock/candle?${new URLSearchParams({ symbol: instrument.code, resolution: 'D', from: String(to - 400*86400), to: String(to) })}`, { headers: { 'X-Finnhub-Token': required('FINNHUB_API_KEY') }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`미국 일봉 권한 또는 요청 오류 (${response.status})`);
    const d = await response.json() as { s: string; t: number[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[] };
    if (d.s !== 'ok' || !Array.isArray(d.t) || !d.t.length) throw new Error('미국 일봉 자료 없음');
    const bars = d.t.map((t,i) => ({ date: new Date(t*1000).toISOString().slice(0,10), open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v[i] }));
    if (bars.some(b => ![b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite))) throw new Error('미국 일봉 형식 오류');
    return { instrument, bars, provenance: { asOf: bars.at(-1)!.date, fetchedAt: new Date().toISOString(), source: 'Finnhub · 가격수익률', sourceUrl: 'https://finnhub.io/', isMock: false } };
  },
};

```

## lib/server/analysis-env.ts

```
import 'server-only';
export const mockEnabled = () => process.env.USE_MOCK === 'true';
export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`설정 필요: ${name}`);
  return value;
}

```

## lib/server/request-queue.ts

```
import 'server-only';
import { keyScope, locked, pause, redis } from './shared-store';
export async function kisQueued<T>(run: () => Promise<T>): Promise<T> {
  const rate = Number(process.env.KIS_REQUESTS_PER_SECOND ?? '2');
  if (!Number.isFinite(rate) || rate <= 0 || rate > 20) throw new Error('KIS 요청 제한 설정 오류');
  const scope = `kis:${keyScope()}`;
  return locked(`${scope}:queue`, async () => {
    const next = Number(await redis().get(`${scope}:next`) ?? 0);
    await pause(Math.max(0, next - Date.now()));
    await redis().set(`${scope}:next`, String(Date.now() + Math.ceil(1000 / rate)), 'PX', 60000);
    return run();
  });
}

```

## lib/server/shared-store.ts

```
import 'server-only';
import Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import { required } from './analysis-env';
let connection: Redis | undefined;
export const redis = () => connection ??= new Redis(required('REDIS_URL'), { maxRetriesPerRequest: 2, connectTimeout: 5000, lazyConnect: false });
export const keyScope = () => createHash('sha256').update(required('KIS_APP_KEY')).digest('hex').slice(0, 20);
export const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export async function locked<T>(key: string, run: () => Promise<T>): Promise<T> {
  const owner = randomUUID();
  for (let i = 0; i < 100; i++) {
    if (await redis().set(key, owner, 'PX', 30000, 'NX')) {
      try { return await run(); }
      finally { await redis().eval("if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", 1, key, owner); }
    }
    await pause(300);
  }
  throw new Error('공유 작업 잠금 대기 시간 초과');
}
export async function cached<T>(key: string, seconds: number, load: () => Promise<T>): Promise<T> {
  const hit = await redis().get(key);
  if (hit) return JSON.parse(hit) as T;
  return locked(`${key}:lock`, async () => {
    const second = await redis().get(key);
    if (second) return JSON.parse(second) as T;
    const value = await load();
    await redis().set(key, JSON.stringify(value), 'EX', seconds);
    return value;
  });
}

```

## lib/services/analysis.ts

```
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

```

## lib/services/company-catalog.ts

```
import 'server-only';
import {readFile} from 'node:fs/promises';
import {instruments} from '@/lib/providers/mock';
import type {Instrument,PriceHistory} from '@/lib/domain/market';
type Row={FLUC_RT?:string;ISU_CD:string;ISU_NM:string;MKT_NM:string;BAS_DD:string;TDD_OPNPRC:string;TDD_HGPRC:string;TDD_LWPRC:string;TDD_CLSPRC:string;ACC_TRDVOL:string};
export async function companyCatalog(){
 try {const data=JSON.parse(await readFile('data/local/krx-market.json','utf8')) as {asOf:string;rows:Row[]};return {asOf:data.asOf,source:'KRX 일별매매정보',companies:data.rows.map(r=>({id:`KR:${r.ISU_CD}`,code:r.ISU_CD,name:r.ISU_NM,market:r.MKT_NM.includes('KOSDAQ')?'KOSDAQ':'KOSPI',currency:'KRW',kind:'stock'} as Instrument)),rows:data.rows};}
 catch{return {asOf:'',source:'기본 등록 목록',companies:instruments.filter(i=>i.kind==='stock'&&i.market!=='US'),rows:[] as Row[]};}
}
export function krxHistory(company:Instrument,row:Row):PriceHistory {
 const n=(v:string)=>Number(v.replaceAll(',',''));
 const date=`${row.BAS_DD.slice(0,4)}-${row.BAS_DD.slice(4,6)}-${row.BAS_DD.slice(6,8)}`;
 return {instrument:company,bars:[{date,open:n(row.TDD_OPNPRC),high:n(row.TDD_HGPRC),low:n(row.TDD_LWPRC),close:n(row.TDD_CLSPRC),volume:n(row.ACC_TRDVOL)}],provenance:{asOf:date,fetchedAt:'',source:'KRX · 일별매매정보 (하루치)',sourceUrl:'https://openapi.krx.co.kr/',isMock:false}};
}


```

## lib/services/krx-history.ts

```
import 'server-only';
import {readFile} from 'node:fs/promises';
import type {Instrument,PriceHistory,Bar} from '@/lib/domain/market';
export async function storedKrxHistory(instrument:Instrument):Promise<PriceHistory|null>{
 if(!/^[0-9A-Z]{6}$/.test(instrument.code))return null;
 try{const bars=JSON.parse(await readFile(`data/local/krx-history/stocks/${instrument.code}.json`,'utf8')) as Bar[];if(!bars.length)return null;return {instrument,bars,provenance:{asOf:bars.at(-1)!.date,fetchedAt:'',source:'KRX · 원본 일봉 (수정주가 아님)',sourceUrl:'https://openapi.krx.co.kr/',isMock:false}};}catch{return null;}
}

```

## lib/services/themes.ts

```
import 'server-only';
import themes from '@/config/themes.json';
import {analysisHistory} from './analysis';
import {mockEnabled} from '@/lib/server/analysis-env';
import type {PriceHistory} from '@/lib/domain/market';
import {readFile} from 'node:fs/promises';
export async function themeDataset(useKisSnapshot=false){
 if(useKisSnapshot){try{const histories=JSON.parse(await readFile('data/local/theme-prices.json','utf8')) as PriceHistory[];return {themes,histories,caps:{},failures:[],isMock:false};}catch{return {themes,histories:[],caps:{},failures:themes.flatMap(t=>t.codes),isMock:false};}}
 const histories:PriceHistory[]=[];const failures:string[]=[];
 for(const code of [...new Set(themes.flatMap(t=>t.codes))]){try{histories.push(await analysisHistory(code));}catch{failures.push(code);}}
 const caps:Record<string,Record<string,number>>={};
 if(mockEnabled())for(const h of histories)caps[h.instrument.code]=Object.fromEntries(h.bars.map(b=>[b.date,b.close*(100000000+Number(h.instrument.code)*1000)]));
 return {themes,histories,caps,failures,isMock:mockEnabled()};
}

```

## middleware.ts

```
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = new Set(['/', '/about', '/help', '/terms', '/api-docs', '/sponsor', '/manifest.webmanifest', '/sw.js', '/analysis-icon.svg', '/analysis-offline.html']);

export async function middleware(request: NextRequest) {
    if (process.env.USE_MOCK === 'true' && /^\/(themes|flows|etfs|company)(\/|$)/.test(request.nextUrl.pathname)) return NextResponse.next();
    // The marketing site is public
    if (PUBLIC_PATHS.has(request.nextUrl.pathname)) return NextResponse.next();

    const sessionCookie = getSessionCookie(request);

    // Check cookie presence - prevents obviously unauthorized users
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|forgot-password|reset-password|assets).*)',
    ],
};

```

## next.config.ts

```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    turbopack: {
        root: process.cwd(),
    },
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'static2.finnhub.io',
                port: '',
                pathname: '/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    }
};

export default nextConfig;

```

## package.json

```
{
  "name": "Openstock",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "test:db": "node scripts/test-db.mjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@vercel/analytics": "^1.6.1",
    "better-auth": "^1.3.25",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "country-data-list": "^1.5.5",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.3",
    "inngest": "^4.21.0",
    "ioredis": "^6.0.0",
    "lightweight-charts": "^5.2.1",
    "lucide-react": "^0.544.0",
    "mongodb": "^6.20.0",
    "mongoose": "^8.19.0",
    "next": "15.5.7",
    "next-themes": "^0.4.6",
    "nodemailer": "^7.0.6",
    "react": "19.1.0",
    "react-circle-flags": "^0.0.23",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.63.0",
    "react-select-country-list": "^2.2.3",
    "server-only": "^0.0.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/nodemailer": "^7.0.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-select-country-list": "^2.2.3",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5",
    "vitest": "^4.1.0"
  }
}

```

## public/analysis-icon.svg

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#182422"/><path d="M90 360L180 270L260 310L420 130" fill="none" stroke="#16a085" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></svg>

```

## public/analysis-offline.html

```
<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenStock 오프라인</title><body style="background:#182422;color:#d6e8df;font-family:system-ui;padding:24px"><h1>인터넷 연결을 확인하세요</h1><p>최신 분석 데이터는 연결 후 다시 열 수 있습니다.</p><a href="/themes" style="color:#16a085">다시 시도</a><p>본 서비스는 정보 제공 목적이며 투자 권유가 아닙니다</p></body></html>

```

## public/sw.js

```
const CACHE = 'openstock-shell-v1';
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/analysis-offline.html', '/analysis-icon.svg']))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('openstock-shell-') && key !== CACHE).map(key => caches.delete(key))))); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || event.request.mode !== 'navigate' || !/^\/(themes|flows|etfs|company)(\/|$)/.test(url.pathname)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match('/analysis-offline.html')));
});

```

## scripts/backfill-krx.mjs

```
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
dotenv.config({path:'.env.local',quiet:true});
const [start='20100104',finish=new Date().toISOString().slice(0,10).replaceAll('-',''),limitArg='100']=process.argv.slice(2);
const limit=Number(limitArg);if(!/^\d{8}$/.test(start)||!/^\d{8}$/.test(finish)||!Number.isInteger(limit)||limit<1)throw new Error('시작일 종료일 YYYYMMDD, 최대 요청수 필요');
if(!process.env.KRX_API_KEY)throw new Error('KRX_API_KEY 필요');
const root='data/local/krx-history';await fs.mkdir(root,{recursive:true});
const dateOf=s=>new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00Z`);
let requests=0,failed=0;
for(let day=dateOf(start);day<=dateOf(finish);day.setUTCDate(day.getUTCDate()+1)){
 if([0,6].includes(day.getUTCDay()))continue;
 const date=day.toISOString().slice(0,10).replaceAll('-','');
 for(const api of ['stk_bydd_trd','ksq_bydd_trd']){
 const file=`${root}/${date}-${api}.json`;try{await fs.access(file);continue;}catch{}
 if(requests>=limit)break;
 requests++;await new Promise(r=>setTimeout(r,1100));
 try{const res=await fetch(`https://data-dbg.krx.co.kr/svc/apis/sto/${api}?basDd=${date}`,{headers:{AUTH_KEY:process.env.KRX_API_KEY},signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw new Error(`HTTP ${res.status}`);
 const data=await res.json();if(!Array.isArray(data.OutBlock_1))throw new Error('응답 형식 오류');
 const rows=data.OutBlock_1;if(rows.some(r=>r.BAS_DD!==date||!/^[0-9A-Z]{6}$/.test(r.ISU_CD)))throw new Error('레코드 검증 오류');
 await fs.writeFile(`${file}.tmp`,JSON.stringify(rows));await fs.rename(`${file}.tmp`,file);
 console.log(JSON.stringify({date,api,records:rows.length}));
 }catch(e){failed++;console.log(JSON.stringify({date,api,error:e instanceof Error?e.message:'수집 실패'}));}
 }
 if(requests>=limit)break;
}
// Build per-security index from completed day files. Empty days are excluded.
const securities=new Map();let latestDate='',latestRows=[];
for(const file of (await fs.readdir(root)).filter(f=>/^\d{8}-.*\.json$/.test(f)).sort()){
 const rows=JSON.parse(await fs.readFile(`${root}/${file}`,'utf8'));
 for(const r of rows){const n=v=>Number(String(v).replaceAll(',',''));const close=n(r.TDD_CLSPRC);if(!Number.isFinite(close)||close<=0)continue;
 const date=`${r.BAS_DD.slice(0,4)}-${r.BAS_DD.slice(4,6)}-${r.BAS_DD.slice(6,8)}`;
 const bars=securities.get(r.ISU_CD)??new Map();const bar={date,open:n(r.TDD_OPNPRC),high:n(r.TDD_HGPRC),low:n(r.TDD_LWPRC),close,volume:n(r.ACC_TRDVOL)};
 if(Object.values(bar).slice(1).every(Number.isFinite))bars.set(date,bar);securities.set(r.ISU_CD,bars);
 }
 if(rows.length){const d=rows[0].BAS_DD;if(d>latestDate){latestDate=d;latestRows=[];}if(d===latestDate)latestRows.push(...rows);}
}
await fs.mkdir(`${root}/stocks`,{recursive:true});
for(const [code,bars] of securities){const file=`${root}/stocks/${code}.json`;await fs.writeFile(`${file}.tmp`,JSON.stringify([...bars.values()].sort((a,b)=>a.date.localeCompare(b.date))));await fs.rename(`${file}.tmp`,file);}
await fs.writeFile(`${root}/status.json`,JSON.stringify({start,requestedEnd:finish,requests,failed,securities:securities.size,updatedAt:new Date().toISOString()}));
console.log(JSON.stringify({requests,failed,securities:securities.size,limitReached:requests>=limit}));

```

## scripts/check-krx.mjs

```
import dotenv from 'dotenv';
dotenv.config({path:'.env.local',quiet:true});
const key=process.env.KRX_API_KEY;
if(!key){console.log('KRX_API_KEY 설정 없음');process.exit(1);}
console.log('KRX_API_KEY 설정 확인 (값 비공개)');
for(const api of ['stk_bydd_trd','ksq_bydd_trd']) {
 try {
 const res=await fetch(`https://data-dbg.krx.co.kr/svc/apis/sto/${api}?basDd=20261008`,{headers:{AUTH_KEY:key},signal:AbortSignal.timeout(15000)});
 const body=await res.text();
 let parsed;try{parsed=JSON.parse(body);}catch{}
 const rows=parsed?.OutBlock_1;
 // Do not print raw bodies: upstream errors could echo credentials.
 console.log(JSON.stringify({api,httpStatus:res.status,records:Array.isArray(rows)?rows.length:null,responseType:res.headers.get('content-type'),valid:Array.isArray(rows)&&rows.length>0}));
 } catch {console.log(JSON.stringify({api,error:'네트워크 또는 응답 시간 초과'}));}
}

```

## scripts/collect-krx.mjs

```
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
dotenv.config({path:'.env.local',quiet:true});
const date=process.argv[2];
if(!/^\d{8}$/.test(date??''))throw new Error('기준일 YYYYMMDD 필요');
if(!process.env.KRX_API_KEY)throw new Error('KRX_API_KEY 필요');
const rows=[];
for(const api of ['stk_bydd_trd','ksq_bydd_trd']){
 const res=await fetch(`https://data-dbg.krx.co.kr/svc/apis/sto/${api}?basDd=${date}`,{headers:{AUTH_KEY:process.env.KRX_API_KEY},signal:AbortSignal.timeout(15000)});
 if(!res.ok)throw new Error(`KRX HTTP ${res.status}`);
 const data=await res.json();if(!Array.isArray(data.OutBlock_1)||!data.OutBlock_1.length)throw new Error('빈 응답: 거래일과 승인 상태 확인');
 for(const r of data.OutBlock_1){if(!/^[0-9A-Z]{6}$/.test(r.ISU_CD)||!r.ISU_NM||r.BAS_DD!==date)throw new Error('종목 형식 오류');rows.push(r);}
}
await fs.mkdir('data/local',{recursive:true});
await fs.writeFile('data/local/krx-market.tmp',JSON.stringify({asOf:date,rows}));
await fs.rename('data/local/krx-market.tmp','data/local/krx-market.json');
console.log(JSON.stringify({asOf:date,records:rows.length}));

```

## scripts/collect-theme-prices.mjs

```
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
dotenv.config({path:'.env.local',quiet:true});
const themes=JSON.parse(await fs.readFile('config/themes.json','utf8'));
const key=process.env.KIS_APP_KEY,secret=process.env.KIS_APP_SECRET;
const host=process.env.KIS_ENV==='demo'?'https://openapivts.koreainvestment.com:29443':'https://openapi.koreainvestment.com:9443';
const names={'005930':'삼성전자','000660':'SK하이닉스','012450':'한화에어로스페이스','079550':'LIG넥스원','034020':'두산에너빌리티','052690':'한전기술','277810':'레인보우로보틱스','454910':'두산로보틱스'};
async function collect(){
 if(!key||!secret)throw new Error('키 설정 필요');
 const tokenResponse=await fetch(`${host}/oauth2/tokenP`,{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json'},body:JSON.stringify({grant_type:'client_credentials',appkey:key,appsecret:secret})});
 if(!tokenResponse.ok)throw new Error('토큰 요청 실패');
 const token=await tokenResponse.json();if(!token.access_token)throw new Error('토큰 형식 오류');
 const histories=[];
 for(const code of [...new Set(themes.flatMap(t=>t.codes))]){
  let end=new Date();const rows=new Map();
  for(let page=0;page<3;page++){
   const start=new Date(end);start.setUTCDate(start.getUTCDate()-180);
   const compact=d=>d.toISOString().slice(0,10).replaceAll('-','');
   await new Promise(resolve=>setTimeout(resolve,1200));
   const params=new URLSearchParams({FID_COND_MRKT_DIV_CODE:'J',FID_INPUT_ISCD:code,FID_INPUT_DATE_1:compact(start),FID_INPUT_DATE_2:compact(end),FID_PERIOD_DIV_CODE:'D',FID_ORG_ADJ_PRC:'0'});
   let data;
   for(let attempt=0;attempt<3;attempt++){
    const res=await fetch(`${host}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${params}`,{signal:AbortSignal.timeout(10000),headers:{authorization:`Bearer ${token.access_token}`,appkey:key,appsecret:secret,tr_id:'FHKST03010100',custtype:'P'}});
    if(res.ok){data=await res.json();if(data.rt_cd==='0')break;console.log(JSON.stringify({code,step:'daily',errorCode:data.msg_cd}));}else console.log(JSON.stringify({code,httpStatus:res.status}));
    await new Promise(resolve=>setTimeout(resolve,1500*2**attempt));
   }
   if(!data||data.rt_cd!=='0')throw new Error('일봉 응답 오류');
   const valid=(data.output2??[]).filter(r=>/^\d{8}$/.test(r.stck_bsop_date??''));if(!valid.length)break;
   for(const r of valid){const raw=r.stck_bsop_date;const date=`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;const b={date,open:Number(r.stck_oprc),high:Number(r.stck_hgpr),low:Number(r.stck_lwpr),close:Number(r.stck_clpr),volume:Number(r.acml_vol)};if(![b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite)||b.close<=0)throw new Error('가격 검증 실패');rows.set(date,b);}
   end=new Date(`${[...rows.keys()].sort()[0]}T00:00:00Z`);end.setUTCDate(end.getUTCDate()-1);
  }
  const bars=[...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));if(!bars.length)throw new Error('일봉 없음');
  histories.push({instrument:{id:`KR:${code}`,code,name:names[code]??code,market:code==='277810'?'KOSDAQ':'KOSPI',currency:'KRW',kind:'stock'},bars,provenance:{asOf:bars.at(-1).date,fetchedAt:new Date().toISOString(),source:'KIS · 수정주가',sourceUrl:'https://apiportal.koreainvestment.com/',isMock:false}});
  console.log(JSON.stringify({code,records:bars.length,asOf:bars.at(-1).date}));
 }
 await fs.mkdir('data/local',{recursive:true});await fs.writeFile('data/local/theme-prices.json.tmp',JSON.stringify(histories));await fs.rename('data/local/theme-prices.json.tmp','data/local/theme-prices.json');
 console.log('KIS 테마 가격 스냅샷 저장 완료. 키·토큰은 저장하지 않았습니다.');
}
collect().catch(()=>{console.error('수집 실패: KIS 설정·네트워크·데이터 권한을 확인하세요. 기존 스냅샷은 유지됩니다.');process.exitCode=1;});

```

## scripts/export-foundation.mjs

```
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const modified = execFileSync('git',['diff','--name-only'],{ encoding:'utf8' }).trim().split('\n');
const created = execFileSync('git',['ls-files','--others','--exclude-standard'],{ encoding:'utf8' }).trim().split('\n');
const files = [...new Set([...modified,...created,'.env.example'])].filter(p => p && !p.endsWith('-full-code.md') && p !== 'package-lock.json' && !p.startsWith('.env.local')).sort();
let output = '# 2단계 생성·수정 파일 전체\n\n원본 upstream: 38da6d45e714b36b1cf56e945c290b70684eb03b\n\npackage-lock.json 전체는 ../package-lock.json 파일에 포함됩니다.\n\n';
for (const file of files) output += `## ${file}\n\n\`\`\`\n${fs.readFileSync(file,'utf8')}\n\`\`\`\n\n`;
fs.writeFileSync('docs/foundation-full-code.md',output);

```

## scripts/setup-foundation.mjs

```
import fs from 'node:fs';
const edit = (path, transform) => fs.writeFileSync(path, transform(fs.readFileSync(path, 'utf8')));
edit('lib/better-auth/auth.ts', s => s.replace('export const auth = await getAuth();', '').replace('async () => auth.api.getSession', 'async () => (await getAuth()).api.getSession'));
edit('lib/actions/auth.actions.ts', s => s.replace('import { auth }', 'import { getAuth }').replaceAll('auth.api.', '(await getAuth()).api.'));
fs.writeFileSync('app/api/auth/[...all]/route.ts', `import { getAuth } from '@/lib/better-auth/auth';\nimport { toNextJsHandler } from 'better-auth/next-js';\nexport async function GET(request: Request) { return toNextJsHandler(await getAuth()).GET(request); }\nexport async function POST(request: Request) { return toNextJsHandler(await getAuth()).POST(request); }\n`);
edit('lib/actions/finnhub.actions.ts', s => s.replace('process.env.NEXT_PUBLIC_FINNHUB_API_KEY || ', ''));
edit('app/(root)/layout.tsx', s => s.replace('const Layout =', `import AnalysisNavigation from '@/components/analysis/AnalysisNavigation';\nimport { mockEnabled } from '@/lib/server/analysis-env';\nconst Layout =`).replace('    const session = await getSession();', `    if (mockEnabled()) return <div className="mx-auto max-w-6xl p-4 sm:p-8"><AnalysisNavigation/>{children}<footer className="mt-8 border-t pt-4 text-xs">본 서비스는 정보 제공 목적이며 투자 권유가 아닙니다</footer></div>;\n    const session = await getSession();`).replace('                {children}', '                <AnalysisNavigation/>{children}<footer className="mt-8 text-xs">본 서비스는 정보 제공 목적이며 투자 권유가 아닙니다</footer>'));
edit('middleware.ts', s => s.replace('    // The marketing site is public', `    if (process.env.USE_MOCK === 'true' && /^\\/(themes|flows|etfs|company)(\\/|$)/.test(request.nextUrl.pathname)) return NextResponse.next();\n    // The marketing site is public`));
edit('components/shell/TabBar.tsx', s => s.replace("    '/dashboard': 'Overview',", "    '/themes': '테마',\n    '/flows': '수급',\n    '/etfs': 'ETF',\n    '/company/005930': '기업 분석',\n    '/dashboard': 'Overview',"));
edit('app/globals.css', s => s + `\nhtml.analysis-light { --page: #f4f7f5; --canvas: #fff; --card: #fff; --text: #173127; --muted: #496358; --line: #ccd9d2; color-scheme: light; background: #f4f7f5; color: #173127; }\n`);
edit('package.json', s => { const p = JSON.parse(s); p.scripts.typecheck = 'tsc --noEmit'; return JSON.stringify(p, null, 2)+'\n'; });

```

## scripts/verify-kis.mjs

```
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
const env = process.env;
if (!env.KIS_APP_KEY || !env.KIS_APP_SECRET) throw new Error('KIS 서버 키 설정이 필요합니다.');
if (!['real', 'demo'].includes(env.KIS_ENV ?? 'real')) throw new Error('KIS_ENV 설정 오류');
const base = env.KIS_ENV === 'demo' ? 'https://openapivts.koreainvestment.com:29443' : 'https://openapi.koreainvestment.com:9443';
// One-time diagnostic: token lives only in this process. No key or token is printed or saved.
async function verify() {
  const response = await fetch(`${base}/oauth2/tokenP`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET }) });
  if (!response.ok) { console.log(JSON.stringify({ step: 'token', ok: false, httpStatus: response.status })); return; }
  const token = await response.json();
  if (!token.access_token) { console.log(JSON.stringify({ step: 'token', ok: false, code: token.error_code ?? 'invalid_response' })); return; }
  console.log(JSON.stringify({ step: 'token', ok: true, expiresInSeconds: token.expires_in }));
  const tests = [
    { name: 'quote', path: 'inquire-price', tr: 'FHKST01010100', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930' } },
    { name: 'daily', path: 'inquire-daily-itemchartprice', tr: 'FHKST03010100', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930', FID_INPUT_DATE_1: '20261001', FID_INPUT_DATE_2: '20261009', FID_PERIOD_DIV_CODE: 'D', FID_ORG_ADJ_PRC: '0' } },
    { name: 'investor', path: 'inquire-investor', tr: 'FHKST01010900', params: { FID_COND_MRKT_DIV_CODE: 'J', FID_INPUT_ISCD: '005930' } },
  ];
  for (const test of tests) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = await fetch(`${base}/uapi/domestic-stock/v1/quotations/${test.path}?${new URLSearchParams(test.params)}`, { signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${token.access_token}`, appkey: env.KIS_APP_KEY, appsecret: env.KIS_APP_SECRET, tr_id: test.tr, custtype: 'P' } });
    if (!result.ok) { console.log(JSON.stringify({ step: test.name, ok: false, httpStatus: result.status })); continue; }
    const data = await result.json();
    const rows = test.name === 'daily' ? data.output2 : data.output;
    const validRows = Array.isArray(rows) ? rows.filter(row => row.stck_bsop_date) : [];
    console.log(JSON.stringify({ step: test.name, ok: data.rt_cd === '0', code: data.msg_cd, records: Array.isArray(rows) ? validRows.length : undefined, latestDate: validRows[0]?.stck_bsop_date, fields: test.name === 'investor' ? Object.keys(validRows[0] ?? {}) : undefined }));
  }
}
verify().catch(() => { console.error('KIS 연결 확인 실패: 네트워크·응답·서버 설정을 확인하세요. 비밀값은 출력하지 않았습니다.'); process.exitCode = 1; });

```

## tests/foundation.test.ts

```
import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.mock('server-only', () => ({}));
const memory = new Map<string,string>();
const fakeRedis = { get: vi.fn(async (key: string) => memory.get(key) ?? null), set: vi.fn(async (key: string, value: string) => { memory.set(key,value); return 'OK'; }) };
vi.mock('@/lib/server/shared-store', () => ({ redis: () => fakeRedis, keyScope: () => 'test', pause: async () => {}, locked: async (_key: string, run: () => Promise<unknown>) => run() }));
import { kisToken } from '@/lib/providers/kis/token';
import { instruments, mockProvider } from '@/lib/providers/mock';
describe('foundation', () => {
  beforeEach(() => { memory.clear(); vi.stubEnv('KIS_APP_KEY','test'); vi.stubEnv('KIS_APP_SECRET','test'); vi.stubEnv('TOKEN_ENCRYPTION_KEY','ab'.repeat(32)); });
  it('stores encrypted tokens and reuses a valid token', async () => {
    const fetcher = vi.fn(async () => Response.json({ access_token:'secret-test-token', expires_in:86400 }));
    vi.stubGlobal('fetch',fetcher);
    expect(await kisToken()).toBe('secret-test-token');
    expect([...memory.values()].join('')).not.toContain('secret-test-token');
    expect(await kisToken()).toBe('secret-test-token');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects incomplete token responses', async () => {
    vi.stubGlobal('fetch',vi.fn(async () => Response.json({ access_token:'token' })));
    await expect(kisToken()).rejects.toThrow('형식');
  });
  it('has deterministic ascending OHLC bars in mock mode', async () => {
    const first = await mockProvider.history(instruments[0]);
    expect(first).toEqual(await mockProvider.history(instruments[0]));
    expect(first.bars.length).toBeGreaterThan(250);
    expect(first.bars.every((b,i,all) => b.low <= Math.min(b.open,b.close) && b.high >= Math.max(b.open,b.close) && (i === 0 || b.date > all[i-1].date))).toBe(true);
  });
});

```

## tests/themes.test.ts

```
import {expect,it} from 'vitest';
import {calculateTheme,periodStart,type Theme} from '@/lib/domain/themes';
import type {PriceHistory} from '@/lib/domain/market';
const theme:Theme={id:'test',name:'test',description:'',codes:['a','b'],version:1};
function h(code:string,end:number):PriceHistory{return {instrument:{id:code,code,name:code,market:'KOSPI',currency:'KRW',kind:'stock'},bars:[['2026-01-01',100],['2026-04-01',end]].map(([date,price])=>({date:String(date),open:Number(price),high:Number(price),low:Number(price),close:Number(price),volume:1})),provenance:{asOf:'2026-04-01',fetchedAt:'',source:'test',sourceUrl:'',isMock:true}};}
it('equal weights and index',()=>{const r=calculateTheme(theme,[h('a',110),h('b',95)],'3m','equal');expect(r.returnPct).toBeCloseTo(2.5);expect(r.index[0].value).toBe(100);expect(r.index.at(-1)!.value).toBeCloseTo(102.5);});
it('start-cap weights and contribution sum',()=>{const r=calculateTheme(theme,[h('a',110),h('b',95)],'3m','cap',{a:{'2026-01-01':80},b:{'2026-01-01':20}});expect(r.returnPct).toBeCloseTo(7);expect(r.members.reduce((s,m)=>s+m.contribution,0)).toBeCloseTo(7);});
it('rejects missing caps',()=>{expect(calculateTheme(theme,[h('a',110),h('b',95)],'3m','cap').returnPct).toBeNull();});
it('never drops missing members',()=>{expect(calculateTheme(theme,[h('a',110)],'3m','equal').returnPct).toBeNull();});
it('clamps months',()=>{expect(periodStart('2026-05-31','3m')).toBe('2026-02-28');expect(periodStart('2026-04-01','1w')).toBe('2026-03-25');});
it('rejects zero initial prices',()=>{const a=h('a',110);a.bars[0].close=0;expect(calculateTheme(theme,[a,h('b',95)],'3m','equal').returnPct).toBeNull();});

```

