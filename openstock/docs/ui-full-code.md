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
import FoundationPage from '@/components/analysis/FoundationPage';
export default async function Page({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; return <FoundationPage title="AI 기업 분석" next="DART 재무·공시·문장별 근거 요약" code={code}/>; }

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
  return <header className="analysis-topbar"><Link href="/themes?source=kis" className="analysis-brand"><span className="brand-mark"><ChartNoAxesCombined size={22}/></span>OpenStock</Link><nav className="analysis-tabs" aria-label="주식 분석">{[['/themes?source=kis','테마'],['/flows','수급'],['/etfs','ETF'],['/company/005930','기업 분석']].map(([href,label])=><Link key={href} href={href} aria-current={path.startsWith(href.split('?')[0])?'page':undefined}>{label}</Link>)}</nav><button className="ui-icon-button" onClick={onToggle} aria-label={dark?'라이트 모드':'다크 모드'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button></header>;
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

