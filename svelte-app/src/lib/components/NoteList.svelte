<script lang="ts">
	import { goto } from '$app/navigation';
	import type { NoteList, Note } from '$lib/types';

	type Props = {
		isBulkEdit: boolean;
		notes: NoteList[];
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

	console.log(notes.items[0]);
</script>

{#snippet renderNotes(note: Note)}
	<figure class="w-full">
		<img class="w-full" src={note.thumbnail} alt="" />
	</figure>
	<div id="card-body" class="card-body p-golden-lg w-full">
		<div id="card-title" class="card-title text-pretty break-all text-left">
			{note.title}
		</div>

		{#if !note.thumbnail}
			<p class="line-clamp-3 text-left">
				{note.description}
			</p>
		{/if}
		<div class="gap-golden-sm flex flex-wrap items-center">
			{#if note.expand?.notebook}
				<span class="badge badge-soft rounded-sm">{note.expand?.notebook.name}</span>
			{/if}
			{#if note.expand?.tags}
				{#each note.expand?.tags as tag}
					<span class="badge text-nowrap">{tag.name}</span>
				{/each}
			{/if}
		</div>
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
						class="card animate-in fade-in-0 slide-in-from-bottom-5 hover:bg-base-200/70 bg-base-100 card-border w-full border transition-colors duration-200 hover:cursor-pointer"
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
