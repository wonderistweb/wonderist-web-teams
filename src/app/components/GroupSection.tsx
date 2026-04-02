"use client";

import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TeamMember } from "../types";
import SortableCard from "./SortableCard";

interface GroupDef {
  id: string;
  label: string;
  accent: string;
  members: TeamMember[];
}

interface GroupSectionProps {
  group: GroupDef;
  onEdit: (member: TeamMember) => void;
}

export default function GroupSection({ group, onEdit }: GroupSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });

  if (group.members.length === 0) return null;

  const itemClass =
    group.id === "founders" ? "dnd-item-founders" : "dnd-item-standard";

  const itemIds = group.members.map((m) => m.id);

  return (
    <section>
      {/* Group header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: group.accent }}
        />
        <h2 className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
          {group.label}
        </h2>
        <span className="text-sm text-[#1a1a1a]/40 font-medium">
          {group.members.length}
        </span>
      </div>

      {/* Sortable grid — rectSortingStrategy handles 2D grid reordering */}
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-wrap gap-3 p-4 rounded-2xl transition-colors ${
            isOver
              ? "bg-[#226666]/5 ring-2 ring-[#226666]/10"
              : "bg-white/60"
          }`}
        >
          {group.members.map((member, index) => (
            <div key={member.id} className={itemClass}>
              <SortableCard
                member={member}
                index={index}
                accent={group.accent}
                onEdit={() => onEdit(member)}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
