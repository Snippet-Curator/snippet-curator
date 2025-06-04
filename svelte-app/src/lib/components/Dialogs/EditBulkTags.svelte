<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { getTagState } from '$lib/db.svelte';
	import type { Tag } from '$lib/types';

	type Props = {
		isOpen: boolean;
		addAll: (selectedTagIDs: string[]) => void;
		clearAll: () => void;
	};

	let { isOpen = $bindable(), addAll, clearAll }: Props = $props();

	const tagState = getTagState();
	let searchText = $state('');
	let selectedTags: Tag[] = $state([]);
	let uniqueSelectedTags = $derived(new Set(selectedTags.map((tag) => tag.id)));

	let tags = $derived.by(() => {
		return tagState.flatTags.filter((tag) => !uniqueSelectedTags.has(tag.id));
	});
</script>

<Command.Dialog bind:open={isOpen}>
	<Command.Input bind:value={searchText} placeholder="Search Tags..." />
	{#if selectedTags.length > 0}
		<div class="gap-golden-sm p-golden-md border-b-base-content/10 flex flex-wrap border-b">
			{#each selectedTags as tag}
				<button
					onclick={() => {
						selectedTags = selectedTags.filter((t) => t.id != tag.id);
					}}
					class="badge hover:badge-ghost group flex items-center justify-center text-nowrap"
					>{tag.name}</button
				>
			{/each}
		</div>
	{/if}

	<Command.List>
		<Command.Empty class="px-2 py-1">
			<button
				onclick={async () => {
					const newTag = await tagState.createOnebyName(searchText);
					if (!newTag) {
						return;
					}
					selectedTags.push(newTag);
					searchText = '';
				}}
				class="bg-primary/30 mx-auto w-full rounded-md py-3">Click to create {searchText}</button
			>
		</Command.Empty>
		<Command.Group>
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
