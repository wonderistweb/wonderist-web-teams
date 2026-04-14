"use client";

import { useState, useRef } from "react";
import { JobListing } from "../types";

interface JobEditModalProps {
  job: JobListing;
  onClose: () => void;
  onSave: (id: string, updates: JobUpdates) => Promise<void>;
  onDraft: (id: string, name: string) => Promise<void>;
  onPublish: (id: string, name: string) => Promise<void>;
}

interface JobUpdates {
  name?: string;
  active?: boolean;
  jobPreviewText?: string;
  listingContent?: string;
  applicationLink?: string;
  ripplingUrl?: string;
  crmId?: string;
  listingImageUrl?: string;
}

export default function JobEditModal({
  job,
  onClose,
  onSave,
  onDraft,
  onPublish,
}: JobEditModalProps) {
  const [name, setName] = useState(job.name);
  const [active, setActive] = useState(job.active);
  const [jobPreviewText, setJobPreviewText] = useState(job.jobPreviewText);
  const [listingContent, setListingContent] = useState(job.listingContent);
  const [applicationLink, setApplicationLink] = useState(job.applicationLink);
  const [ripplingUrl, setRipplingUrl] = useState(job.ripplingUrl);
  const [crmId, setCrmId] = useState(job.crmId);
  const [imagePreview, setImagePreview] = useState(job.listingImage?.url || "");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberName", name || "job-listing");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImagePreview(data.url);
        setPendingImageUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: JobUpdates = {};
    if (name !== job.name) updates.name = name;
    if (active !== job.active) updates.active = active;
    if (jobPreviewText !== job.jobPreviewText) updates.jobPreviewText = jobPreviewText;
    if (listingContent !== job.listingContent) updates.listingContent = listingContent;
    if (applicationLink !== job.applicationLink) updates.applicationLink = applicationLink;
    if (ripplingUrl !== job.ripplingUrl) updates.ripplingUrl = ripplingUrl;
    if (crmId !== job.crmId) updates.crmId = crmId;
    if (pendingImageUrl) updates.listingImageUrl = pendingImageUrl;

    if (Object.keys(updates).length > 0) {
      await onSave(job.id, updates);
    }
    setSaving(false);
    onClose();
  };

  const hasChanges =
    name !== job.name ||
    active !== job.active ||
    jobPreviewText !== job.jobPreviewText ||
    listingContent !== job.listingContent ||
    applicationLink !== job.applicationLink ||
    ripplingUrl !== job.ripplingUrl ||
    crmId !== job.crmId ||
    pendingImageUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e5e0db] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e0db] bg-white rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1a1a1a] truncate">
              Edit Job Listing
            </h2>
            <p className="text-xs text-[#1a1a1a]/40 mt-0.5 truncate">
              {job.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#1a1a1a] shrink-0"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Image */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1.5">
                Listing Image
              </label>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f0ece8] border border-[#e5e0db]">
                {imagePreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={imagePreview} alt="Listing" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#c9c3bc] text-xs">
                    No image
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#226666] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {pendingImageUrl && (
                  <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    NEW
                  </div>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                }}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="mt-2 w-full text-xs bg-[#f7f5f2] hover:bg-[#f0ece8] border border-[#e5e0db] text-[#1a1a1a]/70 hover:text-[#226666] py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {uploadingImage ? "Uploading..." : "Replace Image"}
              </button>
            </div>

            {/* Right side fields */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3 bg-[#f7f5f2] rounded-lg border border-[#e5e0db]">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a]/70">
                    Active job?
                  </label>
                  <p className="text-[11px] text-[#1a1a1a]/40 mt-0.5">
                    ON = &ldquo;Now Hiring&rdquo; · OFF = &ldquo;Accepting Applications&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => setActive(!active)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    active ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
                  Application Link
                </label>
                <input
                  type="url"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="Leave blank to use the CRM form"
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
                  Rippling URL
                </label>
                <input
                  type="url"
                  value={ripplingUrl}
                  onChange={(e) => setRipplingUrl(e.target.value)}
                  placeholder="https://ats.rippling.com/..."
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
                  CRM ID
                </label>
                <input
                  type="text"
                  value={crmId}
                  onChange={(e) => setCrmId(e.target.value)}
                  placeholder="Optional CRM form ID"
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Rich text fields full width */}
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
              Job Preview Text
            </label>
            <p className="text-[11px] text-[#1a1a1a]/40 mb-1.5">
              Short summary shown on the careers grid. HTML supported (e.g. &lt;p&gt;, &lt;strong&gt;).
            </p>
            <textarea
              value={jobPreviewText}
              onChange={(e) => setJobPreviewText(e.target.value)}
              rows={4}
              className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-2 text-[#1a1a1a] text-sm font-mono focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
              Listing Content
            </label>
            <p className="text-[11px] text-[#1a1a1a]/40 mb-1.5">
              Full job description. HTML supported (e.g. &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;).
            </p>
            <textarea
              value={listingContent}
              onChange={(e) => setListingContent(e.target.value)}
              rows={14}
              className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-2 text-[#1a1a1a] text-sm font-mono focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e0db] bg-[#f7f5f2]/50 rounded-b-2xl">
          {/* Draft / publish toggle on left */}
          <div>
            {job.isDraft ? (
              <button
                onClick={async () => {
                  setPublishing(true);
                  await onPublish(job.id, job.name);
                  setPublishing(false);
                  onClose();
                }}
                disabled={publishing}
                className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {publishing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Republishing...
                  </>
                ) : (
                  "Republish to live"
                )}
              </button>
            ) : confirmDraft ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-red-600 font-medium">
                  Unpublish from live?
                </span>
                <button
                  onClick={async () => {
                    setDrafting(true);
                    await onDraft(job.id, job.name);
                    setDrafting(false);
                    onClose();
                  }}
                  disabled={drafting}
                  className="px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-md transition-colors"
                >
                  {drafting ? "..." : "Yes"}
                </button>
                <button
                  onClick={() => setConfirmDraft(false)}
                  className="px-2 py-1 text-[11px] text-[#1a1a1a]/50 hover:bg-[#f0ece8] rounded-md transition-colors font-medium"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDraft(true)}
                className="text-[11px] text-red-400 hover:text-red-600 transition-colors font-medium"
              >
                Draft / unpublish
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:bg-[#f0ece8] rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-4 py-1.5 text-xs bg-[#226666] hover:bg-[#1a5252] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Publish"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
