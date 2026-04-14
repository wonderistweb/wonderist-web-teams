import { NextResponse } from "next/server";
import { JobListing } from "@/app/types";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = "649f4a0f48ff3d3604b192df"; // Job Listings collection

export async function GET() {
  try {
    const allItems: JobListing[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      // Note: this returns both published and draft items
      const res = await fetch(
        `${WEBFLOW_API}/collections/${COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err }, { status: res.status });
      }

      const data = await res.json();

      for (const item of data.items) {
        if (item.isArchived) continue;

        allItems.push({
          id: item.id,
          name: item.fieldData.name || "",
          slug: item.fieldData.slug || "",
          active: item.fieldData.active ?? false,
          jobPreviewText: item.fieldData["job-preview-text"] || "",
          listingContent: item.fieldData["listing-content"] || "",
          applicationLink: item.fieldData["application-link"] || "",
          ripplingUrl: item.fieldData["rippling-url-2"] || "",
          crmId: item.fieldData["crm-id"] || "",
          listingImage: item.fieldData["listing-image"] || null,
          isDraft: item.isDraft ?? false,
          isArchived: item.isArchived ?? false,
          createdOn: item.createdOn,
          lastUpdated: item.lastUpdated,
          lastPublished: item.lastPublished || null,
        });
      }

      if (data.items.length < limit) break;
      offset += limit;
    }

    // Sort: active jobs first, then by lastUpdated desc
    allItems.sort((a, b) => {
      // Drafted/inactive at the bottom
      if (a.isDraft !== b.isDraft) return a.isDraft ? 1 : -1;
      // Then by lastUpdated descending (most recently changed first)
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    return NextResponse.json({ items: allItems });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
