<script lang="ts">
  import { LoaderCircle } from "@lucide/svelte";

  let { message = "Memuat..." }: { message?: string } = $props();
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center gap-3">
  <LoaderCircle class="h-8 w-8 animate-spin text-neutral-500" />
  <p class="text-sm text-neutral-500">{message}</p>
</div>
