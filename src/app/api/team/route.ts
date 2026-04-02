import { NextResponse } from "next/server";
import { TeamMember } from "@/app/types";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

export async function GET() {
  try {
    const allItems: TeamMember[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
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
        if (item.isArchived || item.isDraft) continue;

        allItems.push({
          id: item.id,
          name: item.fieldData.name,
          slug: item.fieldData.slug,
          jobTitle: item.fieldData["job-title"] || "",
          mainHeadshot: item.fieldData["main-headshot"] || null,
          hobbyHeadshot: item.fieldData["hobby-headshot"] || null,
          leadership: item.fieldData["department-head"] || false,
          order: item.fieldData.order ?? 0,
          isDraft: item.isDraft,
          isArchived: item.isArchived,
        });
      }

      if (data.items.length < limit) break;
      offset += limit;
    }

    allItems.sort((a, b) => b.order - a.order);

    return NextResponse.json({ items: allItems });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
