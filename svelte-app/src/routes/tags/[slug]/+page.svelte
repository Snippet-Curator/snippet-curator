<script lang="ts">
	import { onMount } from 'svelte';
	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord, Props } from '$lib/types';
	import pb from '$lib/db';

	let { data }: Props = $props();
	let tag = $derived(data.tag);
	let notes = $state<NoteRecord>();

	let clickedPage = $state(1);

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 25, {
			filter: `tags = "${tag?.id}"`,
			expand: 'tags'
		});
	}

	onMount(async () => {
		await getNotesByPage();
	});

	$effect(() => getNotesByPage());
</script>

<Search />
<div class="h-[calc(100vh-60px)] overflow-y-auto">
	<NoteList {notes} />
	<div class="pt-20">
		<Pagination
			totalPages={notes?.totalPages}
			bind:clickedPage
			currentPage={notes?.page}
			changePage={getNotesByPage}
		/>
	</div>
</div>
