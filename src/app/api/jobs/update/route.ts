import { NextRequest, NextResponse } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";
const TOKEN = process.env.WEBFLOW_API_TOKEN!;
const COLLECTION_ID = "649f4a0f48ff3d3604b192df";

export async function PATCH(req: NextRequest) {
  try {
    const {
      id,
      name,
      slug,
      active,
      jobPreviewText,
      listingContent,
      applicationLink,
      ripplingUrl,
      crmId,
      listingImageUrl,
    } = await req.json();

    const fieldData: Record<string, unknown> = {};

    if (name !== undefined) fieldData.name = name;
    if (slug !== undefined) fieldData.slug = slug;
    if (active !== undefined) fieldData.active = active;
    if (jobPreviewText !== undefined) fieldData["job-preview-text"] = jobPreviewText;
    if (listingContent !== undefined) fieldData["listing-content"] = listingContent;
    if (applicationLink !== undefined) fieldData["application-link"] = applicationLink;
    if (ripplingUrl !== undefined) fieldData["rippling-url-2"] = ripplingUrl;
    if (crmId !== undefined) fieldData["crm-id"] = crmId;
    if (listingImageUrl !== undefined) fieldData["listing-image"] = { url: listingImageUrl };

    // PATCH the staged item
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

    // Publish the change to the live site (only if not currently a draft)
    // Get the current draft status from the response
    const isDraft = updated.isDraft ?? false;

    if (!isDraft) {
      const publishRes = await fetch(
        `${WEBFLOW_API}/collections/${COLLECTION_ID}/items/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemIds: [id] }),
        }
      );

      if (!publishRes.ok) {
        const pubErr = await publishRes.text();
        return NextResponse.json(
          { success: true, item: updated, warning: `Updated but publish failed: ${pubErr}` },
          { status: 207 }
        );
      }
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
