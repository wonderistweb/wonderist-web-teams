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

  const itemClass =
    group.id === "founders" ? "dnd-item-founders" : "dnd-item-standard";

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

      {/* Droppable — default vertical direction works with flex-wrap */}
      <Droppable droppableId={group.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-wrap gap-3 p-4 rounded-2xl transition-colors ${
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
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={itemClass}
                    style={dragProvided.draggableProps.style}
                  >
                    <TeamCard
                      member={member}
                      index={index}
                      isDragging={dragSnapshot.isDragging}
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
