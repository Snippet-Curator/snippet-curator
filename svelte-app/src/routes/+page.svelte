<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb from '$lib/db';

	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { getCorrectPage } from '$lib/utils';

	let orientation = 'vertical';
	let scrollbarXClasses: string = '';
	let scrollbarYClasses: string = '';

	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	let noteContainer: HTMLDivElement;

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 24, {
			expand: 'tags',
			sort: '-updated'
		});
		// noteContainer.scrollTo({ top: 0 });
	}

	onMount(async () => {
		clickedPage = await getCorrectPage();
		await getNotesByPage();
	});
</script>

<Search />

<ScrollArea class="h-[calc(100vh-60px)]">
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
</ScrollArea>
