<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db';
	import { getCorrectPage } from '$lib/utils';
	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord, Props } from '$lib/types';

	let { data }: Props = $props();
	let notebook = $derived(data.notebook);
	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer: HTMLDivElement;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 25, {
			filter: `notebook = "${notebook?.id}"`,
			expand: 'tags,notebook'
		});
		noteContainer.scrollTo({ top: 0 });
	}

	onMount(async () => {
		clickedPage = await getCorrectPage();
		await getNotesByPage();
		console.log(clickedPage, notes);
	});
</script>

<Search />
<div bind:this={noteContainer} class="h-[calc(100vh-60px)] overflow-y-auto">
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
</div>
