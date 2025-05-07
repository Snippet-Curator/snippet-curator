<script lang="ts">
	import { page } from '$app/state';
	import { NoteContent, Delete, EditNotebook, EditTags, NoteLoading } from '$lib/components/';
	import { NoteState } from '$lib/db.svelte';
	import * as Topbar from '$lib/components/Topbar/index';

	const noteState = new NoteState(page.params.slug);
	let note = $derived(noteState.note);

	let isDeleteOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let isEditNotebookOpen = $state(false);

	const initialLoading = noteState.getNote();
</script>

{#await initialLoading}
	<div class="h-[calc(100vh-60px)]">
		<NoteLoading />
	</div>
{:then}
	<Topbar.Root>
		<Topbar.Back />
		<div class="grow"></div>
		{#if note.expand?.tags}
			<Topbar.Tags tags={note.expand.tags} />
		{/if}
		<Topbar.TagBtn bind:isOpen={isEditTagsOpen} />
		{#if note.expand?.notebook}
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
			action={() => {
				noteState.archiveNote();
				window.history.back();
			}}
		/>
		<Topbar.Delete bind:isOpen={isDeleteOpen} />
		<Topbar.Info {note} />
	</Topbar.Root>
	<div class="h-[calc(100vh-60px)]">
		<NoteContent {note} />
	</div>

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
{/await}
