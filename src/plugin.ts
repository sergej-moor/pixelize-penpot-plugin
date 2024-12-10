import type { PluginMessageEvent } from "./types";
import type { Fill } from "@penpot/plugin-types";

// Helper function to generate a unique ID
function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

penpot.ui.open("Plugin Template", `?theme=${penpot.theme}`, {
  width: 308,
  height: 512,
});

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

        const newFill: Fill = {
          ...message.originalFill,
          fillImage: imageData,
        };

        // Handle fill array modification based on shouldDeleteFirst flag
        if (Array.isArray(selection.fills)) {
          const lastFill = selection.fills[selection.fills.length - 1]; // Keep the original image fill
          if (message.shouldDeleteFirst && selection.fills.length >= 2) {
            // Replace all fills except the last one with the new fill
            selection.fills = [newFill, lastFill];
          } else {
            // Add new fill at the beginning, keep the original at the end
            selection.fills = [newFill, lastFill];
          }
        } else {
          selection.fills = [newFill];
        }

        sendMessage({ type: "fill-upload-complete" });
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

    // First send the initial selection with name and ID
    sendMessage({
      type: "selection",
      content: {
        id: selection.id,
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

      // Send the exported image data
      sendMessage({
        type: "selection-loaded",
        imageData: Array.from(imageData),
        width: selection.width,
        height: selection.height,
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
