<script lang="ts">
  import { selection, pixelateImage, updatePreview } from '../stores/selection';
  import { CONSTANTS } from '../constants';
  import { FilePlus,CopyPlus, Paintbrush } from 'lucide-svelte';


  let currentValue = $selection.pixelSize;
  let displayValue = currentValue;
  let lastSelectionId = $selection.id;
  let realtimePreview = false;
  let previousRealtimeState = false;

  // Just update the display value during dragging
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    displayValue = parseInt(input.value);
  }

  // Update preview when slider is released
  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const pixelSize = parseInt(input.value);
    currentValue = pixelSize;
    displayValue = pixelSize;
    
    // Update the preview
    updatePreview(pixelSize);

    // If realtime preview is enabled, apply the effect immediately
    if (realtimePreview) {
      handleApplyEffect();
    }
  }

  // Watch for changes to realtimePreview
  $: if (realtimePreview !== previousRealtimeState) {
    if (realtimePreview) {
      handleApplyEffect();
    } else if ($selection.fills && $selection.fills.length > 1) {
      // When realtime is turned off and we have multiple fills
      handleDeleteTopLayer();
    }
    previousRealtimeState = realtimePreview;
  }

  function handleApplyEffect() {
    pixelateImage(currentValue, false);
  }

  function handleAddNewLayer() {
    pixelateImage(currentValue, true);
  }

  function handleClearAllExceptLast() {
    window.parent.postMessage({
      type: "clear-all-except-last",
    }, "*");
  }

  function handleDeleteTopLayer() {
    window.parent.postMessage({
      type: "delete-top-layer",
    }, "*");
  }

  // Only update values when selection changes (new image selected)
  $: if ($selection.id !== lastSelectionId) {
    currentValue = $selection.pixelSize;
    displayValue = currentValue;
    lastSelectionId = $selection.id;
  }

  // Check if controls should be disabled
  $: isDisabled = !$selection.exportedImage;
  $: isProcessing = $selection.isPixelizing || $selection.isUploadingFill || $selection.isPreviewLoading;
  $: shouldDisableApply = isDisabled || isProcessing || realtimePreview;

  // Add this reactive variable to check if we have multiple fills
  $: hasMultipleFills = $selection.fills && $selection.fills.length > 1;
</script>

<div class="flex flex-col gap-4">
  <div class="checkbox-container flex items-center justify-end gap-2">
    <label for="realtimePreview" class=" text-sm">
      Realtime
    </label>
    <input
      id="realtimePreview"
      type="checkbox"
      bind:checked={realtimePreview}
      disabled={isDisabled || isProcessing}
      class="checkbox-input"
    />
   
  </div>

  <label class="slider-row">
    <span class="body-s">Pixel Size:</span>
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <input 
          type="range" 
          min={CONSTANTS.MIN_PIXEL_SIZE}
          max={CONSTANTS.MAX_PIXEL_SIZE}
          value={displayValue}
          on:input={handleInput}
          on:change={handleChange}
          class="w-full {(isDisabled || isProcessing) ? 'opacity-50' : ''}"
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
    >
      {realtimePreview ? 'Auto-applying changes' : 'Apply to shape'}
    </button>
    <button 
      on:click={handleAddNewLayer}
      disabled={isDisabled || isProcessing}
      data-appearance="primary"
      class="flex-1 flex justify-center gap-2 items-center"
    >
      Create new Shape
    </button>
  </div>
</div>

