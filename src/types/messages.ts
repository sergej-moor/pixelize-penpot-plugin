import type { PluginMessage } from "./types";

export interface MessageHandlerInterface {
  handle(event: MessageEvent<PluginMessage>): void;
}
