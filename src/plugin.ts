import type { PluginMessageEvent } from "./types";
import type { Fill } from "@penpot/plugin-types";

penpot.ui.open("Plugin Template", `?theme=${penpot.theme}`, {
  width: 408,
  height: 612,
});

async function addNewPixelatedLayer(data: {
  imageData: number[];
  width: number;
  height: number;
  originalFill: any;
}) {
  const blockId = penpot.history.undoBlockBegin();
  try {
    // Upload the processed image data
    const image = await penpot.uploadMediaData(
      "pixelated-image",
      new Uint8Array(data.imageData),
      "image/png"
    );

    if (image) {
      // Create a new rectangle with the same dimensions as original
      const rect = penpot.createRectangle();
      rect.x = penpot.viewport.center.x;
      rect.y = penpot.viewport.center.y;
      rect.resize(data.width, data.height);
      rect.fills = [
        {
          ...data.originalFill,
          fillImage: image,
        },
      ];

      sendMessage({ type: "fill-upload-complete" });
    }
  } catch (error) {
    console.error("Error creating new layer:", error);
  } finally {
    penpot.history.undoBlockFinish(blockId);
  }
}

// Handle messages from UI
penpot.ui.onMessage(async (message: PluginMessageEvent) => {
  if (message.type === "update-image-fill") {
    const selection = penpot.selection[0];
    if (selection) {
      try {
        const imageData = await penpot.uploadMediaData(
          "exported-image",
          new Uint8Array(message.imageData),
          "image/png"
        );

        if (message.addNewLayer) {
          // Create new layer instead of updating existing
          await addNewPixelatedLayer({
            imageData: message.imageData,
            width: selection.width,
            height: selection.height,
            originalFill: message.originalFill,
          });
        } else {
          // Existing logic for updating current layer
          const newFill: Fill = {
            ...message.originalFill,
            fillImage: imageData,
          };

          if (Array.isArray(selection.fills)) {
            const lastFill = selection.fills[selection.fills.length - 1];
            if (message.shouldDeleteFirst && selection.fills.length >= 2) {
              selection.fills = [newFill, lastFill];
            } else {
              selection.fills = [newFill, lastFill];
            }
          } else {
            selection.fills = [newFill];
          }

          sendMessage({ type: "fill-upload-complete" });
        }
      } catch (error) {
        console.error("Error updating image fill:", error);
      }
    }
  }
});

// Listen for theme changes and send them to UI
penpot.on("themechange", (theme: string) => {
  sendMessage({ type: "theme", content: theme });
});

// Listen for selection changes and send them to UI
penpot.on("selectionchange", async () => {
  const selection = penpot.selection[0];

  if (!selection) {
    sendMessage({ type: "selection", content: null });
    return;
  }

  try {
    // Set loading state immediately
    sendMessage({ type: "selection-loading", isLoading: true });

    const selectionId = Math.random().toString(36).substring(2);

    // First send the initial selection with name and ID
    sendMessage({
      type: "selection",
      content: {
        id: selectionId,
        name: selection.name,
        fills: selection.fills,
      },
    });

    if (Array.isArray(selection.fills)) {
      // Export the image from the shape
      const imageData = await selection.export({
        type: "png",
        scale: 2,
      });

      // Send the exported image data with the selection ID
      sendMessage({
        type: "selection-loaded",
        imageData: Array.from(imageData),
        width: selection.width,
        height: selection.height,
        selectionId,
      });
    } else {
      // Clear loading state if no fills
      sendMessage({ type: "selection-loading", isLoading: false });
    }
  } catch (error) {
    console.error("Error exporting selection:", error);
    // Clear loading state on error
    sendMessage({ type: "selection-loading", isLoading: false });
  }
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}
