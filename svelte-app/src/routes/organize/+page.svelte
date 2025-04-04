<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { New, NotebookList, TagList } from '$lib/components';
	import { getNotebookState, getTagState } from '$lib/db.svelte';

	const notebookState = getNotebookState();
	const tagState = getTagState();

	let isNewNotebookOpen = $state(false);
	let isNewTagOpen = $state(false);
	let newNotebookName = $state('');
	let newTagName = $state('');
</script>

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="mx-auto max-w-5xl py-6 pb-20 pt-10">
		<div class="flex items-center px-3">
			<h1 class="grow">Notebooks</h1>
			<button
				onclick={() => {
					isNewNotebookOpen = true;
				}}
				class="btn">New Notebook</button
			>
		</div>

		<div class="card">
			<ul class="menu w-full">
				<NotebookList allowEdit={true} notebooks={notebookState.notebooks} />
			</ul>
		</div>

		<div class="divider"></div>

		<div class="flex items-center px-3">
			<h1 class="grow">Tags</h1>
			<button
				onclick={() => {
					isNewTagOpen = true;
				}}
				class="btn">New Tag</button
			>
		</div>

		<ul class="menu grid w-full grid-cols-1 gap-x-3 md:grid-cols-2 lg:grid-cols-3">
			<TagList allowEdit={true} tags={tagState.tags} />
		</ul>
	</div>
</ScrollArea>

<New
	bind:isOpen={isNewTagOpen}
	newType="Tag"
	bind:name={newTagName}
	action={() => tagState.createOnebyName(newTagName)}
/>

<New
	bind:isOpen={isNewNotebookOpen}
	newType="Notebook"
	bind:name={newNotebookName}
	action={() => notebookState.createOnebyName(newNotebookName)}
/>
