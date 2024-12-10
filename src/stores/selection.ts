import { writable, get } from "svelte/store";
import type { Fill } from "@penpot/plugin-types";
import { processImage } from "../utils/imageProcessing";

interface SelectionState {
  fills?: any[];
  name?: string;
  originalImage?: {
    data: number[];
    width: number;
    height: number;
  };
  exportedImage?: {
    data: number[];
    width: number;
    height: number;
  };
  previewData?: {
    data: number[];
    width: number;
    height: number;
  };
  isUploadingFill: boolean;
  isPixelizing: boolean;
  pixelSize: number;
  isLoading: boolean;
  isPreviewLoading: boolean;
}

const initialState: SelectionState = {
  isUploadingFill: false,
  isPixelizing: false,
  pixelSize: 1,
  isLoading: false,
  isPreviewLoading: false,
};

export const selection = writable<SelectionState>(initialState);

export function updateSelection(shapes: any) {
  selection.update(() => ({
    ...initialState,
    ...shapes,
  }));
}

export async function updatePreview(pixelSize: number) {
  const state = get(selection);
  if (!state.originalImage) return;

  try {
    selection.update((state) => ({ ...state, isPreviewLoading: true }));

    const processed = await processImage(
      new Uint8Array(state.originalImage.data),
      state.originalImage.width,
      state.originalImage.height,
      pixelSize
    );

    selection.update((state) => ({
      ...state,
      pixelSize,
      isPreviewLoading: false,
      previewData: {
        width: state.originalImage!.width,
        height: state.originalImage!.height,
        data: Array.from(processed.data),
      },
    }));
  } catch (error) {
    console.error("Failed to update preview:", error);
    selection.update((state) => ({ ...state, isPreviewLoading: false }));
  }
}

export async function pixelateImage(pixelSize: number, addNewLayer: boolean) {
  try {
    const state = get(selection);
    if (!state.originalImage || !state.fills?.length) return;

    selection.update((state) => ({ ...state, isPixelizing: true }));

    const processed = await processImage(
      new Uint8Array(state.originalImage.data),
      state.originalImage.width,
      state.originalImage.height,
      pixelSize
    );

    selection.update((state) => ({ ...state, isUploadingFill: true }));

    // Send the processed image to be uploaded
    const message = {
      type: "update-image-fill" as const,
      imageData: Array.from(processed.data),
      fillIndex: 0,
      originalFill: state.fills[state.fills.length - 1],
      shouldDeleteFirst: !addNewLayer && state.fills.length >= 2,
      addNewLayer,
    };
    window.parent.postMessage(message, "*");

    // Update the preview with the processed image
    selection.update((state) => ({
      ...state,
      pixelSize,
      isPixelizing: false,
      exportedImage: {
        width: state.originalImage!.width,
        height: state.originalImage!.height,
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
    originalImage: {
      data: imageData,
      width,
      height,
    },
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
