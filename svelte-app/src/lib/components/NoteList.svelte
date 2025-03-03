<script lang="ts">
	import { goto } from '$app/navigation';

	let { notes } = $props();
</script>

<div
	class="columns-1 gap-x-8 space-y-6 px-6 pb-10 pt-10 md:columns-2 md:px-10 md:pt-8 lg:columns-3 2xl:columns-4"
>
	{#if notes.items.length > 0}
		{#each notes.items as note}
			<button
				onclick={() => goto(`#/note/${note.id}`)}
				class="card hover:bg-base-200/70 bg-base-100 card-border w-full border transition-colors duration-300 hover:cursor-pointer"
			>
				<figure class="w-full">
					<img class="w-full" src={note.thumbnail} alt="" />
				</figure>
				<div class="card-body w-full pb-2 pt-5">
					<div class="card-title text-pretty break-all text-left">
						{note.title}
					</div>
					{#if note.attachments.length == 0}
						<div class="text-left">{@html note.content.slice(0, 200)}</div>
					{/if}
					<div></div>
				</div>
			</button>
		{/each}
	{:else}
		<br />
	{/if}
</div>
