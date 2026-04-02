"use client";

import { useState, useRef, useEffect } from "react";
import { TeamMember } from "../types";

interface EditModalProps {
  member: TeamMember;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { name?: string; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string }
  ) => Promise<void>;
}

export default function EditModal({ member, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState(member.name);
  const [saving, setSaving] = useState(false);
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (type === "main") {
          setMainPreview(data.url);
          setPendingMainUrl(data.url);
        } else {
          setHobbyPreview(data.url);
          setPendingHobbyUrl(data.url);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: { name?: string; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string } = {};

    if (name !== member.name) updates.name = name;
    if (pendingMainUrl) updates.mainHeadshotUrl = pendingMainUrl;
    if (pendingHobbyUrl) updates.hobbyHeadshotUrl = pendingHobbyUrl;

    if (Object.keys(updates).length > 0) {
      await onSave(member.id, updates);
    }

    setSaving(false);
    onClose();
  };

  const hasChanges = name !== member.name || pendingMainUrl || pendingHobbyUrl;

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
          <h2 className="text-lg font-bold text-[#1a1a1a]">Edit Team Member</h2>
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
        <div className="p-5 space-y-5">
          {/* Name field */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a]/70 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f7f5f2] border border-[#e5e0db] rounded-lg px-3 py-2 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#226666] focus:ring-2 focus:ring-[#226666]/10 transition-all"
            />
          </div>

          {/* Photo previews side by side */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a]/70 mb-1.5">
              Headshots
            </label>
            <p className="text-xs text-[#1a1a1a]/40 mb-3">
              These two photos crossfade on the live site. Images are auto-resized to max 1000px wide and converted to .webp.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Main headshot */}
              <div>
                <p className="text-xs font-semibold text-[#226666] mb-1.5 text-center uppercase tracking-wider">
                  Main Photo
                </p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f0ece8] border-2 border-[#e5e0db]">
                  {mainPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mainPreview}
                      alt="Main headshot"
                      className="w-full h-full object-cover"
                    />
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
                  {pendingMainUrl && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                      NEW
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
                  {uploadingMain ? "Uploading..." : "Replace Main"}
                </button>
              </div>

              {/* Hobby headshot */}
              <div>
                <p className="text-xs font-semibold text-[#DE6D5E] mb-1.5 text-center uppercase tracking-wider">
                  Hobby Photo
                </p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f0ece8] border-2 border-[#e5e0db]">
                  {hobbyPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={hobbyPreview}
                      alt="Hobby headshot"
                      className="w-full h-full object-cover"
                    />
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
                  {pendingHobbyUrl && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                      NEW
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
                  {uploadingHobby ? "Uploading..." : "Replace Hobby"}
                </button>
              </div>
            </div>

            {/* Crossfade preview */}
            {mainPreview && hobbyPreview && (
              <div className="mt-3 p-3 bg-[#f7f5f2] rounded-xl border border-[#e5e0db]">
                <p className="text-xs text-[#1a1a1a]/40 mb-2 text-center font-medium">
                  Live Crossfade Preview
                </p>
                <CrossfadePreview main={mainPreview} hobby={hobbyPreview} />
              </div>
            )}
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
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-5 py-2 text-sm bg-[#226666] hover:bg-[#1a5252] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
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
    <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden shadow-md border border-[#e5e0db]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={main}
        alt="Main"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          show ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hobby}
        alt="Hobby"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
