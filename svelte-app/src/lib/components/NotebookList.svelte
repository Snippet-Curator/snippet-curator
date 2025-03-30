<script lang="ts">
	import { page } from '$app/state';

	import { Notebook as NotebookIcon, Pencil } from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import type { Notebook } from '$lib/types';
	import NotebookList from './NotebookList.svelte';
	import { getNotebookState } from '$lib/db.svelte';

	type Props = {
		notebooks: Notebook[];
		allowEdit: boolean;
	};

	let { notebooks, allowEdit = false }: Props = $props();

	const notebookState = getNotebookState();
	console.log(notebookState.notebooks);

	let isEditOpen = $state(false);
	let isDeleteOpen = $state(false);
	let isChangeParentOpen = $state(false);
	let selectedNotebook = $state<Notebook>();
	let newNotebookName = $state<string>('');
	let notebookSearchTerm = $state<string>();
	let filteredNotebooks = $state(notebookState.notebooks);
	let selectedParentNotebook = $state<string>('');

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

{#snippet renderNotebook(notebook)}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex items-center justify-between p-0 pr-2">
			<a
				href="#/notebook/{notebook.id}"
				class="{page.url.hash == `#/notebook/${notebook.id}`
					? 'badge-neutral'
					: ''} badge hover:badge-neutral badge-xl mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
				><NotebookIcon size={18} />{notebook.name}
			</a>
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
		</ContextMenu.Content>
	</ContextMenu.Root>
{/snippet}

{#each notebooks as notebook}
	<li class="group">
		{#if notebook.children.length > 0}
			<details class="w-full">
				<summary class="flex py-0 pl-0">
					<div class="grow">
						{@render renderNotebook(notebook)}
					</div>
				</summary>

				{#if notebook.children}
					<ul>
						<NotebookList {allowEdit} notebooks={notebook.children} />
					</ul>
				{/if}
			</details>
		{:else}
			{@render renderNotebook(notebook)}
		{/if}
	</li>
{/each}

<Dialog.Root open={isEditOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Rename Notebook</Dialog.Title>
			<Dialog.Description>Change notebook to new name</Dialog.Description>
		</Dialog.Header>
		<label class="input w-full">
			<span class="label">Notebook Name</span>
			<input
				type="text"
				class="ring-0"
				placeholder={selectedNotebook.name}
				bind:value={newNotebookName}
				onfocus={() => (newNotebookName = selectedNotebook.name)}
			/>
		</label>
		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isEditOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					notebookState.updateOnebyName(selectedNotebook?.id, newNotebookName);
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
					notebookState.delete(selectedNotebook?.id);
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
		<input type="text" bind:value={notebookSearchTerm} class="input w-full" />
		<ScrollArea class="bg-base-200/30 h-[30vh] rounded-lg">
			{#each filteredNotebooks as notebook}
				<ul class="list">
					<li class="list-row flex items-center">
						<label for="">
							<input
								type="radio"
								class="radio radio-sm mx-2"
								name="radio-1"
								bind:group={selectedParentNotebook}
								value={notebook}
							/>
							{notebook.name}
						</label>
					</li>
				</ul>
			{/each}
		</ScrollArea>
		{selectedParentNotebook}

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isChangeParentOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					console.log(selectedNotebook?.id, selectedNotebook?.name, selectedParentNotebook);
					notebookState.updateOnebyParent(selectedNotebook?.id, selectedParentNotebook);
					notebookSearchTerm = '';
					isChangeParentOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- {#each notebooks as notebook}
	<li class="group flex pr-2">
		{#if notebook.children.length > 0}
			<details class="w-full">
				<summary class="flex justify-between py-1">
					<a
						href="#/notebook/{notebook.id}"
						class="{page.url.hash == `#/notebook/${notebook.id}`
							? 'bg-neutral'
							: ''} hover:bg-base-content/10 flex w-full items-center gap-x-2 rounded-lg px-2 py-1 opacity-100 transition-colors"
						><NotebookIcon size={18} />{notebook.name}</a
					>
					<div class="grow"></div>
					{#if allowEdit}
						<button class="btn btn-ghost invisible group-hover:visible">
							<Pencil size={18} />
						</button>
					{/if}
				</summary>
				<ul>
					<li>
						{#if notebook.children}
							<NotebookList {allowEdit} notebooks={notebook.children} />
						{/if}
					</li>
				</ul>
			</details>
		{:else}
			<div class="{page.url.hash == `#/notebook/${notebook.id}` ? 'bg-neutral' : ''} flex">
				<a
					href="#/notebook/{notebook.id}"
					class=" mx-2 flex w-full items-center gap-x-2 truncate rounded-lg transition-colors"
					><NotebookIcon size={18} />{notebook.name}</a
				>
				{#if allowEdit}
					<button class="btn btn-ghost invisible group-hover:visible">
						<Pencil size={18} />
					</button>
				{/if}
			</div>
		{/if}
	</li>
{/each} -->
