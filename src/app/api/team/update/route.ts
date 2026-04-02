import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, mainHeadshotUrl, hobbyHeadshotUrl } = await req.json();

    const fieldData: Record<string, unknown> = {};

    if (name !== undefined) {
      fieldData.name = name;
      fieldData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (mainHeadshotUrl !== undefined) {
      fieldData["main-headshot"] = { url: mainHeadshotUrl };
    }
    if (hobbyHeadshotUrl !== undefined) {
      fieldData["hobby-headshot"] = { url: hobbyHeadshotUrl };
    }

    const res = await fetch(
      `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldData }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const updated = await res.json();
    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
