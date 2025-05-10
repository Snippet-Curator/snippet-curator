<script lang="ts">
	import { page } from '$app/state';

	import { Notebook as NotebookIcon } from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';

	import type { Notebook } from '$lib/types';
	import { ChangeParent, Delete, Rename, New } from '$lib/components/';
	import NotebookList from './NotebookList.svelte';
	import { getNotebookState } from '$lib/db.svelte';

	type Props = {
		notebooks: Notebook[];
		allowEdit: boolean;
	};

	let { notebooks, allowEdit = false }: Props = $props();

	const notebookState = getNotebookState();

	let isEditOpen = $state(false);
	let isDeleteOpen = $state(false);
	let isChangeParentOpen = $state(false);
	let isNewNotebookOpen = $state(false);
	let selectedNotebook = $state<Notebook>();
	let notebookSearchTerm = $state<string>('');
	let filteredNotebooks = $state(notebookState.notebooks);

	function filterNotebook(ownNotebook: Notebook) {
		if (!notebookSearchTerm) {
			filteredNotebooks = notebookState.notebooks.filter(
				(notebook) => !notebook.id.includes(ownNotebook.id)
			);
			return;
		}
		filteredNotebooks = notebookState.notebooks.filter((notebook) => {
			return (
				notebook.name.includes(notebookSearchTerm.toLowerCase()) &&
				!notebook.id.includes(ownNotebook.id)
			);
		});
	}
</script>

{#snippet renderNotebook(notebook: Notebook)}
	<div class=" flex w-full items-center justify-between">
		<a
			href="#/notebook/{notebook.id}"
			class="{page.url.hash == `#/notebook/${notebook.id}`
				? 'badge-neutral'
				: ''} badge hover:badge-neutral mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
		>
			<NotebookIcon size={15} />
			{notebook.name}
		</a>
		<span class="text-base-content/60">{notebook.note_count}</span>
	</div>
{/snippet}

{#snippet renderNotebookSection(notebook: Notebook)}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex cursor-auto items-center justify-between p-0 pr-2">
			{@render renderNotebook(notebook)}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item
				onSelect={() => {
					selectedNotebook = notebook;
					isEditOpen = true;
				}}>Rename</ContextMenu.Item
			>
			<ContextMenu.Item
				onSelect={() => {
					selectedNotebook = notebook;
					// selectedParentNotebookID = notebook.parent;
					filterNotebook(selectedNotebook);
					isChangeParentOpen = true;
				}}>Change Parent</ContextMenu.Item
			>
			<ContextMenu.Item
				onSelect={() => {
					selectedNotebook = notebook;
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
{/snippet}

<svelte:boundary>
	{#each notebooks as notebook}
		{#if notebook.name != 'Inbox'}
			<li class="group mr-4">
				{#if notebook.children?.length > 0}
					<details class="w-full">
						<summary class="flex w-full py-0 pl-0">
							<div class="grow">
								{@render renderNotebookSection(notebook)}
							</div>
						</summary>

						{#if notebook.children}
							<ul>
								<NotebookList {allowEdit} notebooks={notebook.children} />
							</ul>
						{/if}
					</details>
				{:else}
					{@render renderNotebookSection(notebook)}
				{/if}
			</li>
		{/if}
	{/each}

	{#snippet failed()}
		NotebookList Failed to Render
	{/snippet}
</svelte:boundary>

<Rename
	bind:isOpen={isEditOpen}
	renameType="Notebook"
	currentName={selectedNotebook.name}
	action={(newName) => notebookState.updateOnebyName(selectedNotebook.id, newName)}
/>

<Delete
	bind:isOpen={isDeleteOpen}
	name="Notebook"
	action={() => notebookState.delete(selectedNotebook.id)}>this notebook?</Delete
>

<ChangeParent
	bind:isOpen={isChangeParentOpen}
	renameType="Notebook"
	bind:searchTerm={notebookSearchTerm}
	filteredItems={filteredNotebooks}
	filter={() => filterNotebook(selectedNotebook)}
	cancel={() => notebookState.updateOnebyParent(selectedNotebook?.id, '')}
	action={(selectedParentNotebookID) =>
		notebookState.updateOnebyParent(selectedNotebook?.id, selectedParentNotebookID)}
/>

<New
	bind:isOpen={isNewNotebookOpen}
	newType="Notebook"
	action={(newNotebookName) => notebookState.createOnebyName(newNotebookName)}
/>
