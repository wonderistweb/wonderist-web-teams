import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memberName = formData.get("memberName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const slug = (memberName || "team-member")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Stream upload via buffer to avoid base64 size inflation
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "wonderist-team",
          public_id: `${slug}-${Date.now()}`,
          transformation: [
            { width: 1000, crop: "limit" },
            { quality: "auto", fetch_format: "webp" },
          ],
          format: "webp",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("No result"));
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

