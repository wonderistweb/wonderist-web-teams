"use client";

import { useState, useRef } from "react";
import RichTextEditor from "./RichTextEditor";

interface AddJobModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    active: boolean;
    jobPreviewText: string;
    listingContent: string;
    applicationLink: string;
    ripplingUrl: string;
    crmId: string;
    listingImageUrl?: string;
  }) => Promise<void>;
}

export default function AddJobModal({ onClose, onAdd }: AddJobModalProps) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [jobPreviewText, setJobPreviewText] = useState("");
  const [listingContent, setListingContent] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [ripplingUrl, setRipplingUrl] = useState("");
  const [crmId, setCrmId] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
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
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd({
      name: name.trim(),
      active,
      jobPreviewText,
      listingContent,
      applicationLink,
      ripplingUrl,
      crmId,
      listingImageUrl: imageUrl,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e5e0db] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e0db] bg-white rounded-t-2xl">
          <h2 className="text-base font-bold text-[#1a1a1a]">Add Job Listing</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#1a1a1a]"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                {uploadingImage ? "Uploading..." : "Upload Image"}
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
                  placeholder="e.g. Senior Marketing Manager"
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#f7f5f2] rounded-lg border border-[#e5e0db]">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a]/70">
                    Active job?
                  </label>
                  <p className="text-[11px] text-[#1a1a1a]/60 mt-0.5">
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
                  placeholder="Leave blank to use a CRM ID or Rippling URL"
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
                  placeholder="Leave blank to use an Application Link or CRM ID"
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
                  placeholder="Leave blank to use an Application Link or Rippling URL"
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
              Job Preview Text
            </label>
            <p className="text-[11px] text-[#1a1a1a]/55 mb-1.5">
              Short summary shown on the careers grid.
            </p>
            <RichTextEditor
              value={jobPreviewText}
              onChange={setJobPreviewText}
              placeholder="Short job description..."
              minHeight="120px"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">
              Listing Content
            </label>
            <p className="text-[11px] text-[#1a1a1a]/55 mb-1.5">
              Full job description with headings, lists, and formatting.
            </p>
            <RichTextEditor
              value={listingContent}
              onChange={setListingContent}
              placeholder="Full job description..."
              minHeight="320px"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#e5e0db] bg-[#f7f5f2]/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:bg-[#f0ece8] rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            className="px-4 py-1.5 text-xs bg-[#226666] hover:bg-[#1a5252] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              "Add & Publish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
