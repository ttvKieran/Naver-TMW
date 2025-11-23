export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/courses/:path*',
    '/my-roadmap/:path*',
  ],
};
