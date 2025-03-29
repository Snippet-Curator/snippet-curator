<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination, NoteList } from '$lib/components/';

	import { page } from '$app/state';

	let tagID = $derived(page.params.slug);
	setNoteState(tagID);
	const noteState = getNoteState(tagID);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));
	console.log(tagID);

	async function updatePage() {
		await noteState.getByTag(tagID);
		signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
		console.log(noteState.notes);
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
		<Pagination {noteState} changePage={updatePage} currentID={tagID} />
		{#if noteState.notes.totalItems > 0}
			<NoteList notes={noteState.notes} />
		{:else}
			<br />
		{/if}
		<div class="pt-20"></div>
	{/await}
</ScrollArea>
