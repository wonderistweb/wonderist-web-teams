"use client";

import { useState, useRef } from "react";

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    jobTitle: string;
    mainHeadshotUrl?: string;
    hobbyHeadshotUrl?: string;
  }) => Promise<void>;
}

export default function AddMemberModal({ onClose, onAdd }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingHobby, setUploadingHobby] = useState(false);
  const [mainPreview, setMainPreview] = useState("");
  const [hobbyPreview, setHobbyPreview] = useState("");
  const [mainUrl, setMainUrl] = useState<string | undefined>();
  const [hobbyUrl, setHobbyUrl] = useState<string | undefined>();
  const mainInputRef = useRef<HTMLInputElement>(null);
  const hobbyInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, type: "main" | "hobby") => {
    const setUploading = type === "main" ? setUploadingMain : setUploadingHobby;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberName", name || "new-member");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (type === "main") {
          setMainPreview(data.url);
          setMainUrl(data.url);
        } else {
          setHobbyPreview(data.url);
          setHobbyUrl(data.url);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd({
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      mainHeadshotUrl: mainUrl,
      hobbyHeadshotUrl: hobbyUrl,
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
        className="bg-white border border-[#e5e0db] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e0db]">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Add Team Member</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#1a1a1a]"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a]/70 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First Last"
              className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-2 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a]/70 mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Designer"
              className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-2 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
            />
          </div>

          {/* Photo uploads */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a]/70 mb-1.5">
              Headshots
            </label>
            <p className="text-xs text-[#1a1a1a]/40 mb-3">
              Auto-resized to max 1000px wide and converted to .webp.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Main */}
              <div>
                <p className="text-xs font-semibold text-[#226666] mb-1.5 text-center uppercase tracking-wider">
                  Main Photo
                </p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f0ece8] border-2 border-[#e5e0db]">
                  {mainPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mainPreview} alt="Main" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#c9c3bc] text-sm">
                      No photo
                    </div>
                  )}
                  {uploadingMain && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#226666] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={mainInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, "main");
                  }}
                />
                <button
                  onClick={() => mainInputRef.current?.click()}
                  disabled={uploadingMain}
                  className="mt-2 w-full text-xs bg-[#f7f5f2] hover:bg-[#f0ece8] border border-[#e5e0db] text-[#1a1a1a]/70 hover:text-[#226666] py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {uploadingMain ? "Uploading..." : "Upload Main"}
                </button>
              </div>

              {/* Hobby */}
              <div>
                <p className="text-xs font-semibold text-[#DE6D5E] mb-1.5 text-center uppercase tracking-wider">
                  Hobby Photo
                </p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f0ece8] border-2 border-[#e5e0db]">
                  {hobbyPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={hobbyPreview} alt="Hobby" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#c9c3bc] text-sm">
                      No photo
                    </div>
                  )}
                  {uploadingHobby && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#DE6D5E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={hobbyInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, "hobby");
                  }}
                />
                <button
                  onClick={() => hobbyInputRef.current?.click()}
                  disabled={uploadingHobby}
                  className="mt-2 w-full text-xs bg-[#f7f5f2] hover:bg-[#f0ece8] border border-[#e5e0db] text-[#1a1a1a]/70 hover:text-[#DE6D5E] py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {uploadingHobby ? "Uploading..." : "Upload Hobby"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#e5e0db] bg-[#f7f5f2]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:bg-[#f0ece8] rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            className="px-5 py-2 text-sm bg-[#226666] hover:bg-[#1a5252] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
