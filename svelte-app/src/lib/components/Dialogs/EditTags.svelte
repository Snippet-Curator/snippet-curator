<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { getTagState } from '$lib/db.svelte';
	import type { Tag } from '$lib/types';

	type Props = {
		isOpen: boolean;
		currentTags: Tag[];
		add: (selectedTagID: string) => void;
		remove: (selectedTagID: string) => void;
	};

	let { isOpen = $bindable(), add, remove, currentTags = [] }: Props = $props();

	const tagState = getTagState();
	let currentTagList = $derived(new Set(currentTags.map((tag) => tag.id)));

	let tags = $derived.by(async () => {
		return tagState.flatTags.filter((tag) => !currentTagList.has(tag.id));
	});
</script>

<Command.Dialog bind:open={isOpen}>
	<Command.Input placeholder="Search Tags..." />
	{#if currentTags}
		<div class="gap-golden-sm p-golden-md flex flex-wrap">
			{#each currentTags as currentTag}
				<button onclick={() => remove(currentTag.id)} class="badge hover:badge-ghost text-nowrap"
					>{currentTag.name}</button
				>
			{/each}
		</div>
	{/if}
	<Command.List>
		<Command.Empty class="px-2 py-1">No tag found.</Command.Empty>
		<Command.Group>
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
