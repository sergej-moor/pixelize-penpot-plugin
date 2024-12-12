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
  INITIAL: "Loading selection",
  NO_SELECTION: "Select something to begin",
} as const;
