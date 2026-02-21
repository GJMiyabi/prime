// フレームワーク層：ヘッダーUIコンポーネント（表示のみ）
"use client";

import * as React from "react";
import { useAuth } from "../../../_contexts/auth-context";
import { useLogout } from "../../../_hooks/useLogout";
import { navItems } from "./navItems";

/**
 * ヘッダーコンポーネント
 * ビジネスロジックはカスタムフックとユースケースに委譲
 */
export const Header: React.FC = () => {
  const { user } = useAuth();
  const { executeLogout } = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-700/30 bg-blue-600 text-white">
      <nav className="w-full h-[35px] bg-gray-600 pt-1 box-border pl-4 pr-4">
        <div className="flex flex-row justify-between items-center h-full">
          <ul className="flex flex-row">
            {navItems.map((item) => (
              <li key={item.title} className="list-none inline-block">
                <a
                  href={item.href}
                  className="block no-underline text-white mr-9"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">こんにちは、{user.username}さん</span>
              <button
                onClick={executeLogout}
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
