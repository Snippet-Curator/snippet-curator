<script lang="ts">
	import { getNotebooks, getTags, deleteTag } from '$lib/db';
	import { TagEdit } from '$lib/components/index';
	import pb from '$lib/db';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { onMount } from 'svelte';

	import { Notebook, Tag, Pencil } from 'lucide-svelte';

	let notebooks;
	let tags = $state();
	let isTagEdit = $state(false);

	pb.realtime.subscribe('tags', async function (event) {
		tags = await pb.collection('tags').getFullList({
			sort: 'name'
		});
	});

	function openModal() {
		isTagEdit = true;
	}
	function closeModal() {
		isTagEdit = false;
	}

	onMount(async () => {
		notebooks = await getNotebooks();
		tags = await getTags();
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
						<div>fdsfd</div>
					</li>
				{/each}
			</ul>
		</div>

		<div class="divider"></div>

		<h1>Tags</h1>

		<div class="grid grid-cols-2 gap-y-3 pt-4 md:grid-cols-3">
			{#each tags as tag}
				<div
					class="hover:bg-base-200/70 group flex items-center gap-x-6 rounded-lg px-4 py-2 transition-colors"
				>
					<div class="badge group-hover:badge-neutral badge-lg transition-colors">
						<a
							href="#/tags/{tag.id}"
							class="flex items-center justify-center gap-x-2 whitespace-nowrap"
							><Tag size={18} />{tag.name}</a
						>
					</div>
					<button onclick={openModal} class="invisible cursor-pointer group-hover:visible">
						<Pencil size={18} />
					</button>
				</div>
			{/each}
		</div>
	</div>
</ScrollArea>

<TagEdit isOpen={isTagEdit} close={closeModal} action={closeModal}
	>Are you sure you want to delete this note?</TagEdit
>
