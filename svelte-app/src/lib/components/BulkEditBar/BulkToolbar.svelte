<script lang="ts">
	import type { NotelistState } from '$lib/db.svelte';
	import { Archive, Merge, Trash2, Notebook as NotebookIcon, Tags } from 'lucide-svelte';
	import { Delete, EditNotebook, EditTags } from '$lib/components/';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	type Props = {
		selectedNotesID: string[];
		notelistState: NotelistState;
		isBulkEdit: boolean;
	};

	let { selectedNotesID = $bindable(), notelistState, isBulkEdit = $bindable() }: Props = $props();

	let isDeleteOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let isEditTagsOpen = $state(false);
	let selectedNotebookID = $state('');
	let selectedTags = $state<string[]>([]);
	let currentNotebookName = $state('');

	onMount(async () => {
		const currentNotebook = await notelistState.getCurrentNotebook(page.params.slug);
		currentNotebookName = currentNotebook.name;
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
			<button class="btn"><Merge size={18} class="text-base-content/60" />Merge</button>
			{#if currentNotebookName != 'Archive' && currentNotebookName != 'Trash'}
				<button
					onclick={() => {
						notelistState.archiveMultiple(selectedNotesID);
						isBulkEdit = false;
					}}
					class="btn"><Archive size={18} class="text-base-content/60" />Archive</button
				>
			{/if}
			{#if currentNotebookName != 'Trash'}
				<button
					onclick={() => {
						isDeleteOpen = true;
					}}
					class="btn"><Trash2 size={18} class="text-base-content/60" />Delete</button
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
	action={async () => {
		await notelistState.softDeleteMultiple(selectedNotesID);
		isBulkEdit = false;
	}}>these notes?</Delete
>

<EditNotebook
	bind:isOpen={isEditNotebookOpen}
	bind:selectedNotebookID
	action={async () => {
		await notelistState.changeNotebook(selectedNotesID, selectedNotebookID);
		isBulkEdit = false;
	}}
/>

<EditTags
	bind:isOpen={isEditTagsOpen}
	bind:selectedTags
	currentTags="[]"
	action={async () => {
		await notelistState.changeTags(selectedNotesID, selectedTags);
		isBulkEdit = false;
	}}
/>
