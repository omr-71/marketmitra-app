const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_ENCODED_CHARACTERS = 5_700_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function validateCropImageFile(file: File): "too_large" | "unsupported" | null {
  if (file.size > MAX_UPLOAD_BYTES) return "too_large";
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "unsupported";
  return null;
}

export async function toCompactCropImageDataUrl(file: File): Promise<string> {
  const validationError = validateCropImageFile(file);
  if (validationError === "too_large") throw new Error("IMAGE_TOO_LARGE");
  if (validationError === "unsupported") throw new Error("UNSUPPORTED_IMAGE");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    if (bitmap.width < 64 || bitmap.height < 64 || bitmap.width * bitmap.height > 40_000_000) {
      throw new Error("IMAGE_TOO_LARGE");
    }
    let scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("IMAGE_DECODE_FAILED");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const quality = [0.9, 0.86, 0.82, 0.78, 0.74][attempt] ?? 0.74;
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_ENCODED_CHARACTERS) return dataUrl;
      scale *= 0.82;
    }
    throw new Error("IMAGE_TOO_LARGE");
  } finally {
    bitmap.close();
  }
}
