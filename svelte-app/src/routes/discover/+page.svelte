<script lang="ts">
	import {
		NoteContent,
		Delete,
		EditNotebook,
		EditTags,
		Blank,
		NoteLoading
	} from '$lib/components/';
	import { NoteState } from '$lib/db.svelte';
	import * as Topbar from '$lib/components/Topbar/index';
	import { onMount } from 'svelte';

	const noteState = new NoteState('discovery');

	let note = $derived(noteState.note);

	let totalPages = $state(0);
	let currentPage = $state(1);
	let currentIndex = $state(0);
	let lastItemIndex = $state<number>(99);

	let isDeleteOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let isEditNotebookOpen = $state(false);

	async function getNextNote() {
		if (currentIndex == lastItemIndex && currentPage == totalPages) return;
		currentIndex++;
		if (currentIndex == 100) {
			currentPage++;
			await noteState.getDiscoverNoteList(currentPage);
			currentIndex = 0;
		}
		await noteState.getDiscoverNote(currentIndex);
		lastItemIndex = noteState.noteList.items.length - 1;
	}

	async function getPreviousNote() {
		if (currentIndex == 0 && currentPage == 1) return;
		currentIndex--;
		if (currentIndex < 0 && currentPage > 1) {
			currentPage--;
			await noteState.getDiscoverNoteList(currentPage);
			currentIndex = 99;
		}
		await noteState.getDiscoverNote(currentIndex);
	}

	async function upvote() {
		await noteState.upvoteWeight();
		await getNextNote();
	}

	async function downvote() {
		await noteState.downvoteWeight();
		await getNextNote();
	}

	let initialLoading = $state();

	onMount(async () => {
		await noteState.getDiscoverNoteList(1);
		initialLoading = await noteState.getDiscoverNote(0);
		totalPages = noteState.noteList.totalPages;
	});
</script>

{#await initialLoading then}
	{#if note}
		<Topbar.Root class="pl-1">
			<Topbar.SidebarIcon></Topbar.SidebarIcon>
			<Topbar.NavBtns
				{currentIndex}
				{currentPage}
				{totalPages}
				{lastItemIndex}
				onLeft={getPreviousNote}
				onRight={getNextNote}
			></Topbar.NavBtns>
			<!-- {note.score.toFixed(2)} -->
			<Topbar.Weight onUp={upvote} onDown={downvote}></Topbar.Weight>
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
				action={(newRating) => {
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
			<NoteContent {note} />
		</div>
	{:else}
		<div class="grid h-screen place-items-center">
			<!-- <NoteLoading /> -->
			<br />
		</div>
	{/if}
{/await}

{#await initialLoading then}
	{#if note}
		<Delete
			bind:isOpen={isDeleteOpen}
			name="Note"
			action={() => {
				noteState.softDeleteNote();
				window.history.back();
			}}>this note</Delete
		>

		<EditNotebook
			currentNotebookID={note.expand?.notebook.id}
			bind:isOpen={isEditNotebookOpen}
			action={(selectedNotebookID) => {
				noteState.changeNotebook(selectedNotebookID);
			}}
		></EditNotebook>

		<EditTags
			bind:isOpen={isEditTagsOpen}
			currentTags={note.expand?.tags}
			action={(selectedTags) => noteState.changeTags(selectedTags)}
		/>
	{/if}
{/await}
