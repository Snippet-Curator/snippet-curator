<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';

	import { SelectTags, SelectNotebook } from '$lib/components/index';
	import { getNotebookState, getTagState } from '$lib/db.svelte';
	import { getSearchState } from '$lib/search.svelte';

	const searchState = getSearchState();
	const notebookState = getNotebookState();
	const tagState = getTagState();

	const notebooks = $derived(notebookState.flatNotebooks);
	const tags = $derived(tagState.flatTags);

	let selectedNotebookID = $state('');
	let selectedTagIdArray = $state<string[]>([]);

	type Props = {
		isOpen: boolean;
		searchInput: string;
		search: (customFilter: string) => void;
	};

	let { isOpen = $bindable(), searchInput = $bindable(), search }: Props = $props();
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			isOpen = false;
		}}
		class="scrollbar-thin max-h-full max-w-4xl overflow-y-auto"
	>
		<Dialog.Header>
			<Dialog.Title>Filter Search</Dialog.Title>
		</Dialog.Header>

		<div class="gap-x-golden-md grid grid-cols-12 items-center">
			<div class="col-span-3">
				<legend class="fieldset-legend">Search Term</legend>
			</div>
			<div class="col-span-9 w-full text-right">
				<input type="text" class="input" bind:value={searchInput} />
			</div>
		</div>

		<div class="gap-x-golden-md grid grid-cols-12 items-center">
			<div class="col-span-3">
				<legend class="fieldset-legend">Notebook</legend>
			</div>
			<div class="col-span-8 w-full text-right">
				<SelectNotebook {notebooks} bind:selectedNotebookID={searchState.searchNotebookID} />
			</div>
			<button onclick={() => (searchState.searchNotebookID = '')} class="btn col-span-1"
				>Clear</button
			>
		</div>

		<div class="gap-x-golden-md grid grid-cols-12 items-start">
			<div class="col-span-12">
				<legend class="fieldset-legend">Tags</legend>
			</div>
			<div class="col-span-9 col-start-4 text-right">
				<SelectTags {tags} bind:selectedTagIdArray={searchState.selectedTagIdArray} />
			</div>
		</div>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					searchState.makeFilterQuery(searchInput);
					search(searchState.customFilter);
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
