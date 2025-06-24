import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Early return for index page to improve performance
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    // Handle Supabase error
    if (error) {
      console.error('Supabase auth error:', error.message);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect to index if no session
    if (!session) {
      const redirectUrl = new URL('/', request.url);
      // Add a return_to parameter to redirect back after login
      redirectUrl.searchParams.set('return_to', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Specify which routes to run the middleware on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};