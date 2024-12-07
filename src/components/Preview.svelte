<script lang="ts">
  import { selection } from '../stores/selection';
</script>

<div class="bg-red-300 w-64 p-4">
  <h3 class="font-bold mb-2">{$selection.name || 'No selection'}</h3>
  {#if $selection.isPixelizing}
    <p>Pixelizing image...</p>
  {/if}
  {#if $selection.isUploadingFill}
    <p>Uploading fill...</p>
  {/if}
</div>