import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Returns a signed upload URL + params so the browser can upload directly to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const { memberName } = await req.json();

    const slug = (memberName || "team-member")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `wonderist-team/${slug}-${Date.now()}`;

    const params = {
      timestamp,
      public_id: publicId,
      transformation: "w_1000,c_limit/q_auto,f_webp",
      format: "webp",
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      publicId,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
