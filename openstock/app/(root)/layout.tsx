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

