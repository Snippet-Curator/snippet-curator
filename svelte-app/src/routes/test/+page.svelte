<script lang="ts">
	import { page } from '$app/state';
	import { NoteList } from '$lib/components';
	import * as Pagination from '$lib/components/ui/pagination/index';
	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { signalPageState } from '$lib/utils.svelte';

	let notebookID = 'homepage';
	setNoteState(notebookID);
	signalPageState;
	const noteState = getNoteState(notebookID);
	async function getNotes() {
		await noteState.getByPage();
		console.log(noteState.notes);
	}
	getNotes();
	let notes = $state();
	let currentPage = $derived(noteState.notes.page);
	let savedPage = $derived(signalPageState.savedPages.get(page.url.hash));
	let pages = $derived(noteState.notes);
	let totalPages = $derived(noteState.notes.totalPages);
</script>

<Pagination.Root count={totalPages} perPage={10}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton />
			</Pagination.Item>
			{#each pages as page (page.key)}
				<Pagination.Item>
					<Pagination.Link>
						<NoteList notes={pages} />
					</Pagination.Link>
				</Pagination.Item>
			{/each}
			<Pagination.Item>
				<Pagination.NextButton />
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>

<!-- 

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	{#await initialLoading}
		Loading Notes...
	{:then}
		<Pagination {noteState} changePage={updatePage} currentID={notebookID} />
		{#if noteState.notes.totalItems > 0}
			<NoteList notes={noteState.notes} />
		{:else}
			<br />
		{/if}
		<div class="pt-20"></div>
	{/await}
</ScrollArea> -->
