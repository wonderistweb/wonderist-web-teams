"use client";

import { useState, useEffect } from "react";
import { TeamMember } from "../types";

interface TeamCardProps {
  member: TeamMember;
  index: number;
  isDragging: boolean;
  onEdit: () => void;
}

export default function TeamCard({
  member,
  index,
  isDragging,
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
      className={`group relative rounded-xl overflow-hidden bg-[#1a1a1a] border transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? "border-[#00c4cc] shadow-lg shadow-[#00c4cc]/20 scale-105 z-50"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Photo area with crossfade */}
      <div className="relative aspect-square bg-[#222]">
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
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <svg
              width="48"
              height="48"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        {/* Hover overlay with edit button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            Edit
          </button>
        </div>

        {/* Position badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-md font-mono">
          #{index + 1}
        </div>

        {/* Leadership badge */}
        {member.leadership && (
          <div className="absolute top-2 right-2 bg-[#00c4cc]/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-medium">
            Lead
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-medium text-white truncate">
          {member.name}
        </p>
        <p className="text-xs text-white/50 truncate">{member.jobTitle}</p>
      </div>
    </div>
  );
}
