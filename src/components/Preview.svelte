<script lang="ts">
  import { selection } from '../stores/selection';

  // Track URLs for cleanup
  let previewUrls: string[] = [];
  
  // Create URL from image data
  $: if ($selection.exportedImage?.data) {
    // Cleanup old URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new URL from image data
    const blob = new Blob([new Uint8Array($selection.exportedImage.data)], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    previewUrls = [url];
  }

  // Cleanup URLs when component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  });
</script>

<div class="preview-container p-4 rounded-lg border border-gray-200 dark:border-gray-700">
  <h3 class="font-bold mb-2 text-sm">{$selection.name || 'No selection'}</h3>
  
  <div class="preview-content relative">
    {#if previewUrls[0] && $selection.exportedImage}
      <div class="image-preview">
        <img 
          src={previewUrls[0]} 
          alt="Selected shape" 
          class="w-full h-auto rounded"
          style="width: {$selection.exportedImage.width}px; height: {$selection.exportedImage.height}px; object-fit: contain;"
        />
        {#if $selection.isPixelizing || $selection.isUploadingFill}
          <div class="loading-overlay absolute inset-0 flex items-center justify-center bg-black/50 rounded">
            <p class="text-sm text-white font-medium">
              {#if $selection.isPixelizing}
                Pixelizing image...
              {:else}
                Uploading fill...
              {/if}
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="empty-state flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {#if $selection.name }
            Loading image...
          {:else}
            Select an image to begin
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview-container {
    background: var(--surface-color, white);
  }

  .preview-content {
    min-height: 100px;
    width: 300px;
    height: 300px;
  }

  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  img {
    max-width: 100%;
    max-height: 300px;
    width: 300px;
    height: 300px;
  }

  .loading-overlay {
    backdrop-filter: blur(2px);
  }
</style>