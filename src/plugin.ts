import type { PluginMessage } from "./types";
import type { Fill } from "@penpot/plugin-types";

const PLUGIN_CONFIG = {
  name: "Pixelize",
  width: 340,
  height: 662,
} as const;

// Initialize plugin
penpot.ui.open(PLUGIN_CONFIG.name, `?theme=${penpot.theme}`, {
  width: PLUGIN_CONFIG.width,
  height: PLUGIN_CONFIG.height,
});

async function addNewPixelatedLayer(data: {
  imageData: number[];
  width: number;
  height: number;
  originalFill: Fill;
}): Promise<void> {
  const blockId = penpot.history.undoBlockBegin();

  try {
    const image = await uploadImage(data.imageData);
    if (!image) return;

    createPixelatedShape({
      width: data.width,
      height: data.height,
      fill: { ...data.originalFill, fillImage: image },
    });

    sendMessage({ type: "fill-upload-complete" });
  } catch (error) {
    console.error("Error creating new layer:", error);
  } finally {
    penpot.history.undoBlockFinish(blockId);
  }
}

async function updateExistingLayer(
  selection: any,
  imageData: number[],
  originalFill: Fill,
  shouldDeleteFirst: boolean
): Promise<void> {
  const image = await uploadImage(imageData);
  if (!image) return;

  const newFill: Fill = { ...originalFill, fillImage: image };

  if (Array.isArray(selection.fills)) {
    const lastFill = selection.fills[selection.fills.length - 1];
    selection.fills = shouldDeleteFirst
      ? [newFill, lastFill]
      : [newFill, lastFill];
  } else {
    selection.fills = [newFill];
  }

  sendMessage({ type: "fill-upload-complete" });
}

async function uploadImage(imageData: number[]): Promise<string | null> {
  try {
    return await penpot.uploadMediaData(
      "exported-image",
      new Uint8Array(imageData),
      "image/png"
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

function createPixelatedShape({
  width,
  height,
  fill,
}: {
  width: number;
  height: number;
  fill: Fill;
}): void {
  const rect = penpot.createRectangle();
  rect.x = penpot.viewport.center.x;
  rect.y = penpot.viewport.center.y;
  rect.resize(width, height);
  rect.fills = [fill];
}

// Message handlers
penpot.ui.onMessage(async (message: PluginMessage) => {
  if (message.type === "update-image-fill") {
    const selection = penpot.selection[0];
    if (!selection) return;

    try {
      if (message.addNewLayer) {
        await addNewPixelatedLayer({
          imageData: message.imageData,
          width: selection.width,
          height: selection.height,
          originalFill: message.originalFill,
        });
      } else {
        await updateExistingLayer(
          selection,
          message.imageData,
          message.originalFill,
          message.shouldDeleteFirst
        );
      }
    } catch (error) {
      console.error("Error updating image fill:", error);
    }
  }
});

// Event listeners
penpot.on("themechange", (theme: string) => {
  sendMessage({ type: "theme", content: theme });
});

penpot.on("selectionchange", handleSelectionChange);

async function handleSelectionChange() {
  const selection = penpot.selection[0];
  if (!selection) {
    sendMessage({ type: "selection", content: null });
    return;
  }

  try {
    sendMessage({ type: "selection-loading", isLoading: true });
    const selectionId = Math.random().toString(36).substring(2);

    // Send initial selection data
    sendMessage({
      type: "selection",
      content: {
        id: selectionId,
        name: selection.name,
        fills: selection.fills,
      },
    });

    if (Array.isArray(selection.fills)) {
      const imageData = await selection.export({ type: "png", scale: 2 });
      sendMessage({
        type: "selection-loaded",
        imageData: Array.from(imageData),
        width: selection.width,
        height: selection.height,
        selectionId,
      });
    } else {
      sendMessage({ type: "selection-loading", isLoading: false });
    }
  } catch (error) {
    console.error("Error exporting selection:", error);
    sendMessage({ type: "selection-loading", isLoading: false });
  }
}

function sendMessage(message: PluginMessage): void {
  penpot.ui.sendMessage(message);
}
