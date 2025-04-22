<script lang="ts">
	let { tags } = $props();
</script>

{#if tags}
	{#each tags as tag}
		<span class="badge">{tag.name}</span>
	{/each}
{/if}
