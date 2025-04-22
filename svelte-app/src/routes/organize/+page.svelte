<script lang="ts">
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Notebook as NotebookIcon } from 'lucide-svelte';

	import { New, NotebookList, TagList } from '$lib/components';
	import { getNotebookState, getTagState } from '$lib/db.svelte';
	import type { Notebook } from '$lib/types';

	const notebookState = getNotebookState();
	const tagState = getTagState();

	let notebookArchive = $state<Notebook>();
	let notebookTrash = $state<Notebook>();

	let isNewNotebookOpen = $state(false);
	let isNewTagOpen = $state(false);
	let newNotebookName = $state('');
	let newTagName = $state('');

	async function getDefaultNotebooks() {
		notebookArchive = await notebookState.getOneByName('Archive');
		// notebookTrash = await notebookState.getOneByName('Trash');
	}

	let defaultNotebooks = $state();

	onMount(() => {
		defaultNotebooks = getDefaultNotebooks();
	});
</script>

{#snippet renderNotebook(notebook: Notebook)}
	<div class="flex w-full items-center justify-between px-2">
		<a
			href="#/notebook/{notebook.id}"
			class="badge hover:badge-neutral badge-xl flex items-center text-nowrap transition-colors"
			><NotebookIcon size={18} />{notebook.name}
		</a>
		<span class="text-base-content/60">{notebook.note_count}</span>
	</div>
{/snippet}

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="mx-auto max-w-5xl py-6 pb-20 pt-10">
		<div class="flex items-center px-3">
			<h1 class="grow">Notebooks</h1>
			<button
				onclick={() => {
					isNewNotebookOpen = true;
				}}
				class="btn">New Notebook</button
			>
		</div>

		<div class="card">
			<ul class="menu w-full">
				<NotebookList allowEdit={true} notebooks={notebookState.notebooks} />
				{#await defaultNotebooks then}
					{#if notebookArchive}
						<li class="ml-0 mr-4 pl-0">{@render renderNotebook(notebookArchive)}</li>
					{/if}
				{/await}
			</ul>
		</div>

		<div class="divider"></div>

		<div class="flex items-center px-3">
			<h1 class="grow">Tags</h1>
			<button
				onclick={() => {
					isNewTagOpen = true;
				}}
				class="btn">New Tag</button
			>
		</div>

		<ul class="menu grid w-full grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
			<TagList allowEdit={true} tags={tagState.tags} />
		</ul>
	</div>
</ScrollArea>

<New
	bind:isOpen={isNewTagOpen}
	newType="Tag"
	bind:name={newTagName}
	action={() => tagState.createOnebyName(newTagName)}
/>

<New
	bind:isOpen={isNewNotebookOpen}
	newType="Notebook"
	bind:name={newNotebookName}
	action={() => notebookState.createOnebyName(newNotebookName)}
/>
