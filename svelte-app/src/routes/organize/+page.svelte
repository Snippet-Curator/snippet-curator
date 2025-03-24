<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { signalNotebooks, signalTags } from '$lib/utils.svelte';
	import { type Tag, type Notebook } from '$lib/types';
	import { NotebookList, TagList } from '$lib/components';

	let notebooks = $state<Notebook[]>(signalNotebooks.notebooks);
	let tags = $state<Tag[]>(signalTags.tags);

	$effect(() => {
		tags = signalTags.tags;
		notebooks = signalNotebooks.notebooks;
	});
</script>

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="mx-auto max-w-5xl p-6 pb-20">
		<h1>Notebooks</h1>

		<div class="card pt-4">
			<ul class="menu w-full">
				<NotebookList allowEdit={true} {notebooks} />
			</ul>
		</div>

		<div class="divider"></div>

		<h1>Tags</h1>

		<ul class="menu grid w-full grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
			<TagList allowEdit={true} {tags} />
		</ul>
	</div>
</ScrollArea>
