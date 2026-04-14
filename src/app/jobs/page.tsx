"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { JobListing } from "../types";
import Header from "../components/Header";
import JobsTable from "../components/JobsTable";
import JobEditModal from "../components/JobEditModal";
import AddJobModal from "../components/AddJobModal";

type FilterMode = "all" | "live" | "drafted";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.items || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    if (filter === "live") return jobs.filter((j) => !j.isDraft);
    if (filter === "drafted") return jobs.filter((j) => j.isDraft);
    return jobs;
  }, [jobs, filter]);

  const liveCount = jobs.filter((j) => !j.isDraft).length;
  const draftCount = jobs.filter((j) => j.isDraft).length;

  type JobUpdates = {
    name?: string;
    active?: boolean;
    jobPreviewText?: string;
    listingContent?: string;
    applicationLink?: string;
    ripplingUrl?: string;
    crmId?: string;
    listingImageUrl?: string;
  };

  const handleUpdateJob = async (id: string, updates: JobUpdates) => {
    setSyncStatus("Updating job...");
    try {
      const res = await fetch("/api/jobs/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus("Job updated and published!");
        await fetchJobs();
      } else {
        setSyncStatus(`Error: ${data.error || data.warning}`);
      }
    } catch (err) {
      setSyncStatus(`Update failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  const handleDraftJob = async (id: string, name: string) => {
    setSyncStatus(`Unpublishing ${name}...`);
    try {
      const res = await fetch("/api/jobs/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`${name} unpublished from live site`);
        await fetchJobs();
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Draft failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  const handlePublishJob = async (id: string, name: string) => {
    setSyncStatus(`Republishing ${name}...`);
    try {
      const res = await fetch("/api/jobs/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`${name} republished to live!`);
        await fetchJobs();
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Publish failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  const handleAddJob = async (data: {
    name: string;
    active: boolean;
    jobPreviewText: string;
    listingContent: string;
    applicationLink: string;
    ripplingUrl: string;
    crmId: string;
    listingImageUrl?: string;
  }) => {
    setSyncStatus(`Adding ${data.name}...`);
    try {
      const res = await fetch("/api/jobs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSyncStatus(`${data.name} added and published!`);
        await fetchJobs();
      } else {
        setSyncStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      setSyncStatus(`Add failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
      <Header
        title="Job Listings"
        subtitle={`${liveCount} live · ${draftCount} drafted · Wonderist Agency`}
        showBackToHome
        syncStatus={syncStatus}
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 text-sm border border-[#226666]/30 text-[#226666] hover:bg-[#226666]/5 font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          Add Job
        </button>

        <button
          onClick={fetchJobs}
          className="p-2 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#226666]"
          title="Refresh from Webflow"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </Header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-[70rem] mx-auto w-full">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "all"
                ? "bg-[#226666] text-white"
                : "bg-white border border-[#e5e0db] text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter("live")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "live"
                ? "bg-[#226666] text-white"
                : "bg-white border border-[#e5e0db] text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
            }`}
          >
            Live ({liveCount})
          </button>
          <button
            onClick={() => setFilter("drafted")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "drafted"
                ? "bg-[#226666] text-white"
                : "bg-white border border-[#e5e0db] text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
            }`}
          >
            Drafted ({draftCount})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#226666] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#226666]/60 font-medium">Loading job listings...</p>
            </div>
          </div>
        ) : (
          <JobsTable jobs={filteredJobs} onEdit={(j) => setEditingJob(j)} />
        )}
      </main>

      {editingJob && (
        <JobEditModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleUpdateJob}
          onDraft={handleDraftJob}
          onPublish={handlePublishJob}
        />
      )}

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddJob}
        />
      )}
    </div>
  );
}
