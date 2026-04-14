import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = "649f4a0f48ff3d3604b192df";
const CMS_LOCALE_ID = "653adb68e882f528b373947b";

// Unpublish a job from the live site (does NOT require a site-wide republish).
// Also marks the item as a draft in the CMS so the UI knows it's inactive.
export async function POST(req: NextRequest) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    // Step 1: Remove from the live/published site.
    // Webflow v2: DELETE /collections/{id}/items/live with { items: [{ id, cmsLocaleIds }] }
    // This takes the item off the live site immediately, no site republish needed.
    const liveRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/live`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ id: itemId, cmsLocaleIds: [CMS_LOCALE_ID] }],
        }),
      }
    );

    if (liveRes.status !== 204 && !liveRes.ok) {
      const err = await liveRes.text();
      return NextResponse.json({ error: `Failed to unpublish: ${err}` }, { status: liveRes.status });
    }

    // Step 2: Mark the staged item as draft so we can visually distinguish it in the UI.
    const patchRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/${itemId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDraft: true }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      // The unpublish succeeded though, so still partial success
      return NextResponse.json(
        { success: true, warning: `Unpublished from live but failed to mark draft: ${err}` },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
