<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination, NoteList } from '$lib/components/';

	import { page } from '$app/state';

	let notebookID = $derived(page.params.slug);
	setNoteState(notebookID);
	const noteState = getNoteState(notebookID);
	let notes = $state(noteState.notes);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		notes = await noteState.getByNotebook(notebookID);
		signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
		console.log('signal page', signalPageState.savedPages);
	}

	let initialLoading = $state();

	$effect(async () => {
		console.log('Slug changed:', page.params.slug);
		noteState.clickedPage = savedPage ? savedPage : 1;
		initialLoading = updatePage();
	});
</script>

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		Loading Notes...
	{:then}
		<Pagination {noteState} changePage={updatePage} currentID={notebookID} />
		{#if notes.totalItems > 0}
			<NoteList {notes} />
		{:else}
			<br />
		{/if}
		<div class="pt-20"></div>
	{/await}
</ScrollArea>
