"use client";

import { useState, useRef, useEffect } from "react";
import { TeamMember } from "../types";

interface EditModalProps {
  member: TeamMember;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { name?: string; jobTitle?: string; leadership?: boolean; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string }
  ) => Promise<void>;
  onRemove: (id: string, name: string) => Promise<void>;
}

export default function EditModal({ member, onClose, onSave, onRemove }: EditModalProps) {
  const [name, setName] = useState(member.name);
  const [jobTitle, setJobTitle] = useState(member.jobTitle);
  const [leadership, setLeadership] = useState(member.leadership);
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingHobby, setUploadingHobby] = useState(false);
  const [mainPreview, setMainPreview] = useState(member.mainHeadshot?.url || "");
  const [hobbyPreview, setHobbyPreview] = useState(member.hobbyHeadshot?.url || "");
  const [pendingMainUrl, setPendingMainUrl] = useState<string | undefined>();
  const [pendingHobbyUrl, setPendingHobbyUrl] = useState<string | undefined>();
  const mainInputRef = useRef<HTMLInputElement>(null);
  const hobbyInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, type: "main" | "hobby") => {
    const setUploading = type === "main" ? setUploadingMain : setUploadingHobby;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberName", member.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (type === "main") { setMainPreview(data.url); setPendingMainUrl(data.url); }
        else { setHobbyPreview(data.url); setPendingHobbyUrl(data.url); }
      }
    } catch (err) { console.error("Upload failed:", err); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: { name?: string; jobTitle?: string; leadership?: boolean; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string } = {};
    if (name !== member.name) updates.name = name;
    if (jobTitle !== member.jobTitle) updates.jobTitle = jobTitle;
    if (leadership !== member.leadership) updates.leadership = leadership;
    if (pendingMainUrl) updates.mainHeadshotUrl = pendingMainUrl;
    if (pendingHobbyUrl) updates.hobbyHeadshotUrl = pendingHobbyUrl;
    if (Object.keys(updates).length > 0) await onSave(member.id, updates);
    setSaving(false);
    onClose();
  };

  const hasChanges = name !== member.name || jobTitle !== member.jobTitle || leadership !== member.leadership || pendingMainUrl || pendingHobbyUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e5e0db] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e0db] sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-base font-bold text-[#1a1a1a]">Edit Team Member</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f0ece8] transition-colors text-[#1a1a1a]/40 hover:text-[#1a1a1a]"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two-panel content: photos left, fields right */}
        <div className="flex flex-col md:flex-row">
          {/* Left: headshot previews */}
          <div className="md:w-[280px] shrink-0 p-4 md:border-r border-b md:border-b-0 border-[#e5e0db] bg-[#f7f5f2]/50">
            <div className="grid grid-cols-2 gap-2">
              {/* Main */}
              <div>
                <p className="text-[10px] font-semibold text-[#226666] mb-1 text-center uppercase tracking-wider">Main</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#f0ece8] border border-[#e5e0db]">
                  {mainPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mainPreview} alt="Main headshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#c9c3bc] text-xs">No photo</div>
                  )}
                  {uploadingMain && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#226666] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {pendingMainUrl && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">NEW</div>
                  )}
                </div>
                <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "main"); }} />
                <button
                  onClick={() => mainInputRef.current?.click()}
                  disabled={uploadingMain}
                  className="mt-1.5 w-full text-[11px] bg-white hover:bg-[#f0ece8] border border-[#e5e0db] text-[#1a1a1a]/60 hover:text-[#226666] py-1 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {uploadingMain ? "Uploading..." : "Replace"}
                </button>
              </div>

              {/* Hobby */}
              <div>
                <p className="text-[10px] font-semibold text-[#DE6D5E] mb-1 text-center uppercase tracking-wider">Hobby</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#f0ece8] border border-[#e5e0db]">
                  {hobbyPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={hobbyPreview} alt="Hobby headshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#c9c3bc] text-xs">No photo</div>
                  )}
                  {uploadingHobby && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#DE6D5E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {pendingHobbyUrl && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">NEW</div>
                  )}
                </div>
                <input ref={hobbyInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "hobby"); }} />
                <button
                  onClick={() => hobbyInputRef.current?.click()}
                  disabled={uploadingHobby}
                  className="mt-1.5 w-full text-[11px] bg-white hover:bg-[#f0ece8] border border-[#e5e0db] text-[#1a1a1a]/60 hover:text-[#DE6D5E] py-1 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {uploadingHobby ? "Uploading..." : "Replace"}
                </button>
              </div>
            </div>

            {/* Crossfade preview */}
            {mainPreview && hobbyPreview && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-[#e5e0db]">
                <p className="text-[10px] text-[#1a1a1a]/40 mb-1 text-center font-medium">Crossfade Preview</p>
                <CrossfadePreview main={mainPreview} hobby={hobbyPreview} />
              </div>
            )}

            <p className="text-[10px] text-[#1a1a1a]/30 mt-2 text-center leading-tight">
              Auto-resized to 1000px &middot; .webp
            </p>
          </div>

          {/* Right: fields + actions */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 space-y-3 flex-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a]/60 mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Designer"
                  className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-1.5 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
                />
              </div>

              {/* Leadership toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a]/60">Leadership</label>
                  <p className="text-[11px] text-[#1a1a1a]/35">Moves to Leadership group</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={leadership}
                  onClick={() => setLeadership(!leadership)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    leadership ? "bg-[#DE6D5E]" : "bg-[#d4cfc9]"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${leadership ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e0db] bg-[#f7f5f2]/50 rounded-br-2xl">
              {/* Remove */}
              <div>
                {confirmRemove ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-red-600 font-medium">Unpublish?</span>
                    <button
                      onClick={async () => { setRemoving(true); await onRemove(member.id, member.name); setRemoving(false); onClose(); }}
                      disabled={removing}
                      className="px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-md transition-colors"
                    >
                      {removing ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(false)}
                      className="px-2 py-1 text-[11px] text-[#1a1a1a]/50 hover:bg-[#f0ece8] rounded-md transition-colors font-medium"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="text-[11px] text-red-400 hover:text-red-600 transition-colors font-medium"
                  >
                    Remove member
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
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrossfadePreview({ main, hobby }: { main: string; hobby: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setShow((p) => !p), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-16 h-16 mx-auto rounded-lg overflow-hidden shadow-sm border border-[#e5e0db]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={main} alt="Main" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${show ? "opacity-0" : "opacity-100"}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hobby} alt="Hobby" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
