export function createImageUrl(imageData: number[]): string {
  const blob = new Blob([new Uint8Array(imageData)], { type: "image/png" });
  return URL.createObjectURL(blob);
}

export function cleanupImageUrl(url?: string) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
