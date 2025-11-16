"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./ui/Container";

export default function NavBar() {
  const pathname = usePathname();
  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent ${
      pathname === path
        ? "text-gray-900 border-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:border-gray-300"
    }`;

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Inline Options</span>
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/" className={linkClass("/")}>Dashboard</Link>
              <Link href="/option-history" className={linkClass("/option-history")}>Option History</Link>
              <Link href="/metrics" className={linkClass("/metrics")}>Metrics</Link>
            </div>
          </div>
          <div className="sm:hidden flex items-center gap-1">
            <Link href="/" className={linkClass("/")}>Dashboard</Link>
            <Link href="/option-history" className={linkClass("/option-history")}>History</Link>
            <Link href="/metrics" className={linkClass("/metrics")}>Metrics</Link>
          </div>
        </div>
      </Container>
    </nav>
  );
}
