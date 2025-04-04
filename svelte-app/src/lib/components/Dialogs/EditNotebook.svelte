<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import * as Dialog from '$lib/components/ui/dialog/index';
	import pb from '$lib/db.svelte';
	import { onMount } from 'svelte';
	import type { Notebook } from '$lib/types';

	type Props = {
		isOpen: boolean;
		selectedNotebookID: string;
		currentNotebookID?: string;
		action: () => void;
	};

	let {
		isOpen = $bindable(),
		selectedNotebookID = $bindable(),
		action,
		currentNotebookID = ''
	}: Props = $props();

	let notebooks = $state<Notebook[]>();

	async function getNotebooks() {
		return await pb.collection('notebooks').getFullList();
	}

	onMount(async () => {
		selectedNotebookID = currentNotebookID;
		notebooks = await getNotebooks();
	});
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			isOpen = false;
		}}
	>
		<Dialog.Header>
			<Dialog.Title>Change Notebook</Dialog.Title>
			<Dialog.Description>Select Notebook to change</Dialog.Description>
		</Dialog.Header>

		<ScrollArea class="bg-base-200/30 p-golden-md h-[20vh] rounded-lg">
			{#each notebooks as notebook}
				<ul class="list">
					<li class="list-row flex items-center">
						<label for="">
							<input
								type="radio"
								class="radio radio-sm mx-2"
								name="radio-1"
								bind:group={selectedNotebookID}
								value={notebook.id}
							/>
							{notebook.name}
						</label>
					</li>
				</ul>
			{/each}
		</ScrollArea>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					action();
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
