<script lang="ts">
	import type { NotelistState } from '$lib/db.svelte';
	import { Archive, Trash2, Notebook as NotebookIcon, Tags } from 'lucide-svelte';
	import { Delete, EditNotebook, EditBulkTags } from '$lib/components/';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/state';

	type Props = {
		selectedNotesID: string[];
		notelistState: NotelistState;
		isBulkEdit: boolean;
		bulkStatus: 'default' | 'archive' | 'trash';
	};

	let {
		selectedNotesID = $bindable(),
		notelistState,
		bulkStatus,
		isBulkEdit = $bindable()
	}: Props = $props();

	let isDeleteOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let currentNotebookName = $state('');

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		switch (event.key) {
			case 'n':
				event.preventDefault();
				isEditNotebookOpen = true;
				break;
			case 't':
				event.preventDefault();
				isEditTagsOpen = true;
				break;
		}
	}

	let noteTags = $derived.by(async () => await notelistState.getTags(selectedNotesID));
	let tags = $derived(notelistState.tags);

	onMount(async () => {
		// if page is a notebook slug, then get notebook name
		if (notelistState.noteType == 'notebooks') {
			const currentNotebook = await notelistState.getCurrentNotebook(page.params.slug);
			currentNotebookName = currentNotebook.name;
		}
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>

<div
	class="bg-base-100/95 border-t-base-200 motion-opacity-in-0 motion-duration-100 motion-scale-in-95 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div class="gap-golden-md flex flex-col items-center md:flex-row">
		<div class="md:mr-4">
			{selectedNotesID.length} Note{selectedNotesID.length > 1 ? 's' : ''} Selected
		</div>
		<div id="button-wrap" class="gap-golden-md grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
			<button
				onclick={() => {
					isEditNotebookOpen = true;
				}}
				class="btn"
			>
				<NotebookIcon size={18} class="text-base-content/60" />Edit Notebook</button
			>
			<button
				onclick={() => {
					isEditTagsOpen = true;
				}}
				class="btn"><Tags size={18} class="text-base-content/60" />Edit Tags</button
			>
			<!-- <button class="btn"><Merge size={18} class="text-base-content/60" />Merge</button> -->
			{#if bulkStatus === 'default'}
				<button
					onclick={() => {
						notelistState.archiveMultiple(selectedNotesID);

						isBulkEdit = false;
					}}
					class="btn"><Archive size={18} class="text-base-content/60" />Archive</button
				>
				<button
					onclick={() => {
						isDeleteOpen = true;
					}}
					class="btn"><Trash2 size={18} class="text-base-content/60" />Delete</button
				>
			{:else if bulkStatus === 'archive'}
				<button
					onclick={() => {
						notelistState.unArchiveMultiple(selectedNotesID);

						isBulkEdit = false;
					}}
					class="btn"><Archive size={18} class="text-base-content/60" />Restore</button
				>
				<button
					onclick={() => {
						isDeleteOpen = true;
					}}
					class="btn"><Trash2 size={18} class="text-base-content/60" />Delete</button
				>
			{:else if bulkStatus === 'trash'}
				<button
					onclick={() => {
						notelistState.unSoftDeleteMultiple(selectedNotesID);
						isBulkEdit = false;
					}}
					class="btn"><Trash2 size={18} class="text-base-content/60" />Restore</button
				>
			{/if}
			<button onclick={() => (isBulkEdit = false)} class="btn btn-soft">Cancel</button>
		</div>
		<!-- button wrap -->
	</div>
</div>

<Delete
	bind:isOpen={isDeleteOpen}
	name="Notes"
	action={() => {
		notelistState.softDeleteMultiple(selectedNotesID);

		isBulkEdit = false;
	}}>these notes?</Delete
>

<EditNotebook
	bind:isOpen={isEditNotebookOpen}
	action={(selectedNotebookID) => {
		notelistState.changeNotebook(selectedNotesID, selectedNotebookID);
		isBulkEdit = false;
	}}
/>

{#await noteTags then noteTags}
	<EditBulkTags
		bind:isOpen={isEditTagsOpen}
		addAll={(selectedTagIDs) => notelistState.addAllTags(selectedNotesID, selectedTagIDs)}
		clearAll={() => notelistState.clearTags(selectedNotesID)}
	/>
{/await}
