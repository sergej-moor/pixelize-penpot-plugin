export type PluginMessageEvent =
  | { type: "theme"; content: string }
  | { type: "selection"; content: any }
  | {
      type: "selection-loaded";
      imageData: number[];
      width: number;
      height: number;
    }
  | { type: "selection-loading"; isLoading: boolean }
  | {
      type: "update-image-fill";
      imageData: number[];
      fillIndex?: number;
      originalFill: any;
      shouldDeleteFirst: boolean;
    }
  | { type: "fill-upload-complete" };
// Add more message types here
