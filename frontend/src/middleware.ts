import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("bpo_session")?.value;

  const isProtectedPath =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/comprovantes" ||
    pathname.startsWith("/comprovantes/");

  const isLoginPage = pathname === "/login";

  // 1. Verificação de Rotas Protegidas (/dashboard e /comprovantes)
  if (isProtectedPath) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validação de formato da sessão e status da assinatura
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      
      // Se a assinatura foi cancelada ou reembolsada, direciona com aviso
      if (session.subscriptionStatus === "CANCELED" || session.subscriptionStatus === "REFUNDED") {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "subscription_inactive");
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Cookie corrompido: força novo login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("bpo_session");
      return response;
    }
  }

  // 2. Se já autenticado e tentar acessar /login, redireciona para a dashboard
  if (isLoginPage && sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie));
      if (session && session.email && session.subscriptionStatus !== "CANCELED") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Ignora e permite exibir tela de login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/comprovantes",
    "/comprovantes/:path*",
    "/login",
  ],
};
