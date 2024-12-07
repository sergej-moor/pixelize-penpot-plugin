interface ProcessedImage {
  previewUrl: string;
  finalUrl: string;
  data: Uint8Array;
}

export async function processImage(
  imageData: Uint8Array,
  width: number,
  height: number,
  pixelSize: number
): Promise<ProcessedImage> {
  // Create a blob from the image data
  const blob = new Blob([imageData], { type: "image/png" });
  const imageBitmap = await createImageBitmap(blob);

  // Create canvas for processing
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Draw original image
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // Get image data
  const originalData = ctx.getImageData(0, 0, width, height);

  // Pixelate
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get the color of the first pixel in the block
      const pixelIndex = (y * width + x) * 4;
      const r = originalData.data[pixelIndex];
      const g = originalData.data[pixelIndex + 1];
      const b = originalData.data[pixelIndex + 2];
      const a = originalData.data[pixelIndex + 3];

      // Fill the block with that color
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // Get the processed image as blob
  const processedBlob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), "image/png")
  );

  // Convert blob to array buffer
  const arrayBuffer = await processedBlob.arrayBuffer();
  const processedData = new Uint8Array(arrayBuffer);

  // Create URLs for preview
  const previewUrl = URL.createObjectURL(processedBlob);
  const finalUrl = previewUrl;

  return {
    previewUrl,
    finalUrl,
    data: processedData,
  };
}

export function cleanupImageUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
}
