<script lang="ts">
	import { page } from '$app/state';
	import { NoteContent, Delete, EditNotebook, EditTags } from '$lib/components/';
	import { NoteState } from '$lib/db.svelte';
	import * as Topbar from '$lib/components/Topbar/index';
	import { toast } from 'svelte-sonner';

	const noteState = new NoteState(page.params.slug);
	let note = $derived(noteState.note);

	let isDeleteOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let selectedNotebookID = $state('');
	let selectedTags = $state<string[]>([]);
	let newRating = $state(0);

	const initialLoading = noteState.getNote();
</script>

{#await initialLoading}
	<br />
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
			bind:newRating
			action={() => {
				noteState.changeRating(newRating);
			}}
		/>

		<div class="divider divider-horizontal"></div>

		<Topbar.Archive
			action={async () => {
				await noteState.archiveNote();
				toast('Archived Note');
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
		action={async () => {
			await noteState.softDeleteNote();
			toast('Deleted Note');
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
{/await}
