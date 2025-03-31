<script lang="ts">
	let { tags } = $props();
</script>

{#each tags as tag}
	<span class="badge">{tag.name}</span>
{/each}
