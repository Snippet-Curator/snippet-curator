<script lang="ts">
	import PocketbaseQuery from '@emresandikci/pocketbase-query';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb, { getNotelistState, setNotelistState, type NoteType } from '$lib/db.svelte';
	import {
		Pagination,
		NoteList,
		Search,
		BulkToolbar,
		BulkEditBtn,
		Blank,
		NoteLoading
	} from '$lib/components/';
	import * as Topbar from '$lib/components/Topbar/index';
	import { searchState, signalPageState } from '$lib/utils.svelte';

	const query = PocketbaseQuery.getInstance<{ title: string; content: string; tags: string }>();

	let searchInput = $state('');
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);
	let isLoading = $state(true);
	// let scrollElement;

	let notebookID = 'homepage';
	const noteType: NoteType = {
		type: 'default'
	};
	setNotelistState(notebookID, noteType);
	const notelistState = getNotelistState(notebookID);

	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	isLoading = false;

	async function updatePage() {
		if (searchInput == '') {
			if (searchState.searchTerm != searchInput) {
				notelistState.clickedPage = 1;
				await notelistState.getDefault();
			}
			await notelistState.getDefault();
			searchState.searchTerm = '';
			// saves current page
			signalPageState.updatePageData(page.url.hash, notelistState.clickedPage);
			return;
		}
		await searchNotes();
		signalPageState.updatePageData(page.url.hash, notelistState.clickedPage);
		// scrollElement.scrollTo({ top: 0 });
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
			notelistState.clickedPage = 1;
		}

		await notelistState.getByFilter('-updated', customFilters);
		searchState.searchTerm = searchInput;
	}

	let initialLoading = $state();

	onMount(async () => {
		// gets from signal search on mount only
		if (searchState.searchTerm) {
			searchInput = searchState.searchTerm;
		}
		notelistState.clickedPage = savedPage ? savedPage : 1;
	});

	$effect(() => {
		initialLoading = updatePage();
	});
</script>

<Topbar.Root>
	<Search bind:searchInput />
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
</Topbar.Root>

<ScrollArea class="relative mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<NoteLoading />
	{:then}
		<Pagination {notelistState} changePage={updatePage} currentID={notebookID} />
		{#if isBulkEdit}
			<BulkToolbar bind:isBulkEdit bind:selectedNotesID {notelistState} />
		{/if}
		{#if isLoading}
			<NoteLoading />
		{:else if notelistState.notes.totalItems > 0}
			<NoteList {isBulkEdit} bind:selectedNotesID notes={notelistState.notes} />
		{:else}
			<Blank />
			<!-- <NoteLoading /> -->
		{/if}
	{/await}
</ScrollArea>
