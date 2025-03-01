<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db';

	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';

	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 24, {
			expand: 'tags',
			sort: '-updated'
		});
		noteContainer.scrollTo({ top: 0 });
	}

	onMount(async () => {
		if (page.state.url && page.state.url == page.url.hash) {
			clickedPage = page.state.previousHistoryPage;
		}
		await getNotesByPage();
	});
</script>

<Search />
<div bind:this={noteContainer} class="h-[calc(100vh-60px)] overflow-y-auto">
	<Pagination
		totalPages={notes?.totalPages}
		bind:clickedPage
		currentPage={notes?.page}
		changePage={getNotesByPage}
		url={page.url.hash}
	/>
	{#if notes?.totalItems > 0}
		<NoteList {notes} />
	{:else}
		no notes
	{/if}
</div>
