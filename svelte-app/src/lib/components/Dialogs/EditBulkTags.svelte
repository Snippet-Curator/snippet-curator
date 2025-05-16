<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import pb from '$lib/db.svelte';
	import type { Tag } from '$lib/types';
	import { onMount } from 'svelte';

	type Props = {
		isOpen: boolean;
		addAll: (selectedTagIDs: string[]) => void;
		clearAll: () => void;
	};

	let { isOpen = $bindable(), addAll, clearAll }: Props = $props();

	let searchText = $state('');
	let tagList: Tag[];
	let selectedTags: Tag[] = $state([]);
	let uniqueSelectedTags = $derived(new Set(selectedTags.map((tag) => tag.id)));

	let tags = $derived.by(() => {
		return tagList.filter((tag) => !uniqueSelectedTags.has(tag.id));
	});

	onMount(async () => {
		tagList = await pb.collection('tags').getFullList({
			sort: `name`
		});
	});
</script>

<Command.Dialog bind:open={isOpen}>
	<Command.Input bind:value={searchText} placeholder="Search Tags..." />

	<Command.List>
		<Command.Empty>No tag found.</Command.Empty>
		<Command.Group heading="">
			{#await tags then tags}
				{#if tags}
					{#each tags as tag}
						<Command.Item
							onSelect={() => {
								if (!selectedTags.some((t) => t.id === tag.id)) {
									selectedTags.push(tag);
									searchText = '';
								}
							}}
							>{tag.name}
						</Command.Item>
					{/each}
				{/if}
			{/await}
		</Command.Group>
	</Command.List>
	{#if selectedTags.length > 0}
		<div class="gap-golden-sm p-golden-md border-t-base-content/10 flex flex-wrap border-t">
			{#each selectedTags as tag}
				<button
					onclick={() => {
						selectedTags = selectedTags.filter((t) => t.id != tag.id);
					}}
					class="badge hover:badge-ghost text-nowrap">{tag.name} x</button
				>
			{/each}
		</div>
	{/if}
	<div class="gap-x-golden-md p-golden-md border-t-base-content/10 flex w-full border-t">
		<div class="grow"></div>
		<button
			onclick={() => {
				clearAll();
				isOpen = false;
			}}
			class="btn">Clear all existing note tags</button
		>
		<button
			onclick={() => {
				addAll([...uniqueSelectedTags]);
				isOpen = false;
			}}
			class="btn btn-primary">Add tags to all notes</button
		>
	</div>
</Command.Dialog>
