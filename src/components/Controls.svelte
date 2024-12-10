<script lang="ts">
  import { selection, pixelateImage, updatePreview } from '../stores/selection';

  let currentValue = $selection.pixelSize;
  let displayValue = currentValue;
  let previewTimeout: number;

  // Update preview while dragging
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const pixelSize = parseInt(input.value);
    displayValue = pixelSize;
    
    // Clear previous timeout
    clearTimeout(previewTimeout);
    // Set new timeout
    previewTimeout = setTimeout(() => {
      updatePreview(pixelSize);
    }, 100);
  }

  // Update stored value without processing
  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const pixelSize = parseInt(input.value);
    currentValue = pixelSize;
    displayValue = pixelSize;
    // Update the store's pixelSize without processing
    selection.update(state => ({ ...state, pixelSize }));
  }

  function handleApplyEffect() {
    pixelateImage(currentValue, false);
  }

  function handleAddNewLayer() {
    pixelateImage(currentValue, true);
  }

  // Only update values from store when processing state changes
  $: if ($selection.isPixelizing || $selection.isUploadingFill) {
    currentValue = $selection.pixelSize;
    displayValue = currentValue;
  }

  // Check if buttons should be disabled
  $: isDisabled = !$selection.exportedImage || $selection.isPixelizing || $selection.isUploadingFill;
</script>

<div class="flex flex-col gap-4">
  <label class="slider-row">
    <span class="body-s">Pixel Size:</span>
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={displayValue}
          on:input={handleInput}
          on:change={handleChange}
          class="w-full {isDisabled || $selection.isPreviewLoading ? 'opacity-50' : ''}"
          disabled={isDisabled || $selection.isPreviewLoading}
        />
      </div>
      <span class="text-sm w-8 text-right">{displayValue}</span>
    </div>
  </label>

  <div class="flex gap-2">
    <button 
      on:click={handleApplyEffect}
      disabled={isDisabled}
      class="flex-1 bg-blue-500 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      Apply Effect
    </button>
    <button 
      on:click={handleAddNewLayer}
      disabled={isDisabled}
      class="flex-1 bg-green-500 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      Add New Layer
    </button>
  </div>
</div>

<style>
  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>