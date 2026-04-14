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

export interface JobListing {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  jobPreviewText: string;
  listingContent: string;
  applicationLink: string;
  ripplingUrl: string;
  crmId: string;
  listingImage: { url: string; fileId: string; alt: string | null } | null;
  isDraft: boolean;
  isArchived: boolean;
  createdOn: string;
  lastUpdated: string;
  lastPublished: string | null;
}
