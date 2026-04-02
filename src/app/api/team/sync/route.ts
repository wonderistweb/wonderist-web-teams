import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json() as { items: { id: string; order: number }[] };

    // Webflow v2 API: patch items in batches of 25
    const batchSize = 25;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const res = await fetch(
        `${WEBFLOW_API}/collections/${COLLECTION_ID}/items`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: batch.map((item) => ({
              id: item.id,
              fieldData: { order: item.order },
            })),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        errors.push(`Batch ${i / batchSize}: ${err}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
    }

    // Publish the collection
    const siteRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const siteData = await siteRes.json();
    const siteId = siteData.siteId;

    if (siteId) {
      const publishRes = await fetch(
        `${WEBFLOW_API}/sites/${siteId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!publishRes.ok) {
        const pubErr = await publishRes.text();
        return NextResponse.json(
          { warning: `Items updated but publish failed: ${pubErr}` },
          { status: 207 }
        );
      }
    }

    return NextResponse.json({ success: true, updated: items.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
