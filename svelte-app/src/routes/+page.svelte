<script lang="ts">
	import PocketbaseQuery from '@emresandikci/pocketbase-query';
	import { Pencil } from 'lucide-svelte';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb, { getNoteState, setNoteState, type NoteType } from '$lib/db.svelte';
	import { Pagination, NoteList, Search, Topbar, BulkToolbar } from '$lib/components/';
	import { searchState, signalPageState } from '$lib/utils.svelte';

	const query = PocketbaseQuery.getInstance<{ title: string; content: string; tags: string }>();

	let searchInput = $state('');
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);

	let notebookID = 'homepage';
	const noteType: NoteType = {
		type: 'default'
	};
	setNoteState(notebookID, noteType);
	const noteState = getNoteState(notebookID);

	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		if (searchInput == '') {
			if (searchState.searchTerm != searchInput) {
				noteState.clickedPage = 1;
				await noteState.getDefault();
			}
			await noteState.getDefault();
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

<Topbar>
	<Search bind:searchInput />
	<div class="tooltip tooltip-bottom z-30" data-tip="Bulk Edit">
		<button
			class="{isBulkEdit ? 'btn-primary' : 'btn-ghost'} btn"
			onclick={() => {
				isBulkEdit = !isBulkEdit;
				selectedNotesID = [];
			}}
		>
			<Pencil size={18} />
		</button>
	</div>
</Topbar>

<ScrollArea class="relative mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<br />
	{:then}
		<Pagination {noteState} changePage={updatePage} currentID={notebookID} />
		{#if isBulkEdit}
			<BulkToolbar bind:isBulkEdit {selectedNotesID} {noteState} />
		{/if}
		{#if noteState.notes.totalItems > 0}
			<NoteList {isBulkEdit} bind:selectedNotesID notes={noteState.notes} />
		{:else}
			<br />
		{/if}
	{/await}
</ScrollArea>
