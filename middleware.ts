
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Protect /admin-db paths
    if (req.nextUrl.pathname.startsWith('/admin-db') || req.nextUrl.pathname.startsWith('/api/admin') || req.nextUrl.pathname.startsWith('/admin-logs') || req.nextUrl.pathname.startsWith('/audit-dashboard') || req.nextUrl.pathname === '/monitor.html') {
        const authHeader = req.headers.get('authorization');

        if (authHeader) {
            const authValue = authHeader.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            if (user === 'admin' && pwd === 'VTracker2026!') {
                return NextResponse.next();
            }
        }

        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin-db/:path*', '/api/admin/:path*', '/admin-logs/:path*', '/audit-dashboard/:path*', '/monitor.html'],
};
