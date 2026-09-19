import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is trying to access auth routes (protected routes)
  // Exclude onboarding-flow from auth routes since it's in the guest folder
  const isOnboardingFlow = pathname.startsWith('/pages/onboarding-flow');
  const isAuthRoute = (pathname.startsWith('/pages') && !isOnboardingFlow) ||
                      pathname.startsWith('/apps') ||
                      pathname.startsWith('/crm') ||
                      pathname.startsWith('/collaboration') ||
                      pathname.startsWith('/academy') ||
                      pathname.startsWith('/crypto') ||
                      pathname.startsWith('/ecommerce') ||
                      pathname.startsWith('/finance') ||
                      pathname.startsWith('/hotel') ||
                      pathname.startsWith('/logistics') ||
                      pathname.startsWith('/payment') ||
                      pathname.startsWith('/project') ||
                      pathname.startsWith('/sales') ||
                      pathname.startsWith('/website-analytics') ||
                      pathname.startsWith('/widgets') ||
                      pathname.startsWith('/file-manager') ||
                      pathname.startsWith('/hospital-management') ||
                      pathname.startsWith('/onboarding-flow');
  
  // Check if user is trying to access guest routes (login, register, etc.)
  const isGuestRoute = pathname.startsWith('/login') ||
                       pathname.startsWith('/register') ||
                       pathname.startsWith('/forgot-password') ||
                       pathname.startsWith('/reset-password') ||
                       isOnboardingFlow;
  
  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // If accessing auth route without token, redirect to login
  if (isAuthRoute && !token) {
    return NextResponse.redirect(new URL('/login/v1', request.url));
  }
  
  // If accessing guest route with token, redirect to dashboard
  // Exception: Allow onboarding-flow even with token (user might need to complete company setup)
  if (isGuestRoute && token && !isOnboardingFlow) {
    return NextResponse.redirect(new URL('/crm', request.url));
  }

  // For root path, redirect based on auth status
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/crm', request.url));
    } else {
      return NextResponse.redirect(new URL('/login/v1', request.url));
    }
  }
  
  // Continue with next response for other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'
  ]
};
