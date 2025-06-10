<script lang="ts">
	import { page } from '$app/state';

	import type { NotelistState } from '$lib/db.svelte';
	import { Delete, EditNotebook, EditBulkTags } from '$lib/components/';

	import BulkNotebook from './bulk-notebook.svelte';
	import BulkTags from './bulk-tags.svelte';
	import BulkArchive from './bulk-archive.svelte';
	import BulkDelete from './bulk-delete.svelte';
	import BulkMerge from './bulk-merge.svelte';

	type Props = {
		selectedNotesID: string[];
		notelistState: NotelistState;
		isBulkEdit: boolean;
		isArchive?: boolean;
		isTrash?: boolean;
		updatePage: () => void;
	};

	let {
		selectedNotesID = $bindable(),
		notelistState,
		isBulkEdit = $bindable(),
		isArchive = false,
		isTrash = false,
		updatePage
	}: Props = $props();

	let isDeleteOpen = $state(false);
	let isEditNotebookOpen = $state(false);
	let isEditTagsOpen = $state(false);

	const currentTagID = $derived(notelistState.noteType == 'tags' ? page.params.slug : '');
</script>

<div
	class="bg-base-100/95 border-t-base-200 motion-opacity-in-0 motion-duration-100 motion-scale-in-95 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div class="gap-golden-md flex flex-col items-center md:flex-row">
		<div class="md:mr-4">
			{selectedNotesID.length} Note{selectedNotesID.length > 1 ? 's' : ''} Selected
		</div>
		<div id="button-wrap" class="gap-golden-md grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
			<BulkNotebook {selectedNotesID} bind:isOpen={isEditNotebookOpen} />
			<BulkTags {selectedNotesID} bind:isOpen={isEditTagsOpen} />
			<BulkMerge
				{selectedNotesID}
				merge={async () => {
					await notelistState.mergeNotes(selectedNotesID);
					updatePage();
					isBulkEdit = false;
				}}
			></BulkMerge>
			{#if !isTrash}
				<BulkArchive
					{selectedNotesID}
					{isArchive}
					archive={async () => {
						await notelistState.archiveMultiple(selectedNotesID);
						updatePage();
						isBulkEdit = false;
					}}
					unArchive={async () => {
						await notelistState.unArchiveMultiple(selectedNotesID);
						updatePage();
						isBulkEdit = false;
					}}
				/>
			{/if}
			<BulkDelete
				{selectedNotesID}
				{isTrash}
				trash={() => (isDeleteOpen = true)}
				restore={async () => {
					await notelistState.unSoftDeleteMultiple(selectedNotesID);
					updatePage();
					isBulkEdit = false;
				}}
			/>

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
		updatePage();
		isBulkEdit = false;
	}}>these notes?</Delete
>

<EditNotebook
	bind:isOpen={isEditNotebookOpen}
	action={async (selectedNotebookID) => {
		await notelistState.changeNotebook(selectedNotesID, selectedNotebookID);
		updatePage();
		isBulkEdit = false;
	}}
/>

<EditBulkTags
	bind:isOpen={isEditTagsOpen}
	{currentTagID}
	add={async (selectedTagID: string) => {
		await notelistState.addTag(selectedNotesID, selectedTagID);
		updatePage();
	}}
	remove={async (selectedTagID: string) => {
		await notelistState.removeTag(selectedNotesID, selectedTagID);
		updatePage();
	}}
	clearAll={async () => {
		await notelistState.clearTags(selectedNotesID);
		updatePage();
	}}
/>
