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

	const query = PocketbaseQuery.getInstance<{
		title: string;
		content: string;
		tags: string;
		status: 'active' | 'archived' | 'deleted';
	}>();

	let searchInput = $state('');
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);
	let isLoading = $state(true);

	let notebookID = 'homepage';
	const noteType: NoteType = {
		type: 'default'
	};
	setNotelistState(notebookID, noteType);
	const notelistState = getNotelistState(notebookID);

	const savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	const updatePage = async (newPage: number) => {
		saveCurrentPage(newPage);

		if (!searchInput) {
			await notelistState.getByPage(newPage);
			return;
		}

		await searchNotes(searchInput, newPage);
	};

	const searchNotes = async (searchInput: string, page: number) => {
		let searchedTag;
		try {
			searchedTag = await pb.collection('tags').getFirstListItem(`name~"${searchInput}"`);
		} catch (e) {
			searchedTag = '';
		}

		const customFilters = query
			.openBracket()
			.like('title', searchInput)
			.or()
			.like('content', searchInput)
			.or()
			.like('tags', searchedTag.id)
			.closeBracket()
			.and()
			.equal('status', 'active')
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
			<BulkToolbar bind:isBulkEdit bind:selectedNotesID {notelistState} />
		{/if}
		{#if notelistState.notes.totalItems > 0}
			<NoteList {isBulkEdit} bind:selectedNotesID notes={notelistState.notes} />
		{:else if searchInput}
			<div class="grid h-full place-items-center">No Notes Found.</div>
		{:else}
			<Blank />
			<!-- <NoteLoading /> -->
		{/if}
	{/await}
</ScrollArea>
