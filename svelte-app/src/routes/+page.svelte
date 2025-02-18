<script lang="ts">
	import { onMount } from 'svelte';
	import pb from '$lib/db';
	import { Pagination, NoteList, Search } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';

	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);

	async function getNotesByPage() {
		notes = await pb.collection('notes').getList(clickedPage, 12, {
			expand: 'tags',
			sort: '-updated'
		});
	}

	onMount(async () => {
		await getNotesByPage();
	});
</script>

<Search />
<div class="h-[calc(100vh-60px)] overflow-y-auto">
	<div class="flex w-full items-center justify-center pb-5 pt-5">
		<Pagination
			totalPages={notes?.totalPages}
			bind:clickedPage
			currentPage={notes?.page}
			changePage={getNotesByPage}
		/>
	</div>
	<NoteList {notes} />
</div>
