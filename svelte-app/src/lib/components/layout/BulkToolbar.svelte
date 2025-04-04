<script lang="ts">
	import type { NotelistState } from '$lib/db.svelte';
	import { Archive, Merge, Trash2, Notebook as NotebookIcon } from 'lucide-svelte';
	import { Delete } from '$lib/components/';
	import EditNotebook from '../dialogs/EditNotebook.svelte';

	type Props = {
		selectedNotesID: string[];
		notelistState: NotelistState;
		isBulkEdit: boolean;
	};

	let { selectedNotesID, notelistState, isBulkEdit = $bindable() }: Props = $props();

	let isDeleteOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let selectedNotebookID = $state('');
</script>

<div
	class="bg-base-100/95 border-t-base-200 animate-in fade-in-0 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div
		class="animate-in zoom-in-95 zoom-out-95 fade-out-0 gap-golden-md flex flex-col items-center md:flex-row"
	>
		<div>{selectedNotesID.length} Note{selectedNotesID.length > 1 ? 's' : ''} Selected</div>
		<div id="button-wrap" class="gap-golden-md grid grid-cols-2 sm:grid-cols-4">
			<button
				onclick={() => {
					isEditNotebookOpen = true;
				}}
				class="btn flex items-center gap-x-2"><NotebookIcon size={18} />Edit Notebook</button
			>
			<button class="btn flex items-center gap-x-2"><Merge size={18} />Merge</button>
			<button
				onclick={() => {
					notelistState.archiveMultiple(selectedNotesID);
					isBulkEdit = false;
				}}
				class="btn flex items-center gap-x-2"><Archive size={18} />Archive</button
			>
			<button
				onclick={() => {
					isDeleteOpen = true;
				}}
				class="btn flex items-center gap-x-2"><Trash2 size={18} />Delete</button
			>
		</div>
		<!-- button wrap -->
	</div>
</div>

<Delete
	bind:isOpen={isDeleteOpen}
	name="Notes"
	action={async () => {
		await notelistState.deleteMultiple(selectedNotesID);
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
