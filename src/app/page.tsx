import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex flex-col">
      {/* Top bar: dark teal with white logo */}
      <header className="bg-[#226666] border-b border-[#1a5252]">
        <div className="max-w-[70rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wond-white.svg" alt="Wonderist Agency" className="h-7 w-auto" />
          <span className="text-xs text-white/70 font-medium uppercase tracking-wider">
            Internal Tool
          </span>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
              Select Your WonderApp
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Photo Grid card */}
            <Link
              href="/teams"
              className="group bg-white border border-[#e5e0db] rounded-2xl p-6 hover:border-[#226666] hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#226666]/10 flex items-center justify-center text-[#226666] group-hover:bg-[#226666] group-hover:text-white transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-[#1a1a1a]/30 group-hover:text-[#226666] group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
                Team Photo Grid
              </h2>
              <p className="text-sm text-[#1a1a1a]/50 leading-relaxed">
                Reorder team members across Founders, Directors, Leadership, and WonderBuds. Edit names, photos, and titles.
              </p>
            </Link>

            {/* Job Listings card */}
            <Link
              href="/jobs"
              className="group bg-white border border-[#e5e0db] rounded-2xl p-6 hover:border-[#DE6D5E] hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#DE6D5E]/10 flex items-center justify-center text-[#DE6D5E] group-hover:bg-[#DE6D5E] group-hover:text-white transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="14" rx="2" />
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <path d="M3 13h18" />
                  </svg>
                </div>
                <svg
                  className="w-5 h-5 text-[#1a1a1a]/30 group-hover:text-[#DE6D5E] group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">
                Job Listings
              </h2>
              <p className="text-sm text-[#1a1a1a]/50 leading-relaxed">
                Manage open positions on the careers page. Add, edit, draft, and unpublish job postings.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer: dark teal background */}
      <footer className="bg-[#226666] text-white/80 py-4 text-center text-xs font-medium">
        Wonderist Agency &middot; Internal Tool
      </footer>
    </div>
  );
}
