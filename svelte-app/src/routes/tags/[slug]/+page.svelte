<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination, NoteList, Topbar, TopbarBack } from '$lib/components/';

	import { page } from '$app/state';

	let tagID = $derived(page.params.slug);
	setNoteState(tagID);
	const noteState = getNoteState(tagID);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		await noteState.getByTag(tagID);
		signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
	}

	let initialLoading = $state();

	$effect(() => {
		console.log('Slug changed:', page.params.slug);
		noteState.clickedPage = savedPage ? savedPage : 1;
		initialLoading = updatePage();
	});
</script>

<Topbar>
	<TopbarBack />
</Topbar>

<ScrollArea class="mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<br />
	{:then}
		<Pagination {noteState} changePage={updatePage} currentID={tagID} />
		{#if noteState.notes.totalItems > 0}
			<NoteList notes={noteState.notes} />
		{:else}
			<br />
		{/if}
	{/await}
</ScrollArea>
