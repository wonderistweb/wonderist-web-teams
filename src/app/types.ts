export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  jobTitle: string;
  mainHeadshot: { url: string; fileId: string; alt: string | null } | null;
  hobbyHeadshot: { url: string; fileId: string; alt: string | null } | null;
  leadership: boolean;
  order: number;
  isDraft: boolean;
  isArchived: boolean;
}

export interface SyncPayload {
  items: { id: string; order: number }[];
}

export interface UpdatePayload {
  id: string;
  name?: string;
  mainHeadshotUrl?: string;
  hobbyHeadshotUrl?: string;
}
