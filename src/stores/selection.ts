import { writable, get } from "svelte/store";
import type { Fill } from "@penpot/plugin-types";
import { processImage } from "../utils/imageProcessing";

interface SelectionState {
  fills?: any[];
  name?: string;
  exportedImage?: {
    data: number[];
    width: number;
    height: number;
  };
  isUploadingFill: boolean;
  isPixelizing: boolean;
  pixelSize: number;
}

const initialState: SelectionState = {
  isUploadingFill: false,
  isPixelizing: false,
  pixelSize: 1,
};

export const selection = writable<SelectionState>(initialState);

export function updateSelection(shapes: any) {
  selection.update(() => ({
    ...initialState,
    ...shapes,
  }));
}

export async function pixelateImage(pixelSize: number) {
  try {
    const state = get(selection);
    if (!state.exportedImage || !state.fills?.length) return;

    selection.update((state) => ({ ...state, isPixelizing: true }));

    const processed = await processImage(
      new Uint8Array(state.exportedImage.data),
      state.exportedImage.width,
      state.exportedImage.height,
      pixelSize
    );

    selection.update((state) => ({ ...state, isUploadingFill: true }));

    // Always get the last fill (original image) as the basis for pixelization
    const originalFill = state.fills[state.fills.length - 1];

    const message = {
      type: "update-image-fill" as const,
      imageData: Array.from(processed.data),
      fillIndex: 0,
      originalFill,
      shouldDeleteFirst: state.fills.length >= 2,
    };
    window.parent.postMessage(message, "*");

    selection.update((state) => ({
      ...state,
      pixelSize,
      isPixelizing: false,
    }));
  } catch (error) {
    console.error("Failed to pixelate image:", error);
    selection.update((state) => ({ ...state, isPixelizing: false }));
  }
}

export function updateExportedImage(
  imageData: number[],
  width: number,
  height: number
) {
  selection.update((state) => ({
    ...state,
    exportedImage: {
      data: imageData,
      width,
      height,
    },
  }));
}

export function setUploadingFill(isUploading: boolean) {
  selection.update((state) => ({
    ...state,
    isUploadingFill: isUploading,
  }));
}
