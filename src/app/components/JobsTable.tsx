"use client";

import { JobListing } from "../types";

interface JobsTableProps {
  jobs: JobListing[];
  onEdit: (job: JobListing) => void;
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} mo${months === 1 ? "" : "s"}`;
  }
  const years = Math.floor(days / 365);
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ job }: { job: JobListing }) {
  if (job.isDraft) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a1a]/5 text-[#1a1a1a]/50 border border-[#1a1a1a]/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]/40" />
        Inactive
      </span>
    );
  }
  if (job.active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Now Hiring
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Accepting Applications
    </span>
  );
}

export default function JobsTable({ jobs, onEdit }: JobsTableProps) {
  return (
    <div className="bg-white border border-[#e5e0db] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e0db] bg-[#f7f5f2]/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider">
                Job Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider whitespace-nowrap">
                Days Posted
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider whitespace-nowrap">
                Last Modified
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider">
                {/* Action col */}
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr
                key={job.id}
                className={`border-b border-[#e5e0db] last:border-0 hover:bg-[#f7f5f2]/40 transition-colors cursor-pointer ${
                  job.isDraft ? "opacity-60" : ""
                } ${i % 2 === 1 ? "bg-[#f7f5f2]/20" : ""}`}
                onClick={() => onEdit(job)}
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-sm text-[#1a1a1a]">
                    {job.name || <span className="text-[#1a1a1a]/30">(Untitled)</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge job={job} />
                </td>
                <td className="px-4 py-3 text-sm text-[#1a1a1a]/60 whitespace-nowrap">
                  {daysSince(job.lastPublished)}
                </td>
                <td className="px-4 py-3 text-sm text-[#1a1a1a]/60 whitespace-nowrap">
                  {formatDate(job.lastUpdated)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(job);
                    }}
                    className="text-xs font-semibold text-[#226666] hover:text-[#1a5252] px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs.length === 0 && (
          <div className="py-16 text-center text-[#1a1a1a]/40 text-sm">
            No job listings found.
          </div>
        )}
      </div>
    </div>
  );
}
