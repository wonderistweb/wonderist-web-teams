"use client";

import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackToHome?: boolean;
  syncStatus?: string;
  children?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  showBackToHome = false,
  syncStatus,
  children,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e0db]">
      <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            {showBackToHome ? (
              <Link
                href="/"
                className="group flex items-center gap-3"
                title="Back to home"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/wond-teal.svg"
                  alt="Wonderist Agency"
                  className="h-7 w-auto group-hover:opacity-80 transition-opacity"
                />
              </Link>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/wond-teal.svg"
                alt="Wonderist Agency"
                className="h-7 w-auto"
              />
            )}
            <div className="border-l border-[#e5e0db] pl-3">
              <h1 className="text-base font-bold text-[#1a1a1a] leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#1a1a1a]/40 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center gap-3">
            {syncStatus && (
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  syncStatus.includes("Error") || syncStatus.includes("failed")
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : syncStatus.includes("success") ||
                      syncStatus.includes("updated") ||
                      syncStatus.includes("added") ||
                      syncStatus.includes("published") ||
                      syncStatus.includes("drafted") ||
                      syncStatus.includes("unpublished")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#226666]/10 text-[#226666] border border-[#226666]/20"
                }`}
              >
                {syncStatus}
              </span>
            )}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
