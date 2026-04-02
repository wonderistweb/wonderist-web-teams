import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;
const CMS_LOCALE_ID = "653adb68e882f528b373947b";

export async function POST(req: NextRequest) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    // Webflow v2: DELETE /collections/{id}/items/live removes items from the live site.
    // Body must use { items: [{ id, cmsLocaleIds }] } format.
    const res = await fetch(
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

    // 204 No Content = success
    if (res.status === 204 || res.ok) {
      return NextResponse.json({ success: true });
    }

    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
