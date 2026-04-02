"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TeamMember } from "./types";
import GroupSection from "./components/GroupSection";
import EditModal from "./components/EditModal";
import AddMemberModal from "./components/AddMemberModal";
import Header from "./components/Header";

// Hard-coded group membership by Webflow item ID
const FOUNDER_IDS = [
  "650fa2ed4a76afdca2f96363", // Laura Maly
  "650fa2ed38e964525a55bf89", // Michael Anderson
];

const DIRECTOR_IDS = [
  "650fa2ef33137a6ce397bac6", // Ryan Haug
  "6791cb155577174b16dfd828", // Aidan Breheny
  "650fa2e9c1a2d98a97a37259", // Forrest Lutz
  "650fa2ee62e045adba75e05f", // MJ Kovarik
];

interface GroupDef {
  id: string;
  label: string;
  accent: string;
  members: TeamMember[];
}

function categorize(allMembers: TeamMember[]): GroupDef[] {
  const founderSet = new Set(FOUNDER_IDS);
  const directorSet = new Set(DIRECTOR_IDS);
  const placed = new Set<string>();

  const founders: TeamMember[] = [];
  const directors: TeamMember[] = [];
  const leadership: TeamMember[] = [];
  const team: TeamMember[] = [];

  // First pass: founders in their defined order
  for (const id of FOUNDER_IDS) {
    const m = allMembers.find((x) => x.id === id);
    if (m) {
      founders.push(m);
      placed.add(id);
    }
  }

  // Second pass: directors in their defined order
  for (const id of DIRECTOR_IDS) {
    const m = allMembers.find((x) => x.id === id);
    if (m) {
      directors.push(m);
      placed.add(id);
    }
  }

  // Third pass: remaining leadership, sorted by order desc
  const remainingLeadership = allMembers
    .filter((m) => m.leadership && !placed.has(m.id))
    .sort((a, b) => a.order - b.order);
  for (const m of remainingLeadership) {
    leadership.push(m);
    placed.add(m.id);
  }

  // Fourth pass: everyone else, sorted by order desc
  const rest = allMembers
    .filter((m) => !placed.has(m.id))
    .sort((a, b) => a.order - b.order);
  team.push(...rest);

  return [
    { id: "founders", label: "Founders", accent: "#226666", members: founders },
    { id: "directors", label: "Directors", accent: "#509999", members: directors },
    { id: "leadership", label: "Leadership", accent: "#DE6D5E", members: leadership },
    { id: "team", label: "WonderBuds", accent: "#226666", members: team },
  ];
}

export default function Home() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data.items);
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

  const groups = useMemo(() => categorize(members), [members]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    // Only allow reorder within the same group
    if (source.droppableId !== destination.droppableId) return;

    const groupId = source.droppableId;
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const reordered = Array.from(group.members);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    // Rebuild the full members list with new ordering.
    // We need to assign new global order values so all groups sort correctly.
    // Founders get highest, then directors, then leadership, then team.
    const newGroups = groups.map((g) =>
      g.id === groupId ? { ...g, members: reordered } : g
    );

    let orderCounter = 1;
    const newMembers: TeamMember[] = [];
    for (const g of newGroups) {
      for (const m of g.members) {
        newMembers.push({ ...m, order: orderCounter });
        orderCounter++;
      }
    }

    setMembers(newMembers);
    setHasChanges(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("Syncing order to Webflow...");
    try {
      // Recalculate order based on current position across all groups
      const ordered = categorize(members);
      let orderCounter = 1;
      const payload: { id: string; order: number }[] = [];
      for (const g of ordered) {
        for (const m of g.members) {
          payload.push({ id: m.id, order: orderCounter });
          orderCounter++;
        }
      }

      const res = await fetch("/api/team/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncStatus("Published successfully!");
        setHasChanges(false);
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
    updates: { name?: string; jobTitle?: string; leadership?: boolean; mainHeadshotUrl?: string; hobbyHeadshotUrl?: string }
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

  const handleRemoveMember = async (id: string, name: string) => {
    setSyncStatus(`Removing ${name}...`);
    try {
      const res = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`${name} unpublished from live site`);
        await fetchTeam();
      } else {
        setSyncStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Remove failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  const handleAddMember = async (data: {
    name: string;
    jobTitle: string;
    mainHeadshotUrl?: string;
    hobbyHeadshotUrl?: string;
  }) => {
    setSyncStatus(`Adding ${data.name}...`);
    try {
      const res = await fetch("/api/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSyncStatus(`${data.name} added and published!`);
        await fetchTeam();
      } else {
        setSyncStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      setSyncStatus(`Add failed: ${err}`);
    } finally {
      setTimeout(() => setSyncStatus(""), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
      <Header
        hasChanges={hasChanges}
        syncing={syncing}
        syncStatus={syncStatus}
        onSync={handleSync}
        onRefresh={fetchTeam}
        onAddMember={() => setShowAddModal(true)}
        memberCount={members.length}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-[70rem] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#226666] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#226666]/60 font-medium">Loading team members...</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-10">
              {groups.map((group) => (
                <GroupSection
                  key={group.id}
                  group={group}
                  onEdit={(m) => setEditingMember(m)}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      {editingMember && (
        <EditModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdateMember}
          onRemove={handleRemoveMember}
        />
      )}

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}
