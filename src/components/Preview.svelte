<script lang="ts">
  import { selection } from '../stores/selection';
  import { CONSTANTS, LOADING_MESSAGES } from '../constants';
  import Spinner from './Spinner.svelte';
  import { onDestroy } from 'svelte';
  import { createImageUrl, revokeImageUrl } from '../utils/imageUrl';

  let previewUrl: string | undefined;
  
  // Create URL from image data
  $: {
    const imageData = $selection.previewImage?.data || $selection.exportedImage?.data;
    
    // Cleanup old URL
    revokeImageUrl(previewUrl);
    
    // Create new URL if we have image data
    previewUrl = imageData ? createImageUrl(imageData) : undefined;
  }

  $: displayName = $selection.name 
    ? ($selection.name.length > 28 ? $selection.name.slice(0, 25) + '...' : $selection.name) 
    : 'No selection';

  $: loadingMessage = $selection.isPreviewLoading 
    ? LOADING_MESSAGES.PREVIEW
    : $selection.isPixelizing 
      ? LOADING_MESSAGES.PIXELIZING 
      : LOADING_MESSAGES.UPLOADING;

  onDestroy(() => {
    revokeImageUrl(previewUrl);
  });
</script>

<h3 class="font-bold text-sm">Selection: {displayName}</h3>

<div class="rounded-lg border border-gray-200 dark:border-gray-700">
  <div class="relative w-[300px] h-[300px] min-h-[100px]">
    {#if previewUrl}
      <!-- Preview Image -->
      <div class="flex items-center justify-center relative w-full h-full">
        <img 
          src={previewUrl} 
          alt="Selected shape" 
          class="w-[300px] h-[300px] max-w-full max-h-[300px] p-2 object-contain rounded transition-opacity"
          class:opacity-50={$selection.isPreviewLoading}
        />

        <!-- Loading Overlay -->
        {#if $selection.isPreviewLoading || $selection.isPixelizing || $selection.isUploadingFill}
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded transition-all duration-200">
            <Spinner />
            <p class="text-sm text-white font-medium">{loadingMessage}</p>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Initial State -->
      <div class="flex items-center justify-center w-full h-full">
        <p class="text-sm">
          {#if $selection.name}
            <Spinner />
            {LOADING_MESSAGES.INITIAL}
          {:else}
            {LOADING_MESSAGES.NO_SELECTION}
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>