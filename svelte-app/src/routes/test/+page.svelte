<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { getNoteState, setNoteState } from '$lib/db.svelte';
	import { Pagination2, NoteList } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';
	import { onMount } from 'svelte';

	let notebook = $state();
	let notes = $state<NoteRecord>();
	let notebookID = 'vq750rjh2no1et8';
	let noteState;

	const PAGE_KEY = Symbol('vq750rjh2no1et8');

	async function updatePage() {
		await noteState.getByNotebook(notebookID);
	}

	onMount(async () => {
		if (!getNoteState(PAGE_KEY)) {
			console.log('no context set, setting context');
			setNoteState(PAGE_KEY);
			noteState = getNoteState(PAGE_KEY);
			console.log('after setting context', noteState);
		} else {
			console.log('getting context');
			noteState = getNoteState(PAGE_KEY);
		}

		console.log('finally', noteState, noteState.notes);
		await noteState.getByNotebook(notebookID);
		console.log('after update', noteState, noteState.notes);
	});
</script>

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	<!-- <Pagination2 {noteState} currentID={notebookID} /> -->

	{#if noteState.notes?.totalItems > 0}
		<!-- <NoteList notes={noteState.notes} /> -->
		{#each noteState.notes?.items as item}
			{item}
		{/each}
	{:else}
		<br />
	{/if}
	<div class="pt-20"></div>
</ScrollArea>
