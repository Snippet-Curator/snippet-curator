<script lang="ts">
	import { page } from '$app/state';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';
	import { Tag as TagIcon } from 'lucide-svelte';

	import { ChangeParent, Delete, Rename, New } from '$lib/components/';
	import type { Tag } from '$lib/types';
	import type { TagState } from '$lib/db.svelte';

	type Props = {
		tag: Tag;
		flatTags: Tag[];
		tagState: TagState;
	};

	let { tag, flatTags, tagState }: Props = $props();

	let isEditOpen = $state(false);
	let isDeleteOpen = $state(false);
	let isChangeParentOpen = $state(false);
	let isNewTagOpen = $state(false);
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex cursor-auto items-center justify-between p-0 pr-2">
		<a
			href="#/tags/{tag.id}"
			class="{page.url.hash == `#/tags/${tag.id}`
				? 'badge-neutral'
				: ''} badge hover:badge-neutral mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
		>
			<TagIcon size={15} />{tag.name}
		</a>

		<span class="text-base-content/80 text-right">{tag.note_count}</span>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item
			onSelect={() => {
				isEditOpen = true;
			}}>Rename</ContextMenu.Item
		>
		<ContextMenu.Item
			onSelect={() => {
				isChangeParentOpen = true;
			}}>Change Parent</ContextMenu.Item
		>
		<ContextMenu.Item
			onSelect={() => {
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

<Rename
	bind:isOpen={isEditOpen}
	renameType="Tag"
	currentName={tag.name}
	action={(renameTagName) => tagState.updateOnebyName(tag.id, renameTagName)}
/>

<Delete bind:isOpen={isDeleteOpen} name="Tag" action={() => tagState.delete(tag.id)}
	>this tag?</Delete
>

<ChangeParent
	bind:isOpen={isChangeParentOpen}
	type="tag"
	fullList={flatTags}
	currentItemID={tag?.id}
	clear={() => tagState.updateOnebyParent(tag?.id, '')}
	action={(selectedParentTagID) => tagState.updateOnebyParent(tag?.id, selectedParentTagID)}
/>

<New
	bind:isOpen={isNewTagOpen}
	newType="Tag"
	action={(newTagName) => tagState.createOnebyName(newTagName, tag.id)}
/>
