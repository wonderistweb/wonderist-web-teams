"use client";

import { useState, useEffect } from "react";
import { TeamMember } from "../types";

interface TeamCardProps {
  member: TeamMember;
  index: number;
  isDragging: boolean;
  accent: string;
  onEdit: () => void;
}

export default function TeamCard({
  member,
  index,
  isDragging,
  accent,
  onEdit,
}: TeamCardProps) {
  const [showHobby, setShowHobby] = useState(false);

  // Crossfade between main and hobby headshot to mimic live site
  useEffect(() => {
    if (!member.hobbyHeadshot?.url) return;
    const interval = setInterval(() => {
      setShowHobby((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [member.hobbyHeadshot?.url]);

  const mainUrl = member.mainHeadshot?.url;
  const hobbyUrl = member.hobbyHeadshot?.url;

  return (
    <div
      className={`group relative rounded-xl overflow-hidden bg-white border transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? "shadow-xl scale-[1.03] z-50 ring-2"
          : "shadow-sm hover:shadow-md border-[#e5e0db]"
      }`}
      style={isDragging ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}33` } : undefined}
    >
      {/* Photo area with crossfade */}
      <div className="relative aspect-square bg-[#f0ece8]">
        {mainUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainUrl}
              alt={member.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                showHobby && hobbyUrl ? "opacity-0" : "opacity-100"
              }`}
            />
            {hobbyUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={hobbyUrl}
                alt={`${member.name} hobby`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  showHobby ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#c9c3bc]">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        {/* Hover overlay with edit button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-0 translate-y-1 bg-white hover:bg-[#f7f5f2] text-[#1a1a1a] px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg"
          >
            Edit
          </button>
        </div>

        {/* Position badge */}
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[#1a1a1a]/60 text-xs px-2 py-0.5 rounded-md font-mono shadow-sm">
          #{index + 1}
        </div>

        {/* Hobby indicator dot */}
        {hobbyUrl && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                showHobby ? "bg-[#DE6D5E]" : "bg-[#226666]"
              }`}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-semibold text-[#1a1a1a] truncate leading-tight">
          {member.name}
        </p>
        <p className="text-xs text-[#1a1a1a]/50 truncate mt-0.5">
          {member.jobTitle}
        </p>
      </div>
    </div>
  );
}
