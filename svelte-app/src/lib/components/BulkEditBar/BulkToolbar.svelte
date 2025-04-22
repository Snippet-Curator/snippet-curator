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

	let { selectedNotesID, notelistState, isBulkEdit = $bindable() }: Props = $props();

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
	class="bg-base-100/95 border-t-base-200 animate-in fade-in-0 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div
		class="animate-in zoom-in-95 zoom-out-95 fade-out-0 gap-golden-md flex flex-col items-center md:flex-row"
	>
		<div class="md:mr-4">
			{selectedNotesID.length} Note{selectedNotesID.length > 1 ? 's' : ''} Selected
		</div>
		<div id="button-wrap" class="gap-golden-md grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
			<button
				onclick={() => {
					isEditNotebookOpen = true;
				}}
				class="btn flex items-center gap-x-2"
				><span class="text-base-content/60"><NotebookIcon size={18} /></span>Edit Notebook</button
			>
			<button
				onclick={() => {
					isEditTagsOpen = true;
				}}
				class="btn flex items-center gap-x-2"
				><span class="text-base-content/60"><Tags size={18} /></span>Edit Tags</button
			>
			<button class="btn flex items-center gap-x-2"
				><span class="text-base-content/60"><Merge size={18} /></span>Merge</button
			>
			{#if currentNotebookName != 'Archive'}
				<button
					onclick={() => {
						notelistState.archiveMultiple(selectedNotesID);
						isBulkEdit = false;
					}}
					class="btn flex items-center gap-x-2"
					><span class="text-base-content/60"><Archive size={18} /></span>Archive</button
				>
			{/if}
			<button
				onclick={() => {
					isDeleteOpen = true;
				}}
				class="btn flex items-center gap-x-2"
				><span class="text-base-content/60"><Trash2 size={18} /></span>Delete</button
			>
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
