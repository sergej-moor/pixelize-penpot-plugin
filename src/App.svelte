<script lang="ts">
  import Controls from './components/Controls.svelte';
  import Preview from './components/Preview.svelte';
  import { theme, updateTheme } from './stores/theme';
  import { 
    selection, 
    updateSelection, 
    updateExportedImage,
    setUploadingFill,
    setLoading
  } from './stores/selection';
  
  const handleMessage = (event: MessageEvent) => {
    switch (event.data.type) {
      case 'theme':
        updateTheme(event.data.content);
        break;
      case 'selection':
        updateSelection(event.data.content);
        break;
      case 'selection-loading':
        setLoading(event.data.isLoading);
        break;
      case 'selection-loaded':
        updateExportedImage(
          event.data.imageData,
          event.data.width,
          event.data.height,
          event.data.selectionId
        );
        break;
      case 'fill-upload-complete':
        setUploadingFill(false);
        break;
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  
  
  <div class="flex flex-col gap-2">
   <h2 >Pixelize!</h2>
  <Preview></Preview>
  <Controls></Controls>
  </div>
  
</main>

<style>
  main {
    padding: var(--spacing-8);
  }
</style>



