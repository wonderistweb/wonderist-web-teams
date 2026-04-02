"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TeamMember } from "./types";
import TeamCard from "./components/TeamCard";
import EditModal from "./components/EditModal";
import Header from "./components/Header";

export default function Home() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const originalOrder = useRef<Map<string, number>>(new Map());

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data.items);
      originalOrder.current = new Map(
        data.items.map((m: TeamMember) => [m.id, m.order])
      );
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(members);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((m, i) => ({
      ...m,
      order: reordered.length - i,
    }));

    setMembers(updated);
    setHasChanges(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("Syncing order to Webflow...");
    try {
      const payload = members.map((m, i) => ({
        id: m.id,
        order: members.length - i,
      }));

      const res = await fetch("/api/team/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncStatus("Published successfully!");
        setHasChanges(false);
        originalOrder.current = new Map(
          members.map((m, i) => [m.id, members.length - i])
        );
      } else if (data.warning) {
        setSyncStatus(data.warning);
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Sync failed: ${err}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(""), 5000);
    }
  };

  const handleUpdateMember = async (
    id: string,
    updates: { name?: string; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string }
  ) => {
    setSyncStatus("Updating member...");
    try {
      const res = await fetch("/api/team/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTeam();
        setSyncStatus("Member updated!");
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Update failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        hasChanges={hasChanges}
        syncing={syncing}
        syncStatus={syncStatus}
        onSync={handleSync}
        onRefresh={fetchTeam}
        memberCount={members.length}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#00c4cc] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60">Loading team members...</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="team-grid" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                >
                  {members.map((member, index) => (
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
                            onEdit={() => setEditingMember(member)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      {editingMember && (
        <EditModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdateMember}
        />
      )}
    </div>
  );
}
