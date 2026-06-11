"use client";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type UploadKind = "image" | "pdf";

// Handles an ID/photo upload: images get resized to a compact JPEG; PDFs pass
// through as-is. Returns the data URL + kind, and throws if a PDF is too large.
export async function fileToUploadData(
  file: File,
  maxImageSize = 1400,
  quality = 0.8,
): Promise<{ dataUrl: string; kind: UploadKind }> {
  if (file.type === "application/pdf") {
    if (file.size > 2_300_000) {
      throw new Error("PDF is too large (max ~2 MB). Try uploading clear photos instead.");
    }
    return { dataUrl: await readAsDataUrl(file), kind: "pdf" };
  }
  return { dataUrl: await fileToResizedDataUrl(file, maxImageSize, quality), kind: "image" };
}

// Resize an image File to a compact JPEG data URL (keeps uploads small enough to
// store in the DB / send in a JSON body). maxSize caps the longest edge.
export async function fileToResizedDataUrl(
  file: File,
  maxSize = 1000,
  quality = 0.72,
): Promise<string> {
  const dataUrl = await readAsDataUrl(file);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
