"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const linkClass = (path: string) =>
    `px-4 py-2 hover:text-blue-600 ${pathname === path ? "text-blue-600 font-semibold" : "text-gray-700"}`;

  return (
    <nav className="w-full bg-gray-100 border-b border-gray-200 mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center space-x-4">
          <Link href="/" className={linkClass("/")}>Dashboard</Link>
          <Link href="/option-history" className={linkClass("/option-history")}>Option History</Link>
        </div>
      </div>
    </nav>
  );
}
