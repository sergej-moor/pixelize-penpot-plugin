<script lang="ts">
  import { selection } from '../stores/selection';
  import { CONSTANTS } from '../constants';

  // Track URL for cleanup
  let previewUrl: string | undefined;
  
  // Create URL from image data
  $: if ($selection.previewImage?.data || $selection.exportedImage?.data) {
    // Cleanup old URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Use preview data if available, otherwise use exported image
    const imageData = $selection.previewImage?.data || $selection.exportedImage?.data;
    if (imageData) {
      const blob = new Blob([new Uint8Array(imageData)], { type: 'image/png' });
      previewUrl = URL.createObjectURL(blob);
    }
  }

  // Cleanup URL when component is destroyed
  import { onDestroy } from 'svelte';
  import Spinner from './Spinner.svelte';
  onDestroy(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  });
</script>

<h3 class="font-bold text-sm ">Selection: {$selection.name || 'No selection'}</h3>

<div class="rounded-lg border border-gray-200 dark:border-gray-700">
  <div class="relative w-[300px] h-[300px] min-h-[100px]">
    {#if previewUrl && ($selection.previewImage || $selection.exportedImage)}
      <div class="flex items-center justify-center relative w-full h-full">
        <img 
          src={previewUrl} 
          alt="Selected shape" 
          class="w-[300px] h-[300px] max-w-full max-h-[300px] p-2 object-contain rounded transition-opacity {$selection.isPreviewLoading ? 'opacity-50' : ''}"
        />
        {#if $selection.isPreviewLoading || $selection.isPixelizing || $selection.isUploadingFill}
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded transition-all duration-200">
            <Spinner></Spinner>
            <p class="text-sm text-white font-medium">
              {#if $selection.isPreviewLoading}
                Updating preview...
              {:else if $selection.isPixelizing}
                Pixelizing...
              {:else}
                Uploading...
              {/if}
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex items-center justify-center w-full h-full">
        <p class="text-sm">
          {#if $selection.name}
          <Spinner></Spinner>
            Loading image...
          {:else}
            Select an image to begin
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>