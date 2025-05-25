<script lang="ts">
	let { tags } = $props();
</script>

{#if tags}
	<div class="flex gap-x-2 overflow-x-hidden">
		{#each tags as tag}
			<span class="badge text-nowrap">{tag.name}</span>
		{/each}
	</div>
{/if}
