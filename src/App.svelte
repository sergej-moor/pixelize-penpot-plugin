<script lang="ts">
  import Controls from './components/Controls.svelte';
  import Preview from './components/Preview.svelte';
  import { theme } from './stores/theme';
  import { MessageHandler } from './services/messageHandler';
  import ErrorBoundary from './components/ErrorBoundary.svelte';

  function handlePreviewError(error: Error) {
    // Report to error tracking service
    console.error('Preview error:', error);
  }
</script>

<svelte:window onmessage={MessageHandler.handle} />

<main data-theme={$theme}>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">Pixelize!</h1>
    
    <!-- Wrap Preview with its own error boundary -->
    <ErrorBoundary 
      fallback="Unable to load preview. Please try selecting a different image."
      onError={handlePreviewError}
    >
      <Preview />
    </ErrorBoundary>

    <!-- Wrap Controls with its own error boundary -->
    <ErrorBoundary fallback="Controls are temporarily unavailable. Please refresh the page.">
      <Controls />
    </ErrorBoundary>
  </div>
</main>

<style>
  main {
    padding: var(--spacing-8);
    max-width: 408px; /* Match plugin width */
    margin: 0 auto;
  }
</style>



