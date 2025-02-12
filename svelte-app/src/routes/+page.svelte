<script lang="ts">
	import { onMount } from 'svelte';
	import pb, { getAuth } from '$lib/db';
	import Search from '$lib/components/Search.svelte';

	import type { Note } from '$lib/types';
	import { goto } from '$app/navigation';

	let notes = $state<{ items: Note[] }>();

	async function getNotes() {
		await getAuth();
		notes = await pb.collection('notes').getList(1, 25, {
			expand: 'tags'
		});
	}

	onMount(async () => {
		await getNotes();
	});
</script>

<Search />

<div class="mx-10 mt-20 grid max-w-3xl grid-cols-4 gap-5 lg:mx-auto">
	{#if notes?.items.length > 0}
		{#each notes.items as note}
			<div
				onclick={() => goto(`#/note/${note.id}`)}
				class="card hover:bg-base-200/70 bg-base-100 card-border w-64 border transition-colors duration-300 hover:cursor-pointer"
			>
				<div class="card-body">
					<div class="card-title">
						{note.title}
					</div>
					<div class="card-content">
						{@html note.content}
					</div>
					<div>
						{#each note.expand.tags as tag}
							<div class="badge badge-outline">
								{tag.name}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	{:else}
		No notes
	{/if}
</div>
