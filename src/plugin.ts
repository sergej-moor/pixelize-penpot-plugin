import type { PluginMessageEvent } from "./types";

penpot.ui.open("Plugin Template", `?theme=${penpot.theme}`, {
  width: 308,
  height: 512,
});

// Handle messages from UI
penpot.ui.onMessage((message: PluginMessageEvent) => {
  // Add your message handlers here
});

// Listen for theme changes and send them to UI
penpot.on("themechange", (theme: string) => {
  sendMessage({ type: "theme", content: theme });
});

function sendMessage(message: PluginMessageEvent) {
  penpot.ui.sendMessage(message);
}
