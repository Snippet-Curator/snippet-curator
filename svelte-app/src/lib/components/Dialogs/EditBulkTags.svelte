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
	<Command.Input placeholder="Search Tags..." />
	{#if selectedTags.length > 0}
		<div class="gap-golden-sm p-golden-md flex flex-wrap">
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
	<div class="gap-x-golden-md p-golden-md border-b-base-content/10 flex w-full border-b">
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
								}
							}}
							>{tag.name}
						</Command.Item>
					{/each}
				{/if}
			{/await}
		</Command.Group>
	</Command.List>
</Command.Dialog>
