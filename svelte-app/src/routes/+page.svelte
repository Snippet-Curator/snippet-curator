<script lang="ts">
	import { onMount } from 'svelte';
	import pb, { getAuth } from '$lib/db';
	import { Search, Pagination } from '$lib/components/';
	import type { NoteRecord } from '$lib/types';

	import { goto } from '$app/navigation';

	let notes = $state<NoteRecord>();
	let noteCount = $state();
	let clickedPage = $state(1);

	async function getNotes() {
		await getAuth();
		notes = await pb.collection('notes').getList(1, 25, {
			expand: 'tags'
		});
	}

	async function changePage(currentPage: number) {
		clickedPage = currentPage;
		notes = await pb.collection('notes').getList(clickedPage, 25, {
			expand: 'tags'
		});
	}

	onMount(async () => {
		await getNotes();
	});
</script>

<div class="relative">
	<Search />
</div>

<div>
	<Pagination
		totalPages={notes?.totalPages}
		bind:clickedPage
		currentPage={notes?.page}
		{changePage}
	/>
</div>

<div
	class="mt-10 columns-1 space-x-4 space-y-10 px-6 pb-10 pt-10 md:columns-2 md:px-10 md:pt-8 lg:columns-3 2xl:columns-4"
>
	{#if notes?.items.length > 0}
		{#each notes.items as note}
			<button
				onclick={() => goto(`#/note/${note.id}`)}
				class="card hover:bg-base-200/70 bg-base-100 card-border border transition-colors duration-300 hover:cursor-pointer"
			>
				<figure>
					<img src="http://127.0.0.1:8090/api/files/notes/{note.id}/{note.attachments[0]}" alt="" />
				</figure>
				<div class="card-body">
					<div class="card-title text-left">
						{note.title}
					</div>
					<div>
						{#each note.expand.tags as tag}
							<div class="badge badge-outline">
								{tag.name}
							</div>
						{/each}
					</div>
				</div>
			</button>
		{/each}
	{:else}
		No notes
	{/if}
	<div>
		<Pagination
			totalPages={notes?.totalPages}
			bind:clickedPage
			currentPage={notes?.page}
			{changePage}
		/>
	</div>
</div>
