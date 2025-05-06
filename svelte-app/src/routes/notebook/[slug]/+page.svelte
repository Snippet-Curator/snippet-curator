<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import {
		getDefaultNotebooksState,
		getNotelistState,
		setNotelistState,
		type NoteType
	} from '$lib/db.svelte';
	import { Pagination, NoteList, BulkToolbar, BulkEditBtn, Delete, Blank } from '$lib/components/';
	import * as Topbar from '$lib/components/Topbar/index';

	import { page } from '$app/state';

	let notebookID = $derived(page.params.slug);
	let isBulkEdit = $state(false);
	let isEmptyTrashOpen = $state(false);
	let selectedNotesID = $state<string[]>([]);

	const noteType: NoteType = {
		type: 'notebooks',
		id: page.params.slug
	};

	setNotelistState(notebookID, noteType);
	const notelistState = getNotelistState(notebookID);
	const defaultNotebooksState = getDefaultNotebooksState();

	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash) ?? 1);

	async function updatePage() {
		await notelistState.getByNotebook(notebookID);
		signalPageState.updatePageData(page.url.hash, notelistState.clickedPage);
	}

	let initialLoading = $state<Promise<void>>();

	$effect(() => {
		// console.log('Slug changed:', page.params.slug);
		notelistState.notebookID = notebookID;
		notelistState.clickedPage = savedPage ? savedPage : 1;
		initialLoading = updatePage();
	});
</script>

<Topbar.Root>
	<Topbar.Back />
	<div class="grow"></div>
	{#if notebookID == defaultNotebooksState.trashID}
		<Topbar.Empty bind:isOpen={isEmptyTrashOpen} />
	{/if}
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
</Topbar.Root>

<ScrollArea class="mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<br />
	{:then}
		<Pagination {notelistState} changePage={updatePage} currentID={notebookID} />
		{#if isBulkEdit}
			<BulkToolbar bind:isBulkEdit {selectedNotesID} {notelistState} />
		{/if}
		{#if notelistState.notes.totalItems > 0}
			<NoteList {isBulkEdit} bind:selectedNotesID notes={notelistState.notes} />
		{:else}
			<Blank />
		{/if}
	{/await}
</ScrollArea>

<Delete
	bind:isOpen={isEmptyTrashOpen}
	name="Notes Permanently"
	action={() => {
		notelistState.emptyTrash();
		window.history.back();
	}}>these notes</Delete
>
