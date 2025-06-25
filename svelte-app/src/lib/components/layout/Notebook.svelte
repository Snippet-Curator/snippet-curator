<script lang="ts">
	import { page } from '$app/state';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';

	import type { Notebook } from '$lib/types';
	import { ChangeParent, Delete, Rename, New } from '$lib/components/';
	import type { NotebookState } from '$lib/db.svelte';

	type Props = {
		notebook: Notebook;
		notebookState: NotebookState;
		flatNotebooks: Notebook[];
	};

	let { notebook, flatNotebooks, notebookState }: Props = $props();

	let isEditOpen = $state(false);
	let isDeleteOpen = $state(false);
	let isChangeParentOpen = $state(false);
	let isNewNotebookOpen = $state(false);
</script>

{#snippet renderNotebook(notebook: Notebook)}
	<div class=" flex w-full items-center justify-between">
		<a href="#/notebook/{notebook.id}" class="w-full items-center gap-x-2 text-nowrap px-3 py-1">
			{notebook.name}
		</a>
		<span class="text-right">{notebook.note_count}</span>
	</div>
{/snippet}

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="{page.url.hash == `#/notebook/${notebook.id}`
			? ' bg-neutral text-neutral-content'
			: ''} my-1 flex cursor-auto items-center justify-between rounded-md p-0 pr-2"
	>
		{@render renderNotebook(notebook)}
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
				isNewNotebookOpen = true;
			}}>New</ContextMenu.Item
		>
	</ContextMenu.Content>
</ContextMenu.Root>

<Rename
	bind:isOpen={isEditOpen}
	renameType="Notebook"
	currentName={notebook.name}
	action={(newName) => notebookState.updateOnebyName(notebook.id, newName)}
/>

<Delete bind:isOpen={isDeleteOpen} name="Notebook" action={() => notebookState.delete(notebook.id)}
	>this notebook?</Delete
>

<ChangeParent
	bind:isOpen={isChangeParentOpen}
	type="notebook"
	fullList={flatNotebooks}
	currentItemID={notebook.id}
	clear={() => notebookState.updateOnebyParent(notebook.id, '')}
	action={(selectedParentNotebookID) =>
		notebookState.updateOnebyParent(notebook.id, selectedParentNotebookID)}
/>

<New
	bind:isOpen={isNewNotebookOpen}
	newType="Notebook"
	action={(newNotebookName) => notebookState.createOnebyName(newNotebookName, notebook.id)}
/>
