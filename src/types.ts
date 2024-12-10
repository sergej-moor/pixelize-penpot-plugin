export type PluginMessage =
  | { type: "theme"; content: string }
  | { type: "selection"; content: SelectionState | null }
  | { type: "selection-loaded"; imageData: ImageData & { selectionId: string } }
  | { type: "selection-loading"; isLoading: boolean }
  | {
      type: "update-image-fill";
      imageData: ImageData & { addNewLayer: boolean };
    }
  | { type: "fill-upload-complete" }
  | { type: "delete-top-layer" };
// Add more message types here

export interface ImageData {
  data: number[];
  width: number;
  height: number;
}

export interface SelectionState {
  fills?: any[];
  name?: string;
  originalImage?: ImageData;
  exportedImage?: ImageData;
  previewImage?: ImageData;
  isUploadingFill: boolean;
  isPixelizing: boolean;
  pixelSize: number;
  isLoading: boolean;
  isPreviewLoading: boolean;
  id?: string;
}
