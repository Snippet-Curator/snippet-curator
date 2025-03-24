<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import pb, { getNotebooks, getTags } from '$lib/db.svelte';
	import { type Tag, type Notebook } from '$lib/types';
	import { NotebookList, TagList } from '$lib/components';

	let notebooks = $state<Notebook[]>();
	let tags = $state<Tag[]>();

	onMount(async () => {
		tags = getContext('tags');
		notebooks = getContext('notebooks');

		// notebooks = await getNotebooks();
		// tags = await getTags();
		// pb.realtime.subscribe('tags', async function (event) {
		// 	tags = await getTags();
		// });

		// pb.realtime.subscribe('notebooks', async function (event) {
		// 	notebooks = await getNotebooks();
		// });
	});
	onDestroy(() => {
		// pb.realtime.unsubscribe('notebooks');
		// pb.realtime.unsubscribe('tags');
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
