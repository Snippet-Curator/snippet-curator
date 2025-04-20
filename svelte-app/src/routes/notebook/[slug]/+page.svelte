<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNotelistState, setNotelistState, type NoteType } from '$lib/db.svelte';
	import {
		Pagination,
		NoteList,
		Topbar,
		TopbarBack,
		BulkToolbar,
		BulkEditBtn
	} from '$lib/components/';

	import { page } from '$app/state';

	let notebookID = $derived(page.params.slug);
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);

	const noteType: NoteType = {
		type: 'notebooks',
		id: page.params.slug
	};

	setNotelistState(notebookID, noteType);
	const notelistState = getNotelistState(notebookID);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		await notelistState.getByNotebook(notebookID);
		signalPageState.updatePageData(page.url.hash, notelistState.clickedPage);
	}

	let initialLoading = $state();

	$effect(() => {
		console.log('Slug changed:', page.params.slug);
		notelistState.clickedPage = savedPage ? savedPage : 1;
		initialLoading = updatePage();
	});
</script>

<Topbar>
	<TopbarBack />
	<div class="grow"></div>
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
</Topbar>

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
			<br />
		{/if}
	{/await}
</ScrollArea>
