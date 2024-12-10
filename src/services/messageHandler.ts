import type { PluginMessage } from "../types";
import { updateTheme } from "../stores/theme";
import {
  updateSelection,
  updateExportedImage,
  setUploadingFill,
  setLoading,
} from "../stores/selection";

export class MessageHandler {
  static handle(event: MessageEvent<PluginMessage>) {
    try {
      const { type, ...data } = event.data;

      switch (type) {
        case "theme":
          updateTheme(data.content);
          break;

        case "selection":
          updateSelection(data.content);
          break;

        case "selection-loading":
          setLoading(data.isLoading);
          break;

        case "selection-loaded":
          if (data.error) {
            console.error("Export error:", data.error);
            setLoading(false);
            // Show error in UI
            selection.update((state) => ({
              ...state,
              error:
                "Failed to export selection. Please try a different shape or refresh the page.",
            }));
            return;
          }
          updateExportedImage(
            data.imageData,
            data.width,
            data.height,
            data.selectionId
          );
          break;

        case "fill-upload-complete":
          setUploadingFill(false);
          break;

        case "export-error":
          console.error("Export error:", data.error);
          setLoading(false);
          selection.update((state) => ({
            ...state,
            error: "Export failed. The image might be too large or complex.",
          }));
          break;

        default:
          console.warn(`Unhandled message type: ${type}`);
      }
    } catch (error) {
      console.error("Message handler error:", error);
      setLoading(false);
    }
  }
}
