import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = "649f4a0f48ff3d3604b192df";

// Re-publish a previously-drafted job back to the live site.
export async function POST(req: NextRequest) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    // Step 1: Take the item out of draft state.
    const patchRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/${itemId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDraft: false }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      return NextResponse.json({ error: `Failed to undraft: ${err}` }, { status: patchRes.status });
    }

    // Step 2: Publish it to the live site.
    const publishRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds: [itemId] }),
      }
    );

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return NextResponse.json({ error: `Undrafted but publish failed: ${err}` }, { status: publishRes.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
