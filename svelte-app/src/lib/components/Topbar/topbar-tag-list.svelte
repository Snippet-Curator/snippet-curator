<script lang="ts">
	let { tags } = $props();
</script>

{#if tags}
	{#each tags as tag}
		<span class="badge text-nowrap">{tag.name}</span>
	{/each}
{/if}
