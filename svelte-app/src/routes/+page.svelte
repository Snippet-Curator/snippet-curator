<script lang="ts">
	import PocketbaseQuery from '@emresandikci/pocketbase-query';

	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import pb from '$lib/db';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { getCorrectPage } from '$lib/utils';

	const query = PocketbaseQuery.getInstance<{ title: string; content: string; tags: string }>();
	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);
	// let noteContainer: HTMLDivElement;
	let searchInput = $state('');

	async function getNotesByPage() {
		if (searchInput == '') {
			notes = await pb.collection('notes').getList(clickedPage, 24, {
				expand: 'tags',
				sort: '-updated'
			});
			return;
		}

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

		notes = await pb.collection('notes').getList(clickedPage, 24, {
			expand: 'tags',
			sort: '-updated',
			filter: customFilters
		});
		// noteContainer.scrollTo({ top: 0 });
	}

	onMount(async () => {
		clickedPage = await getCorrectPage();
		await getNotesByPage();
	});
</script>

<Search bind:searchInput {getNotesByPage} />

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
