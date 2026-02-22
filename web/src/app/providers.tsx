"use client";

import { HttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { getCSRFTokenFromCookie } from "./_lib/csrf.client";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
    credentials: "include", // ✅ Cookie を自動送信（httpOnly Cookie対応）
  });

  // ✅ CSRFトークンを自動付与（GraphQL Mutation保護）
  const csrfLink = setContext(async (_, { headers }) => {
    // CookieからCSRFトークンを取得
    const csrfToken = getCSRFTokenFromCookie();

    // トークンがない場合は /api/auth/csrf から取得
    if (!csrfToken) {
      try {
        await fetch("/api/auth/csrf", {
          credentials: "include",
        });
        // 次回のために Cookie に保存される
      } catch (error) {
        console.warn("Failed to fetch CSRF token:", error);
      }
    }

    return {
      headers: {
        ...headers,
        "x-csrf-token": csrfToken || "", // CSRFトークンを付与
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([csrfLink, httpLink]), // ✅ CSRF Link を追加
  });
}

import { AuthProvider } from "./_contexts/auth-context";

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloNextAppProvider>
  );
}
