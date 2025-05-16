<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import pb from '$lib/db.svelte';
	import type { Tag } from '$lib/types';
	import { onMount } from 'svelte';

	type Props = {
		isOpen: boolean;
		currentTags: Tag[];
		add: (selectedTagID: string) => void;
		remove: (selectedTagID: string) => void;
	};

	let { isOpen = $bindable(), add, remove, currentTags = [] }: Props = $props();

	let tagList: Tag[];
	let currentTagList = $derived(new Set(currentTags.map((tag) => tag.id)));

	let tags = $derived.by(async () => {
		return tagList.filter((tag) => !currentTagList.has(tag.id));
	});

	onMount(async () => {
		tagList = await pb.collection('tags').getFullList({
			sort: `name`
		});
	});
</script>

<Command.Dialog bind:open={isOpen}>
	<Command.Input placeholder="Search Tags..." />
	{#if currentTags}
		<div class="gap-golden-sm p-golden-md flex flex-wrap">
			{#each currentTags as currentTag}
				<button onclick={() => remove(currentTag.id)} class="badge hover:badge-ghost text-nowrap"
					>{currentTag.name} x</button
				>
			{/each}
		</div>
	{/if}
	<Command.List>
		<Command.Empty>No tag found.</Command.Empty>
		<Command.Group heading="">
			{#await tags then tags}
				{#if tags}
					{#each tags as tag}
						<Command.Item
							onSelect={() => {
								add(tag.id);
							}}
							>{tag.name}
						</Command.Item>
					{/each}
				{/if}
			{/await}
		</Command.Group>
	</Command.List>
</Command.Dialog>
