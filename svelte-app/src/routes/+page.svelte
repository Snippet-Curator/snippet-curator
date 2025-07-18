<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { getNotelistState, setNotelistState } from '$lib/db.svelte';
	import {
		Pagination,
		NoteList,
		Search,
		BulkToolbar,
		BulkEditBtn,
		Blank,
		NoteLoading,
		FilterSearch
	} from '$lib/components/';
	import * as Topbar from '$lib/components/Topbar/index';
	import { saveCurrentPage, signalPageState } from '$lib/utils.svelte';
	import { getSearchState } from '$lib/search.svelte';
	import type { NoteType } from '$lib/types';

	let searchInput = $state('');
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);
	let isLoading = $state(true);
	let isFilterSearch = $state(false);

	let notebookID = 'homepage';
	const noteType: NoteType = {
		type: 'default'
	};

	setNotelistState(notebookID, noteType);

	const notelistState = getNotelistState(notebookID);
	const searchState = getSearchState();

	const savedPage = $derived<number>(signalPageState.savedPages.get(page.url.hash) ?? 1);

	const updatePage = async (newPage: number) => {
		// saves current clicked page number
		saveCurrentPage(newPage);
		notelistState.clickedPage = newPage;

		// get default page if no filters
		if (
			!searchState.searchInput &&
			!searchState.searchNotebookID &&
			searchState.selectedTagIdArray.length == 0
		) {
			searchState.searchTerm = '';
			searchState.resetCustomFilter();
			await notelistState.getByPage(newPage);
			return;
		}

		// run same filter if search term is same
		if (searchState.searchTerm === searchState.searchInput) {
			await notelistState.getByFilter(searchState.customFilter, newPage);
			return;
		}

		// uses new search filter
		await searchState.getSearchTags(searchInput.trim());
		await searchState.getSearchNotebook(searchInput.trim());
		searchState.makeSearchQuery(searchState.searchInput);
		await notelistState.getByFilter(searchState.customFilter, newPage);
		searchState.searchTerm = searchState.searchInput;
	};

	isLoading = false;
	let initialLoading = $state();

	onMount(async () => {
		if (searchState.searchTerm) {
			searchState.searchInput = searchState.searchTerm;
		}
		initialLoading = updatePage(savedPage);
	});
</script>

<Topbar.Root>
	<Topbar.SidebarIcon></Topbar.SidebarIcon>
	<Search
		bind:searchInput={searchState.searchInput}
		searchNotes={() => updatePage(1)}
		clearNote={() => {
			searchState.searchTerm = '';
			searchState.resetCustomFilter();
			updatePage(1);
		}}
	/>
	<Topbar.Filter bind:isOpen={isFilterSearch} />
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
</Topbar.Root>

<ScrollArea scrollHideDelay={200} class="relative mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<NoteLoading />
	{:then}
		<Pagination
			currentPage={notelistState.notes.page}
			totalPages={notelistState.notes.totalPages}
			changePage={(newPage: number) => updatePage(newPage)}
		/>
		{#if isBulkEdit}
			<BulkToolbar
				updatePage={() => {
					updatePage(notelistState.clickedPage);
				}}
				bind:isBulkEdit
				bind:selectedNotesID
				{notelistState}
			/>
		{/if}
		{#if notelistState.notes.totalItems > 0}
			<NoteList
				{isBulkEdit}
				update={() => updatePage(notelistState.clickedPage)}
				bind:selectedNotesID
				notes={notelistState.notes}
			/>
		{:else if searchState.searchInput || searchState.searchNotebookID || searchState.selectedTagIdArray.length > 0}
			<div class="grid h-full place-items-center">No Notes Found.</div>
		{:else}
			<Blank />
			<!-- <NoteLoading /> -->
		{/if}
	{/await}
</ScrollArea>

<FilterSearch
	bind:isOpen={isFilterSearch}
	search={async (customFilters) => await notelistState.getByFilter(customFilters, 1)}
/>
