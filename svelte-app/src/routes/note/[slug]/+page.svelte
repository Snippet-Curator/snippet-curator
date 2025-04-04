<script lang="ts">
	import { page } from '$app/state';
	import {
		Note,
		Topbar,
		Delete,
		TopbarTags,
		TopbarDelete,
		Rating,
		EditNotebook,
		TopbarBack,
		TopbarNoteInfo,
		TopbarNotebook
	} from '$lib/components/';
	import { NoteState } from '$lib/db.svelte';

	const noteState = new NoteState(page.params.slug);
	let note = $derived(noteState.note);

	let isDeleteOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let selectedNotebookID = $state('');

	const initialLoading = noteState.getNote();
</script>

{#await initialLoading}
	<br />
{:then}
	<Topbar>
		<TopbarBack />
		<div class="grow"></div>
		<Rating />
		{#if note.expand?.tags}
			<TopbarTags tags={note.expand.tags} />
		{/if}
		<div class="divider divider-horizontal"></div>
		{#if note.expand?.notebook}
			<TopbarNotebook bind:isOpen={isEditNotebookOpen} notebook={note.expand.notebook} />
		{/if}
		<TopbarDelete bind:isOpen={isDeleteOpen} />
		<TopbarNoteInfo {note} />
	</Topbar>
	<div class="h-[calc(100vh-60px)]">
		<Note {note} />
	</div>

	<Delete bind:isOpen={isDeleteOpen} name="Note" action={async () => await noteState.deleteNote()}
		>this note</Delete
	>

	<EditNotebook
		bind:selectedNotebookID
		currentNotebookID={note.expand?.notebook.id}
		bind:isOpen={isEditNotebookOpen}
		action={async () => {
			await noteState.changeNotebook(selectedNotebookID);
		}}
	></EditNotebook>
{/await}
