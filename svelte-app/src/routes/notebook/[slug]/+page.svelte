<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db';
	import { getCorrectPage } from '$lib/utils.svelte';
	import { Pagination, NoteList } from '$lib/components/';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { NoteRecord } from '$lib/types';

	let notebook = $state();
	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer: HTMLDivElement;
	let notebookID: string;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 25, {
			filter: `notebook="${notebook?.id}"`,
			expand: 'tags,notebook'
		});

		// noteContainer.scrollTo({ top: 0 });
	}

	async function updatePage() {
		notebookID = page.params.slug;
		notebook = await pb.collection('notebooks').getOne(notebookID);
		clickedPage = await getCorrectPage();
		await getNotesByPage();
	}

	onMount(async () => await updatePage());

	$effect(async () => await updatePage());
</script>

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	<Pagination
		totalPages={notes?.totalPages}
		bind:clickedPage
		currentPage={notes?.page}
		changePage={getNotesByPage}
		pageType="notebooks"
		url={page.url.hash}
		currentID={notebook?.id}
	/>
	{#if notes?.totalItems > 0}
		<NoteList {notes} />
	{:else}
		<br />
	{/if}
	<div class="pt-20"></div>
</ScrollArea>
