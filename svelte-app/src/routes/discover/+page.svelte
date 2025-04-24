<script lang="ts">
	import { NoteContent, Delete, EditNotebook, EditTags, Blank } from '$lib/components/';
	import { NoteState } from '$lib/db.svelte';
	import * as Topbar from '$lib/components/Topbar/index';
	import { onMount } from 'svelte';

	const noteState = new NoteState('discovery');

	let note = $derived(noteState.note);

	let newRating = $state(0);
	let totalPages = $state(0);
	let currentPage = $state(1);
	let currentIndex = $state(0);
	let lastItemIndex = $state();

	let isDeleteOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let selectedNotebookID = $state('');
	let selectedTags = $state<string[]>([]);

	async function getNextNote() {
		currentIndex++;
		if (currentIndex == 10) {
			currentPage++;
			await noteState.getDiscoverNoteList(currentPage);
			currentIndex = 0;
		}
		await noteState.getDiscoverNote(currentIndex);
		lastItemIndex = noteState.noteList.items.length - 1;
	}

	async function getPreviousNote() {
		currentIndex--;
		if (currentIndex < 0 && currentPage > 1) {
			currentPage--;
			await noteState.getDiscoverNoteList(currentPage);
			currentIndex = 9;
		}
		await noteState.getDiscoverNote(currentIndex);
	}

	let initialLoading = $state();

	onMount(async () => {
		await noteState.getDiscoverNoteList(1);
		initialLoading = await noteState.getDiscoverNote(0);
		totalPages = noteState.noteList.totalPages;
	});
</script>

<!-- currentPage: {currentPage}
currentIndex: {currentIndex}
totalPages: {totalPages}
last item: {lastItemIndex} -->

{#await initialLoading then}
	{#if note}
		<Topbar.Root>
			{note.score}
			<div class="grow"></div>

			{#if note?.expand?.tags}
				<Topbar.Tags tags={note.expand.tags} />
			{/if}
			<Topbar.TagBtn bind:isOpen={isEditTagsOpen} />
			{#if note?.expand?.notebook}
				<Topbar.Notebook bind:isOpen={isEditNotebookOpen} notebook={note.expand.notebook} />
			{/if}
			<Topbar.Rating
				rating={note.rating}
				bind:newRating
				action={() => {
					noteState.changeRating(newRating);
				}}
			/>
			<div class="divider divider-horizontal"></div>

			<Topbar.Archive
				action={async () => {
					await noteState.archiveNote();
					window.history.back();
				}}
			/>
			<Topbar.Delete bind:isOpen={isDeleteOpen} />
			<Topbar.Info {note} />
		</Topbar.Root>
		<div class="h-[calc(100vh-60px)]">
			<button disabled={currentIndex == 0 && currentPage == 1} class="btn" onclick={getPreviousNote}
				>Previous</button
			>
			<button
				disabled={currentIndex == lastItemIndex && currentPage == totalPages}
				class="btn"
				onclick={getNextNote}>Next</button
			>

			<NoteContent {note} />
		</div>
	{:else}
		<div class="h-screen">
			<Blank />
		</div>
	{/if}
{/await}

{#await initialLoading then}
	{#if note}
		<Delete
			bind:isOpen={isDeleteOpen}
			name="Note"
			action={async () => {
				await noteState.softDeleteNote();
				window.history.back();
			}}>this note</Delete
		>

		<EditNotebook
			bind:selectedNotebookID
			currentNotebookID={note.expand?.notebook.id}
			bind:isOpen={isEditNotebookOpen}
			action={async () => {
				await noteState.changeNotebook(selectedNotebookID);
			}}
		></EditNotebook>

		<EditTags
			bind:isOpen={isEditTagsOpen}
			bind:selectedTags
			currentTags={note.expand?.tags}
			action={async () => {
				await noteState.changeTags(selectedTags);
			}}
		/>
	{/if}
{/await}
