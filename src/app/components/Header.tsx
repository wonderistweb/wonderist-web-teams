"use client";

interface HeaderProps {
  hasChanges: boolean;
  syncing: boolean;
  syncStatus: string;
  onSync: () => void;
  onRefresh: () => void;
  memberCount: number;
}

export default function Header({
  hasChanges,
  syncing,
  syncStatus,
  onSync,
  onRefresh,
  memberCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="8" fill="#00c4cc" />
                <text
                  x="16"
                  y="22"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  W
                </text>
              </svg>
              <div>
                <h1 className="text-base font-semibold text-white leading-tight">
                  Team Grid Manager
                </h1>
                <p className="text-xs text-white/40">
                  {memberCount} team members
                </p>
              </div>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center gap-3">
            {syncStatus && (
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  syncStatus.includes("Error") || syncStatus.includes("failed")
                    ? "bg-red-500/20 text-red-300"
                    : syncStatus.includes("success") || syncStatus.includes("updated")
                    ? "bg-green-500/20 text-green-300"
                    : "bg-[#00c4cc]/20 text-[#00c4cc]"
                }`}
              >
                {syncStatus}
              </span>
            )}

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
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
                className="px-4 py-2 bg-[#00c4cc] hover:bg-[#00b0b7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-all flex items-center gap-2"
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
