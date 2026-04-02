"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TeamMember } from "../types";
import TeamCard from "./TeamCard";

interface SortableCardProps {
  member: TeamMember;
  index: number;
  accent: string;
  onEdit: () => void;
}

export default function SortableCard({ member, index, accent, onEdit }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  // Only translate — no scale in the transform so the grid stays stable
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto" as const,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TeamCard
        member={member}
        index={index}
        isDragging={isDragging}
        accent={accent}
        onEdit={onEdit}
      />
    </div>
  );
}
