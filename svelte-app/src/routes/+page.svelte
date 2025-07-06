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
	import { saveCurrentPage, searchState, signalPageState } from '$lib/utils.svelte';
	import type { Notebook, Tag } from '$lib/types';
	import FilterSearch from '$lib/components/Dialogs/FilterSearch.svelte';

	const query = PocketbaseQuery.getInstance<{
		title: string;
		content: string;
		tags: Tag;
		notebook: Notebook;
		status: 'active' | 'archived' | 'deleted';
	}>();

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
		let searchedTagID;
		try {
			const searchedTag = await pb.collection('tags').getFirstListItem(`name~"${searchInput}"`);
			searchedTagID = searchedTag.id;
		} catch (e) {
			searchedTagID = '';
		}

		let searchNotebookID;
		try {
			const searchNotebook = await pb
				.collection('notebooks')
				.getFirstListItem(`name~"${searchInput}"`);
			searchNotebookID = searchNotebook.id;
		} catch (e) {
			searchNotebookID = '';
		}

		const customFilters = query
			.openBracket()
			.like('title', searchInput)
			.or()
			.like('content', searchInput)
			.or()
			.like('tags', searchedTagID)
			.or()
			.equal('notebook', searchNotebookID)
			.closeBracket()
			.and()
			.openBracket()
			.equal('status', 'active')
			.or()
			.equal('status', 'archived')
			.closeBracket()
			.build();

		await notelistState.getByFilter(customFilters, page);
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
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
	<!-- <button onclick={() => (isFilterSearch = true)} class="btn btn-square">filter</button> -->
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

<FilterSearch bind:isOpen={isFilterSearch} />
