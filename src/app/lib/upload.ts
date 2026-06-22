export async function uploadToCloudinary(
  file: File,
  memberName: string
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  // Step 1: Get a signed upload URL from our API
  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberName }),
  });

  if (!signRes.ok) {
    throw new Error("Failed to get upload signature");
  }

  const { signature, timestamp, publicId, apiKey, cloudName } =
    await signRes.json();

  // Step 2: Upload directly from the browser to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("public_id", publicId);
  formData.append("transformation", "w_1000,c_limit/q_auto,f_webp");
  formData.append("format", "webp");

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const result = await uploadRes.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}
