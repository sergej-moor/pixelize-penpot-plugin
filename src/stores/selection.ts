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
  id?: string;
}

const initialState: SelectionState = {
  isUploadingFill: false,
  isPixelizing: false,
  pixelSize: 1,
  isLoading: false,
  isPreviewLoading: false,
  id: undefined,
};

export const selection = writable<SelectionState>(initialState);

export function updateSelection(shapes: any) {
  // If no shapes or shapes is null, reset to initial state
  if (!shapes) {
    selection.set(initialState);
    return;
  }

  // Generate a new ID for this selection
  const newId = shapes.id || Math.random().toString(36).substring(2);

  // Reset all image and processing states, but keep the new selection info
  selection.update(() => ({
    ...initialState,
    id: newId,
    name: shapes.name,
    fills: shapes.fills,
    // Clear all image data
    originalImage: undefined,
    exportedImage: undefined,
    previewData: undefined,
  }));
}

export async function updatePreview(pixelSize: number) {
  const state = get(selection);
  if (!state.originalImage || !state.name || !state.fills || !state.id) return;
  const currentId = state.id;

  try {
    selection.update((state) => ({ ...state, isPreviewLoading: true }));

    const processed = await processImage(
      new Uint8Array(state.originalImage.data),
      state.originalImage.width,
      state.originalImage.height,
      pixelSize
    );

    // Check if we still have the same selection
    const currentState = get(selection);
    if (
      !currentState.name ||
      !currentState.fills ||
      currentState.id !== currentId
    ) {
      return;
    }

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
  const state = get(selection);
  if (!state.originalImage || !state.fills?.length || !state.name) return;

  try {
    selection.update((state) => ({ ...state, isPixelizing: true }));

    const processed = await processImage(
      new Uint8Array(state.originalImage.data),
      state.originalImage.width,
      state.originalImage.height,
      pixelSize
    );

    // Check if we still have a selection before continuing
    const currentState = get(selection);
    if (!currentState.name || !currentState.fills) {
      return;
    }

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
  height: number,
  selectionId: string
) {
  selection.update((state) => {
    // Only update if we still have the same selection
    if (!state.name || !state.fills || state.id !== selectionId) {
      return state;
    }

    return {
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
    };
  });
}

export function setUploadingFill(isUploading: boolean) {
  selection.update((state) => {
    // Only update if we still have a selection
    if (!state.name || !state.fills) {
      return initialState;
    }
    return {
      ...state,
      isUploadingFill: isUploading,
    };
  });
}

export function setLoading(isLoading: boolean) {
  selection.update((state) => {
    // If setting to false and we don't have a selection, reset to initial state
    if (!isLoading && (!state.name || !state.fills)) {
      return initialState;
    }
    return {
      ...state,
      isLoading,
    };
  });
}
