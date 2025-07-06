<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import type { Note } from '$lib/types';
	import { replacePbUrl } from '$lib/utils';
	import { X } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { SelectTags, SelectNotebook } from '$lib/components/index';
	import { getNotebookState, getTagState } from '$lib/db.svelte';
	const notebookState = getNotebookState();
	const tagState = getTagState();
	const notebooks = $derived(notebookState.flatNotebooks);
	const tags = $derived(tagState.flatTags);
	let selectedNotebookID = $state('');
	let selectedTagIDs = $state([]);

	type Props = {
		isOpen: boolean;
	};

	let { isOpen = $bindable() }: Props = $props();
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
				<legend class="fieldset-legend">Notebook</legend>
			</div>
			<div class="col-span-9 w-full text-right">
				<SelectNotebook {notebooks} bind:selectedNotebookID />
			</div>
		</div>

		<div class="gap-x-golden-md grid grid-cols-12 items-start">
			<div class="col-span-12">
				<legend class="fieldset-legend">Tags</legend>
			</div>
			<div class="col-span-9 col-start-4 text-right">
				<SelectTags {tags} bind:selectedTagIDs />
			</div>
		</div>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button class="btn btn-primary">Save</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
