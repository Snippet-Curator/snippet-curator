<script lang="ts">
	import { getNotebooks, getTags } from '$lib/db';
	import { TagList } from '$lib/components';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { onMount } from 'svelte';

	import { Notebook, Tag, Pencil } from 'lucide-svelte';

	let notebooks;
	let tags = $state();

	onMount(async () => {
		notebooks = await getNotebooks();
		tags = await getTags();
		console.log(tags);
	});
</script>

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="mx-auto max-w-4xl p-6 pb-20">
		<h1>Notebooks</h1>

		<div class="card pt-4">
			<ul class="list">
				{#each notebooks as notebook}
					<li class="list-row">
						<Notebook size={18} />

						<a href="#/notebook/{notebook.id}"><div class="w-full">{notebook.name}</div></a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="divider"></div>

		<h1>Tags</h1>

		<ul class="menu grid w-full grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
			<TagList {tags} />
		</ul>
	</div>
</ScrollArea>
