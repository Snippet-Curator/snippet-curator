<script lang="ts">
	let { data } = $props();
	import Search from '$lib/components/Search.svelte';
	import pb, { getAuth } from '$lib/db.js';
	import { onMount } from 'svelte';

	let notes = $state();

	async function getNotes() {
		await getAuth();
		notes = await pb.collection('notes').getList(1, 25, {
			expand: 'tags'
		});
		console.log('notes', notes);
	}

	onMount(async () => {
		await getNotes();
	});
</script>

<Search />

<div class="mx-10 mt-20 grid max-w-3xl grid-cols-4 gap-5 lg:mx-auto">
	{#if notes?.items.length > 0}
		{#each notes.items as note}
			<div class="card bg-base-100 card-border w-64">
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
	{/if}
</div>
