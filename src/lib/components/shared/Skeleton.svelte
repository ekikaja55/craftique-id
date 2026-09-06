<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<div
  class="animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 {className}"
></div>
