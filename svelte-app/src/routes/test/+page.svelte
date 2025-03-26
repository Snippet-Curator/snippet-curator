<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination, NoteList } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { page } from '$app/state';

	let notebookID = 'vq750rjh2no1et8';
	const PAGE_KEY = 'vq750rjh2no1et8';
	setNoteState(PAGE_KEY);
	const noteState = getNoteState(PAGE_KEY);
	console.log('page note', noteState);
	noteState.clickedPage = signalPageState.savedPages.get(page.url.hash);

	async function updatePage() {
		console.log('clicked page ', noteState.clickedPage);
		const records = await noteState.getByNotebook('vq750rjh2no1et8');
		signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
		console.log('signal page', signalPageState.savedPages);
		// console.log('loading records: ', records);
	}

	const initialLoading = updatePage();
</script>

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		Loading Notes...
	{:then}
		<Pagination {noteState} changePage={updatePage} currentID={notebookID} />
		{#if noteState.notes.totalItems > 0}
			<NoteList notes={noteState.notes} />
		{:else}
			<br />
		{/if}
		<div class="pt-20"></div>
	{/await}
</ScrollArea>
