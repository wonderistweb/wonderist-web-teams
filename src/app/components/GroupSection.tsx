"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TeamMember } from "../types";
import TeamCard from "./TeamCard";

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
  if (group.members.length === 0) return null;

  // Determine grid columns based on group
  const gridCols =
    group.id === "team"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      : group.members.length <= 2
      ? "grid-cols-2 sm:grid-cols-2 max-w-md"
      : group.members.length <= 4
      ? "grid-cols-2 sm:grid-cols-4 max-w-2xl"
      : group.members.length <= 6
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-4xl"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

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

      {/* Droppable grid */}
      <Droppable droppableId={group.id} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`grid ${gridCols} gap-3 p-4 rounded-2xl transition-colors ${
              snapshot.isDraggingOver
                ? "bg-[#226666]/5 ring-2 ring-[#226666]/10"
                : "bg-white/60"
            }`}
          >
            {group.members.map((member, index) => (
              <Draggable
                key={member.id}
                draggableId={member.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TeamCard
                      member={member}
                      index={index}
                      isDragging={snapshot.isDragging}
                      accent={group.accent}
                      onEdit={() => onEdit(member)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
