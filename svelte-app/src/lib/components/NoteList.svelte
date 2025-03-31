<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Note } from '$lib/types';

	type Props = {
		isBulkEdit: boolean;
		notes: Note[];
	};

	let { notes, isBulkEdit = false }: Props = $props();
</script>

{#snippet renderNotes(note)}
	<div
		class="card hover:bg-base-200/70 bg-base-100 card-border w-full border transition-colors duration-300 hover:cursor-pointer"
	>
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
	</div>
{/snippet}

<div
	class="columns-1 gap-x-8 space-y-6 px-6 pb-10 pt-10 md:columns-2 md:px-10 md:pt-8 lg:columns-3 2xl:columns-4"
>
	{#if notes.items.length > 0}
		{#each notes.items as note}
			<div class="group relative">
				{#if !isBulkEdit}
					<button class="w-full" onclick={() => goto(`#/note/${note.id}`)}>
						{@render renderNotes(note)}
					</button>
				{:else}
					{@render renderNotes(note)}
				{/if}
			</div>
		{/each}
	{:else}
		<br />
	{/if}
</div>
