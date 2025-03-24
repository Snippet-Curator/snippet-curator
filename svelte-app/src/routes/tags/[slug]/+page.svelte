<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db.svelte';
	import { getCorrectPage } from '$lib/utils.svelte';
	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let tag = $state();
	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer: HTMLDivElement;
	let tagID: string;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 25, {
			filter: `tags~"${tag?.id}"`,
			expand: 'tags,notebook'
		});
		noteContainer.scrollTo({ top: 0 });
	}

	async function updatePage() {
		tagID = page.params.slug;
		tag = await pb.collection('tags').getOne(tagID);
		clickedPage = await getCorrectPage();
		await getNotesByPage();
	}

	onMount(async () => await updatePage());

	$effect(async () => await updatePage());
</script>

<ScrollArea bind:this={noteContainer} class="h-[calc(100vh-60px)] overflow-y-auto">
	<Pagination
		totalPages={notes?.totalPages}
		bind:clickedPage
		currentPage={notes?.page}
		changePage={getNotesByPage}
		pageType="tags"
		url={page.url.hash}
		currentID={tag?.id}
	/>
	{#if notes?.totalItems > 0}
		<NoteList {notes} />
	{:else}
		<br />
	{/if}
	<div class="pt-20"></div>
</ScrollArea>
