<script lang="ts">
	import type { NoteState } from '$lib/db.svelte';
	import { Archive, Merge, Trash2 } from 'lucide-svelte';
	import { Delete } from '$lib/components/';

	type Props = {
		selectedNotesID: string[];
		noteState: NoteState;
		isBulkEdit: boolean;
	};

	let { selectedNotesID, noteState, isBulkEdit = $bindable() }: Props = $props();

	let isDeleteOpen = $state(false);
</script>

<div
	class="bg-base-100/95 border-t-base-200 animate-in fade-in-0 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div
		class="animate-in zoom-in-95 zoom-out-95 fade-out-0 flex flex-row items-center gap-x-4 px-3 py-2"
	>
		<div>{selectedNotesID.length} Note{selectedNotesID.length > 1 ? 's' : ''} Selected</div>
		<button class="btn flex items-center gap-x-2"><Merge size={18} />Merge</button>
		<button
			onclick={() => {
				noteState.archiveMultiple(selectedNotesID);
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
</div>

<Delete
	bind:isOpen={isDeleteOpen}
	name="Notes"
	action={() => {
		noteState.deleteMultiple(selectedNotesID);
		isBulkEdit = false;
	}}>these notes?</Delete
>
