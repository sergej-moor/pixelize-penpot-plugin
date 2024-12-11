import type { Fill, ImageData as PenpotImageData } from "@penpot/plugin-types";

export interface ImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

export interface SelectionState {
  id: string;
  name: string;
  fills: Fill[] | "mixed";
  isLoading: boolean;
  isPixelizing: boolean;
  isUploadingFill: boolean;
  isPreviewLoading: boolean;
  pixelSize: number;
  error?: string;
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
  previewImage?: {
    data: number[];
    width: number;
    height: number;
  };
}

export type PluginMessage =
  | { type: "theme"; content: string }
  | { type: "selection"; content: SelectionState | null }
  | {
      type: "selection-loaded";
      imageData: Uint8Array;
      width: number;
      height: number;
      selectionId: string;
    }
  | { type: "selection-loading"; isLoading: boolean }
  | {
      type: "update-image-fill";
      imageData: Uint8Array;
      addNewLayer: boolean;
      originalFill: Fill;
      shouldDeleteFirst: boolean;
    }
  | { type: "fill-upload-complete" }
  | { type: "delete-top-layer" }
  | { type: "clear-all-except-last" };
