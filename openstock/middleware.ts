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
