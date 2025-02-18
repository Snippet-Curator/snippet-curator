<script lang="ts">
	import { goto } from '$app/navigation';
	let { notes } = $props();
</script>

<div
	class="min-w-0 columns-1 space-x-4 space-y-6 px-6 pb-10 pt-10 md:columns-2 md:px-10 md:pt-8 lg:columns-3 2xl:columns-4"
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
				<div class="card-body pb-2 pt-5">
					<div class="card-title text-left">
						{note.title}
					</div>
					{#if note.attachments.length == 0}
						{@html note.content.slice(0, 200)}
					{/if}
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
</div>
