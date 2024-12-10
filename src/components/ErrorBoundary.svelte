<script lang="ts">
  import { onError } from 'svelte';
  
  let error: Error | null = null;
  
  onError((e) => {
    error = e.error;
    console.error('Caught error:', e.error);
  });
</script>

{#if error}
  <div class="error-boundary p-4 bg-red-100 text-red-700 rounded">
    <p>Something went wrong:</p>
    <pre class="text-sm mt-2">{error.message}</pre>
  </div>
{:else}
  <slot />
{/if} 