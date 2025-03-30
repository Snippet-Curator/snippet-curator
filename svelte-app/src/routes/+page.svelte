<script lang="ts">
	import PocketbaseQuery from '@emresandikci/pocketbase-query';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb, { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination, NoteList, Search, NoteLoading } from '$lib/components/';
	import { searchState, signalPageState } from '$lib/utils.svelte';

	const query = PocketbaseQuery.getInstance<{ title: string; content: string; tags: string }>();

	let searchInput = $state('');

	let notebookID = 'homepage';
	setNoteState(notebookID);
	const noteState = getNoteState(notebookID);

	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		if (searchInput == '') {
			if (searchState.searchTerm != searchInput) {
				noteState.clickedPage = 1;
				await noteState.getByPage();
			}
			await noteState.getByPage();
			searchState.searchTerm = '';
			// saves current page
			signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
			return;
		}
		await searchNotes();
		signalPageState.updatePageData(page.url.hash, noteState.clickedPage);
	}

	async function searchNotes() {
		let searchedTag;
		try {
			searchedTag = await pb.collection('tags').getFirstListItem(`name~"${searchInput}"`);
		} catch (e) {
			searchedTag = '';
		}

		let customFilters = query
			.like('title', searchInput)
			.or()
			.like('content', searchInput)
			.or()
			.like('tags', searchedTag.id)
			.build();

		if (searchState.searchTerm != searchInput) {
			noteState.clickedPage = 1;
		}

		await noteState.getByFilter('-updated', customFilters);
		searchState.searchTerm = searchInput;
	}

	let initialLoading = $state();

	onMount(async () => {
		// gets from signal search on mount only
		if (searchState.searchTerm) {
			searchInput = searchState.searchTerm;
		}
		noteState.clickedPage = savedPage ? savedPage : 1;
	});

	$effect(() => {
		initialLoading = updatePage();
	});
</script>

<Search bind:searchInput />

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<br />
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
