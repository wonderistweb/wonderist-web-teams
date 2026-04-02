"use client";

interface HeaderProps {
  hasChanges: boolean;
  syncing: boolean;
  syncStatus: string;
  onSync: () => void;
  onRefresh: () => void;
  onAddMember: () => void;
  memberCount: number;
}

export default function Header({
  hasChanges,
  syncing,
  syncStatus,
  onSync,
  onRefresh,
  onAddMember,
  memberCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e0db]">
      <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Wonderist logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wond-teal.svg"
              alt="Wonderist Agency"
              className="h-7 w-auto"
            />
            <div className="border-l border-[#e5e0db] pl-3">
              <h1 className="text-base font-bold text-[#1a1a1a] leading-tight tracking-tight">
                Team Grid Manager
              </h1>
              <p className="text-xs text-[#1a1a1a]/40 font-medium">
                {memberCount} team members &middot; Wonderist Agency
              </p>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center gap-3">
            {syncStatus && (
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  syncStatus.includes("Error") || syncStatus.includes("failed")
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : syncStatus.includes("success") || syncStatus.includes("updated")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#226666]/10 text-[#226666] border border-[#226666]/20"
                }`}
              >
                {syncStatus}
              </span>
            )}

            <button
              onClick={onAddMember}
              className="px-3 py-1.5 text-sm border border-[#226666]/30 text-[#226666] hover:bg-[#226666]/5 font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Add Member
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#226666]"
              title="Refresh from Webflow"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {hasChanges && (
              <button
                onClick={onSync}
                disabled={syncing}
                className="px-5 py-2 bg-[#226666] hover:bg-[#1a5252] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                {syncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Sync &amp; Publish
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
