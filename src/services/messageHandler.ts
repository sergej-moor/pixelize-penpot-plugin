import type { PluginMessage } from '../types';
import { updateTheme } from '../stores/theme';
import {
  updateSelection,
  updateExportedImage,
  setUploadingFill,
  setLoading,
} from '../stores/selection';
import { selection } from '../stores/selection';
import type { SelectionState } from '../types';

export class MessageHandler {
  static handle(event: MessageEvent<PluginMessage>): void {
    try {
      const message = event.data;

      switch (message.type) {
        case 'theme':
          updateTheme(message.content);
          break;

        case 'selection': {
          const selectionData = message.content && {
            id: message.content.id,
            name: message.content.name,
            fills: message.content.fills as unknown[],
          };
          updateSelection(selectionData);
          break;
        }

        case 'selection-loading':
          setLoading(message.isLoading);
          break;

        case 'selection-loaded':
          updateExportedImage(
            Array.from(message.imageData),
            message.width,
            message.height,
            message.selectionId
          );
          break;

        case 'fill-upload-complete':
          setUploadingFill(false);
          break;

        case 'export-error':
          console.error('Export error:', message.error);
          setLoading(false);
          selection.update((state: SelectionState) => ({
            ...state,
            error:
              'Export failed. The image might be too large or in a unsupported file format.',
          }));
          break;

        default:
          console.warn(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handler error:', error);
      setLoading(false);
    }
  }
}
