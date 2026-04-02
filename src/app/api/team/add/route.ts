import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

export async function POST(req: NextRequest) {
  try {
    const { name, jobTitle, mainHeadshotUrl, hobbyHeadshotUrl } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const fieldData: Record<string, unknown> = {
      name,
      slug,
      "job-title": jobTitle || "",
      order: 0,
      "department-head": false,
    };

    if (mainHeadshotUrl) {
      fieldData["main-headshot"] = { url: mainHeadshotUrl };
    }
    if (hobbyHeadshotUrl) {
      fieldData["hobby-headshot"] = { url: hobbyHeadshotUrl };
    }

    // Create the item
    const createRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldData }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json({ error: err }, { status: createRes.status });
    }

    const created = await createRes.json();

    // Publish the new item so it appears on the live site
    const publishRes = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds: [created.id] }),
      }
    );

    if (!publishRes.ok) {
      const pubErr = await publishRes.text();
      return NextResponse.json(
        { success: true, item: created, warning: `Created but publish failed: ${pubErr}` },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
