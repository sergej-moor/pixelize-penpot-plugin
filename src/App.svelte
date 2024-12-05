<script lang="ts">
  import Controls from './components/Controls.svelte';
  import Preview from './components/Preview.svelte';
  import { theme, updateTheme } from './stores/theme';
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'theme') {
      updateTheme(event.data.content);
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  
  
  <div class="flex flex-col gap-2">
   
  <Preview></Preview>
  <Controls></Controls>
  </div>
  
</main>

<style>
  main {
    padding: var(--spacing-8);
  }
</style>



