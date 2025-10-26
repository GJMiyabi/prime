"use client";

import * as React from "react";
import { useAuth } from "../../../_contexts/auth-context";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { title: "HOME", href: "/" },
    { title: "人物管理", href: "/person" },
    { title: "組織管理", href: "/organization" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

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
                onClick={handleLogout}
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
