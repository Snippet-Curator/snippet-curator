<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { signalPageState } from '$lib/utils.svelte';
	import { getNotelistState, setNotelistState, type NoteType } from '$lib/db.svelte';
	import { Pagination, NoteList, BulkToolbar, BulkEditBtn } from '$lib/components/';
	import * as Topbar from '$lib/components/Topbar/index';

	import { page } from '$app/state';

	let tagID = $derived(page.params.slug);
	let isBulkEdit = $state(false);
	let selectedNotesID = $state<string[]>([]);

	const noteType: NoteType = {
		type: 'tags',
		id: page.params.slug
	};

	setNotelistState(tagID, noteType);
	const notelistState = getNotelistState(tagID);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));

	async function updatePage() {
		await notelistState.getByTag(tagID);
		signalPageState.updatePageData(page.url.hash, notelistState.clickedPage);
	}

	let initialLoading = $state();

	$effect(() => {
		console.log('Slug changed:', page.params.slug);
		notelistState.clickedPage = savedPage ? savedPage : 1;
		notelistState.tagID = page.params.slug;
		initialLoading = updatePage();
	});
</script>

<Topbar.Root>
	<Topbar.Back />
	<div class="grow"></div>
	<BulkEditBtn bind:isBulkEdit bind:selectedNotesID />
</Topbar.Root>

<ScrollArea class="mb-20 h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		<br />
	{:then}
		<Pagination {notelistState} changePage={updatePage} currentID={tagID} />
		{#if isBulkEdit}
			<BulkToolbar bind:isBulkEdit {selectedNotesID} {notelistState} />
		{/if}
		{#if notelistState.notes.totalItems > 0}
			<NoteList {isBulkEdit} bind:selectedNotesID notes={notelistState.notes} />
		{:else}
			<br />
		{/if}
	{/await}
</ScrollArea>
