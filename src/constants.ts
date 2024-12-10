export const CONSTANTS = {
  DEFAULT_PIXEL_SIZE: 1,
  MAX_PIXEL_SIZE: 50,
  MIN_PIXEL_SIZE: 1,
  PREVIEW_DELAY: 100,
  PREVIEW_SIZE: 300,
} as const;

export const LOADING_MESSAGES = {
  PREVIEW: "Updating preview...",
  PIXELIZING: "Pixelizing image...",
  UPLOADING: "Uploading fill...",
  INITIAL: "Loading image...",
  NO_SELECTION: "Select an image to begin",
} as const;
