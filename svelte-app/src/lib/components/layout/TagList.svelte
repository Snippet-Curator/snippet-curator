<script lang="ts">
	import { page } from '$app/state';

	import { Tag as TagIcon } from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';

	import type { Tag } from '$lib/types';
	import { ChangeParent, Delete, Rename, TagList, New } from '$lib/components/';
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
	let isNewTagOpen = $state(false);
	let selectedTag = $state<Tag>();
	let newTagName = $state<string>('');
	let renameTagName = $state<string>('');
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

{#snippet renderTag(tag: Tag)}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex cursor-auto items-center justify-between p-0 pr-2">
			<a
				href="#/tags/{tag.id}"
				class="{page.url.hash == `#/tags/${tag.id}`
					? 'badge-neutral'
					: ''} badge hover:badge-neutral badge-xl mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
			>
				<TagIcon size={15} />{tag.name}
			</a>

			<span class="text-base-content/80 text-right">{tag.note_count}</span>
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
			<ContextMenu.Separator />
			<ContextMenu.Item
				onSelect={() => {
					isNewTagOpen = true;
				}}>New</ContextMenu.Item
			>
		</ContextMenu.Content>
	</ContextMenu.Root>
{/snippet}

{#each tags as tag}
	<li class="group mr-4">
		{#if tag.children?.length > 0}
			<details class="w-full cursor-pointer">
				<summary class="mr-4 flex w-full py-0 pl-0">
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

<Rename
	bind:isOpen={isEditOpen}
	renameType="Tag"
	currentName={selectedTag.name}
	bind:newName={renameTagName}
	action={() => tagState.updateOnebyName(selectedTag.id, renameTagName)}
/>

<Delete bind:isOpen={isDeleteOpen} name="Tag" action={() => tagState.delete(selectedTag.id)}
	>this tag?</Delete
>

<ChangeParent
	bind:isOpen={isChangeParentOpen}
	renameType="Tag"
	bind:selectedID={selectedParentTagID}
	bind:searchTerm={tagSearchTerm}
	filteredItems={filteredTags}
	filter={() => filterTag(selectedTag)}
	cancel={() => tagState.updateOnebyParent(selectedTag?.id, '')}
	action={() => tagState.updateOnebyParent(selectedTag?.id, selectedParentTagID)}
/>

<New
	bind:isOpen={isNewTagOpen}
	newType="Tag"
	bind:name={newTagName}
	action={() => tagState.createOnebyName(newTagName)}
/>
