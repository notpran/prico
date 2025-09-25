import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/(auth)(.*)',
  '/projects',
  '/communities'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next internals and static files, protect everything else
    '/((?!_next|.*\.(?:png|jpg|jpeg|svg|ico|css|js)).*)',
  ],
};
