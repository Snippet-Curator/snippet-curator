<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Note } from '$lib/types';

	type Props = {
		isBulkEdit: boolean;
		notes: Note[];
		selectedNotesID: string[];
	};

	let { notes, isBulkEdit = false, selectedNotesID = $bindable() }: Props = $props();

	function checkListNote(checkedNoteID: string) {
		if (selectedNotesID.includes(checkedNoteID)) {
			selectedNotesID = selectedNotesID.filter((noteID: string) => noteID != checkedNoteID);
			console.log('removed note', selectedNotesID);
			return;
		}
		selectedNotesID.push(checkedNoteID);
		console.log('added note', selectedNotesID);
	}
</script>

{#snippet renderNotes(note)}
	<figure class="w-full">
		<img class="w-full" src={note.thumbnail} alt="" />
	</figure>
	<div class="card-body w-full pb-2 pt-5">
		<div class="card-title text-pretty break-all text-left">
			{note.title}
		</div>

		{#if !note.thumbnail}
			<p class="line-clamp-3 text-left">
				{note.description}
			</p>
		{/if}
		<div></div>
	</div>
{/snippet}

<div
	class="columns-1 gap-x-8 space-y-6 px-6 pb-10 pt-10 md:columns-2 md:px-10 md:pt-8 lg:columns-3 2xl:columns-4"
>
	{#if notes.items.length > 0}
		{#each notes.items as note}
			<div class="group relative">
				{#if !isBulkEdit}
					<button
						class="card hover:bg-base-200/70 bg-base-100 card-border w-full border transition-colors duration-300 hover:cursor-pointer"
						onclick={() => goto(`#/note/${note.id}`)}
					>
						{@render renderNotes(note)}
					</button>
				{:else}
					<button
						onclick={() => {
							checkListNote(note.id);
						}}
						class="{selectedNotesID.includes(note.id)
							? ' bg-primary/50 opacity-100'
							: ''} card bg-base-100 card-border w-full border opacity-70 transition-colors duration-100 hover:cursor-pointer"
					>
						{@render renderNotes(note)}
					</button>
				{/if}
			</div>
		{/each}
	{:else}
		<br />
	{/if}
</div>
