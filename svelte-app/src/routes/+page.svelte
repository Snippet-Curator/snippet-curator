<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db';

	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { getCorrectPage } from '$lib/utils';

	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer: HTMLDivElement;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 24, {
			expand: 'tags',
			sort: '-updated'
		});
		noteContainer.scrollTo({ top: 0 });
	}

	onMount(async () => {
		clickedPage = await getCorrectPage();
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
		pageType="notes"
		url={page.url.hash}
	/>
	{#if notes?.totalItems > 0}
		<NoteList {notes} />
	{:else}
		<br />
	{/if}
</div>
