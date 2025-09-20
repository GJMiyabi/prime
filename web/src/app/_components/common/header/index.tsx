import * as React from "react";

export const Header: React.FC = () => {
  const navItems = [
    { title: "HOME", href: "#" },
    { title: "サービス紹介", href: "#" },
    { title: "最新情報", href: "#" },
    { title: "お問い合わせ", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-700/30 bg-blue-600 text-white">
      <nav className="w-full h-[35px] bg-gray-600 pt-1 box-border pl-4">
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
      </nav>
    </header>
  );
};
