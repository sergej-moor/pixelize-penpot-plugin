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
  isLoading: boolean;
}

const initialState: SelectionState = {
  isUploadingFill: false,
  isPixelizing: false,
  pixelSize: 1,
  isLoading: false,
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

    // Send the processed image to be uploaded
    const message = {
      type: "update-image-fill" as const,
      imageData: Array.from(processed.data),
      fillIndex: 0,
      originalFill: state.fills[state.fills.length - 1],
      shouldDeleteFirst: state.fills.length >= 2,
    };
    window.parent.postMessage(message, "*");

    // Update the preview immediately with the processed image
    selection.update((state) => ({
      ...state,
      pixelSize,
      isPixelizing: false,
      exportedImage: {
        ...state.exportedImage,
        data: Array.from(processed.data),
      },
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
    isLoading: false,
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

export function setLoading(isLoading: boolean) {
  selection.update((state) => ({
    ...state,
    isLoading,
  }));
}