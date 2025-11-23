
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user is authenticated and tries to access login or register, redirect to dashboard
    const isAuth = !!req.nextauth.token;
    const isAuthPage = 
      req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/register');

    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuth = !!token;
        const isAuthPage = 
          req.nextUrl.pathname.startsWith('/login') || 
          req.nextUrl.pathname.startsWith('/register');
        
        // Allow access to auth pages regardless of authentication status
        // (The middleware function above handles the redirect if they ARE authenticated)
        if (isAuthPage) return true;

        // For other protected routes, require authentication
        return isAuth;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/courses/:path*',
    '/my-roadmap/:path*',
    '/login',
    '/register',
  ],
};
