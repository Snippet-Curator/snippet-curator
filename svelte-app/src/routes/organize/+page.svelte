<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { NotebookList, TagList } from '$lib/components';
	import { getNotebookState, getTagState } from '$lib/db.svelte';

	const notebookState = getNotebookState();
	const tagState = getTagState();
</script>

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="mx-auto max-w-5xl p-6 pb-20">
		<h1>Notebooks</h1>

		<div class="card pt-4">
			<ul class="menu w-full">
				<NotebookList allowEdit={true} notebooks={notebookState.notebooks} />
			</ul>
		</div>

		<div class="divider"></div>

		<h1>Tags</h1>

		<ul class="menu grid w-full grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
			<TagList allowEdit={true} tags={tagState.tags} />
		</ul>
	</div>
</ScrollArea>
