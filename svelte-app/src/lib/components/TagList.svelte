<script lang="ts">
	import { page } from '$app/state';

	import { Tag as TagIcon } from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import type { Tag } from '$lib/types';
	import { TagList } from '$lib/components/';
	import { getTagState } from '$lib/db.svelte';

	type Props = {
		tags: Tag[];
		allowEdit: boolean;
	};

	let { tags, allowEdit = false }: Props = $props();

	const tagState = getTagState();

	let isEditOpen = $state(false);
	let isDeleteOpen = $state(false);
	let isChangeParentOpen = $state(false);
	let selectedTag = $state<Tag>();
	let newTagName = $state<string>('');
	let tagSearchTerm = $state<string>('');
	let filteredTags = $state(tagState.tags);
	let selectedParentTagID = $state<string>();

	function filterTag(ownTag: Tag) {
		if (!tagSearchTerm) {
			filteredTags = tagState.tags.filter((tag) => !tag.id.includes(ownTag.id));
			return;
		}
		filteredTags = tagState.tags.filter((tag) => {
			return tag.name.includes(tagSearchTerm.toLowerCase()) && !tag.id.includes(ownTag.id);
		});
	}
</script>

{#snippet renderTag(tag)}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex items-center justify-between p-0 pr-2">
			<a
				href="#/tags/{tag.id}"
				class="{page.url.hash == `#/tags/${tag.id}`
					? 'badge-neutral'
					: ''} badge hover:badge-neutral badge-xl mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
				><TagIcon size={18} />{tag.name}
			</a>

			<span class="text-right">{tag.note_count}</span>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item
				onSelect={() => {
					selectedTag = tag;
					isEditOpen = true;
				}}>Rename</ContextMenu.Item
			>
			<ContextMenu.Item
				onSelect={() => {
					selectedTag = tag;
					selectedParentTagID = tag.parent;
					filterTag(selectedTag);
					isChangeParentOpen = true;
				}}>Change Parent</ContextMenu.Item
			>
			<ContextMenu.Item
				onSelect={() => {
					selectedTag = tag;
					isDeleteOpen = true;
				}}>Delete</ContextMenu.Item
			>
		</ContextMenu.Content>
	</ContextMenu.Root>
{/snippet}

{#each tags as tag}
	<li class="group">
		{#if tag.children.length > 0}
			<details class="w-full">
				<summary class="flex py-0 pl-0">
					<div class="grow">
						{@render renderTag(tag)}
					</div>
				</summary>

				{#if tag.children}
					<ul>
						<TagList {allowEdit} tags={tag.children} />
					</ul>
				{/if}
			</details>
		{:else}
			{@render renderTag(tag)}
		{/if}
	</li>
{/each}

<Dialog.Root open={isEditOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Rename Tag</Dialog.Title>
			<Dialog.Description>Change tag to new name</Dialog.Description>
		</Dialog.Header>
		<label class="input w-full">
			<span class="label">Tag Name</span>
			<input
				type="text"
				class="ring-0"
				placeholder={selectedTag.name}
				bind:value={newTagName}
				onfocus={() => (newTagName = selectedTag.name)}
			/>
		</label>
		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isEditOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					tagState.updateOnebyName(selectedTag?.id, newTagName);
					isEditOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isDeleteOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Delete Tag</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete this tag?</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isDeleteOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					tagState.delete(selectedTag?.id);
					isDeleteOpen = false;
				}}
				class="btn btn-error">Delete</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isChangeParentOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Change Parent Tag</Dialog.Title>
			<Dialog.Description>Select parent tag to change</Dialog.Description>
		</Dialog.Header>
		<input
			type="text"
			bind:value={tagSearchTerm}
			class="input w-full"
			oninput={() => filterTag(selectedTag)}
		/>
		<ScrollArea class="bg-base-200/30 h-[30vh] rounded-lg">
			{#each filteredTags as tag}
				<ul class="list">
					<li class="list-row flex items-center">
						<label for="">
							<input
								type="radio"
								class="radio radio-sm mx-2"
								name="radio-1"
								bind:group={selectedParentTagID}
								value={tag.id}
							/>
							{tag.name}
						</label>
					</li>
				</ul>
			{/each}
		</ScrollArea>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isChangeParentOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					tagState.updateOnebyParent(selectedTag?.id, '');
					tagSearchTerm = '';
					isChangeParentOpen = false;
				}}
				class="btn">Clear Parent Tag</button
			>
			<button
				onclick={() => {
					tagState.updateOnebyParent(selectedTag?.id, selectedParentTagID);
					tagSearchTerm = '';
					isChangeParentOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
