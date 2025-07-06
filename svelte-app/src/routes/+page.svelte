<script lang="ts">
	import PocketbaseQuery from '@emresandikci/pocketbase-query';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb, { getNotelistState, setNotelistState } from '$lib/db.svelte';
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
	import { saveCurrentPage, signalPageState } from '$lib/utils.svelte';
	import { getSearchState, setSearchState } from '$lib/search.svelte';
	import type { Notebook, Tag, NoteType } from '$lib/types';
	import FilterSearch from '$lib/components/Dialogs/FilterSearch.svelte';

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
	setSearchState();
	const notelistState = getNotelistState(notebookID);
	const searchState = getSearchState();

	const savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	const updatePage = async (newPage: number) => {
		saveCurrentPage(newPage);
		notelistState.clickedPage = newPage;

		if (!searchInput) {
			await notelistState.getByPage(newPage);
			return;
		}

		await searchNotes(searchInput, newPage);
	};

	const searchNotes = async (searchInput: string, page: number) => {
		if (!searchInput) {
			searchState.searchTerm = '';
			updatePage(1);
			return;
		}

		await searchState.getSearchTags(searchInput);
		await searchState.getSearchNotebook(searchInput);
		searchState.makeSearchQuery(searchInput);
		await notelistState.getByFilter(searchState.customFilter, page);
		searchState.searchTerm = searchInput;
	};

	isLoading = false;
	let initialLoading = $state();

	onMount(async () => {
		if (searchState.searchTerm) {
			searchInput = searchState.searchTerm;
		}
		initialLoading = updatePage(savedPage);
	});
</script>

<Topbar.Root>
	<Topbar.SidebarIcon></Topbar.SidebarIcon>
	<Search
		bind:searchInput
		searchNotes={(searchInput) => searchNotes(searchInput, 1)}
		clearNote={() => {
			searchState.searchTerm = '';
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
		{:else if searchInput}
			<div class="grid h-full place-items-center">No Notes Found.</div>
		{:else}
			<Blank />
			<!-- <NoteLoading /> -->
		{/if}
	{/await}
</ScrollArea>

<FilterSearch
	bind:isOpen={isFilterSearch}
	bind:searchInput
	search={async (customFilters) => await notelistState.getByFilter(customFilters, savedPage)}
/>
