<script lang="ts">
  import { selection, pixelateImage } from '../stores/selection';

  let currentValue = $selection.pixelSize;
  let displayValue = currentValue;

  // Just update the visual value during dragging
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    displayValue = parseInt(input.value);
  }

  // Only process the image when the slider is released
  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const pixelSize = parseInt(input.value);
    currentValue = pixelSize;
    displayValue = pixelSize;
    pixelateImage(pixelSize);
  }

  // Update currentValue and displayValue when store changes and not loading
  $: if (!$selection.isPixelizing && !$selection.isUploadingFill) {
    currentValue = $selection.pixelSize;
    displayValue = currentValue;
  }

  // Check if slider should be disabled
  $: isDisabled = !$selection.exportedImage || $selection.isPixelizing || $selection.isUploadingFill;
</script>

<div class="">
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
          class="w-full {isDisabled ? 'opacity-50' : ''}"
          disabled={isDisabled}
        />
        {#if isDisabled}
          <div class="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            Loading image...
          </div>
        {/if}
      </div>
      <span class="text-sm w-8 text-right">{displayValue}</span>
    </div>
  </label>
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