<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Pagination, NoteList } from '$lib/components/';
	import type { NoteRecord, Props } from '$lib/types';
	import { getNotesByPage } from '$lib/utils';

	let { data }: Props = $props();
	let notebook = $derived(data.notebook);
	console.log(notebook);

	let notes = $state<NoteRecord>();
	let clickedPage = $state(1);

	async function changePage() {
		notes = await getNotesByPage(clickedPage, notebook.id);
	}

	onMount(async () => {
		notes = await getNotesByPage(clickedPage, notebook.id);
	});
</script>

<div class="pt-20">
	<Pagination
		totalPages={notes?.totalPages}
		bind:clickedPage
		currentPage={notes?.page}
		{changePage}
	/>
</div>
<Search />

<NoteList {notes} />
