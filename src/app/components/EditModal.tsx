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
  const [showHobby, setShowHobby] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const hobbyInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (
    file: File,
    type: "main" | "hobby"
  ) => {
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

  const hasChanges =
    name !== member.name || pendingMainUrl || pendingHobbyUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Edit Team Member</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
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
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00c4cc] transition-colors"
            />
          </div>

          {/* Photo previews side by side */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Headshots
            </label>
            <p className="text-xs text-white/40 mb-3">
              These two photos crossfade on the live site. Images are auto-resized to max 1000px wide and converted to .webp.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Main headshot */}
              <div>
                <p className="text-xs text-white/50 mb-1.5 text-center">Main Photo</p>
                <div
                  className={`relative aspect-square rounded-lg overflow-hidden bg-[#0f0f0f] border-2 transition-all cursor-pointer ${
                    !showHobby ? "border-[#00c4cc]" : "border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => setShowHobby(false)}
                >
                  {mainPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mainPreview}
                      alt="Main headshot"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 text-sm">
                      No photo
                    </div>
                  )}
                  {uploadingMain && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#00c4cc] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {pendingMainUrl && (
                    <div className="absolute top-1 right-1 bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                      New
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
                  className="mt-2 w-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploadingMain ? "Uploading..." : "Replace Main"}
                </button>
              </div>

              {/* Hobby headshot */}
              <div>
                <p className="text-xs text-white/50 mb-1.5 text-center">Hobby Photo</p>
                <div
                  className={`relative aspect-square rounded-lg overflow-hidden bg-[#0f0f0f] border-2 transition-all cursor-pointer ${
                    showHobby ? "border-[#00c4cc]" : "border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => setShowHobby(true)}
                >
                  {hobbyPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={hobbyPreview}
                      alt="Hobby headshot"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 text-sm">
                      No photo
                    </div>
                  )}
                  {uploadingHobby && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#00c4cc] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {pendingHobbyUrl && (
                    <div className="absolute top-1 right-1 bg-green-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                      New
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
                  className="mt-2 w-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploadingHobby ? "Uploading..." : "Replace Hobby"}
                </button>
              </div>
            </div>

            {/* Crossfade preview */}
            {mainPreview && hobbyPreview && (
              <div className="mt-3 p-3 bg-[#0f0f0f] rounded-lg border border-white/5">
                <p className="text-xs text-white/40 mb-2 text-center">
                  Live Crossfade Preview
                </p>
                <CrossfadePreview main={mainPreview} hobby={hobbyPreview} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm bg-[#00c4cc] hover:bg-[#00b0b7] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
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
    <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden">
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
