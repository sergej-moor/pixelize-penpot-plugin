<script lang="ts">
  import { selection, processImage, updatePreview } from '../stores/selection';
  import { CONSTANTS } from '../constants';
  import { tooltip } from '../actions/tooltip';

  let currentValue = $selection.effectIntensity;
  let displayValue = currentValue;
  let lastSelectionId = $selection.id;
  let realtimePreview = false;
  let previousRealtimeState = false;

  // Just update the display value during dragging
  function handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    displayValue = parseInt(input.value);
  }

  // Update preview when slider is released
  function handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pixelSize = parseInt(input.value);
    currentValue = pixelSize;
    displayValue = pixelSize;

    updatePreview(pixelSize);

    if (realtimePreview) {
      handleApplyEffect();
    }
  }

  // Watch for changes in realtime preview and selection fills
  $: {
    if (previousRealtimeState !== realtimePreview) {
      if (realtimePreview) {
        handleApplyEffect();
      } else if ($selection.fills.length > 0) {
        handleDeleteTopLayer();
      }
      previousRealtimeState = realtimePreview;
    }
  }

  function handleApplyEffect(): void {
    processImage(currentValue, false);
  }

  function handleAddNewLayer(): void {
    processImage(currentValue, true);
  }

  function handleDeleteTopLayer(): void {
    window.parent.postMessage(
      {
        type: 'delete-top-layer',
      },
      '*'
    );
  }

  // Only update values when selection changes (new image selected)
  $: if ($selection.id !== lastSelectionId) {
    currentValue = $selection.effectIntensity;
    displayValue = currentValue;
    lastSelectionId = $selection.id;
  }

  // Check if controls should be disabled
  $: isDisabled = !$selection.processedImage;
  $: isProcessing =
    $selection.isProcessing ||
    $selection.isUploadingFill ||
    $selection.isPreviewLoading;
  $: shouldDisableApply = isDisabled || isProcessing || realtimePreview;
</script>

<div class="flex flex-col gap-4">
  <div class="checkbox-container flex items-center justify-end gap-2">
    <div
      use:tooltip={{
        text: 'Automatically apply changes while adjusting pixel size',
        position: 'left',
        maxWidth: 'max-w-[200px]',
      }}
    >
      <label for="realtimePreview" class="text-sm"> Realtime </label>
      <input
        id="realtimePreview"
        type="checkbox"
        bind:checked={realtimePreview}
        disabled={isDisabled || isProcessing}
        class="checkbox-input"
      />
    </div>
  </div>

  <label class="slider-row">
    <span
      class="body-s"
      use:tooltip={{
        text: 'Adjust the size of pixels in the effect',
        maxWidth: 'max-w-[200px]',
        position: 'right',
      }}
    >
      Pixel Size
    </span>
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <input
          type="range"
          min={CONSTANTS.MIN_PIXEL_SIZE}
          max={CONSTANTS.MAX_PIXEL_SIZE}
          value={displayValue}
          on:input={handleInput}
          on:change={handleChange}
          class="w-full {isDisabled || isProcessing ? 'opacity-50' : ''}"
          disabled={isDisabled || isProcessing}
        />
      </div>
      <span class="text-sm w-8 text-right">{displayValue}</span>
    </div>
  </label>

  <div class="flex flex-col gap-2">
    <button
      on:click={handleApplyEffect}
      data-appearance="primary"
      disabled={shouldDisableApply}
      class:opacity-50={realtimePreview}
      class="flex-1 flex justify-center gap-2 items-center"
      use:tooltip={{
        text: 'Apply a pixelated fill layer to the current shape',
        position: 'top',
        maxWidth: 'max-w-[300px]',
      }}
    >
      {realtimePreview ? 'Auto-applying changes' : 'Apply to shape'}
    </button>

    <button
      on:click={handleAddNewLayer}
      disabled={isDisabled || isProcessing}
      data-appearance="primary"
      class="flex-1 flex justify-center gap-2 items-center"
      use:tooltip={{
        text: 'Create a new shape with the pixelation effect',
        position: 'bottom',
        maxWidth: 'max-w-[300px]',
      }}
    >
      Create new Shape
    </button>
  </div>
</div>
