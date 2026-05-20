import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = "6a0df9c1a2588298129541e9";
const ITEM_ID = "6a0df9e6f3622296565bd7ad";

// GET: Fetch the global content item
export async function GET() {
  try {
    const res = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/${ITEM_ID}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const item = await res.json();

    return NextResponse.json({
      id: item.id,
      whatToExpect: item.fieldData["job-listings---what-to-expect"] || "",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: Update a field on the global content item
export async function PATCH(req: NextRequest) {
  try {
    const { whatToExpect } = await req.json();

    const fieldData: Record<string, unknown> = {};
    if (whatToExpect !== undefined) {
      fieldData["job-listings---what-to-expect"] = whatToExpect;
    }

    // Update the staged item
    const patchRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/${ITEM_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldData }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      return NextResponse.json({ error: err }, { status: patchRes.status });
    }

    // Publish the change to live
    const publishRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds: [ITEM_ID] }),
      }
    );

    if (!publishRes.ok) {
      const pubErr = await publishRes.text();
      return NextResponse.json(
        { success: true, warning: `Updated but publish failed: ${pubErr}` },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
