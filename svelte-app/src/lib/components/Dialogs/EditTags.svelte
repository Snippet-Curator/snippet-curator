<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import pb from '$lib/db.svelte';
	import type { Tag } from '$lib/types';

	type Props = {
		isOpen: boolean;
		action: (selectedTags: string[]) => void;
		currentTags: Tag[];
	};

	let { isOpen = $bindable(), currentTags, action }: Props = $props();

	let tags = $state<RecordModel[]>();
	let selectedTags = $state<string[]>([]);
	let filteredTags = $state<RecordModel[]>([]);
	let tagSearchTerm = $state<string>('');

	async function getTags() {
		return await pb.collection('tags').getFullList();
	}

	function filterTag() {
		if (!tags) return;

		if (!tagSearchTerm) {
			filteredTags = tags;
			return;
		}

		filteredTags = tags.filter((tag) => {
			return tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase());
		});
	}

	function toggleTag(id: string) {
		if (selectedTags.includes(id)) {
			selectedTags = selectedTags.filter((tag) => tag !== id);
		} else {
			selectedTags.push(id);
		}
	}

	onMount(async () => {
		tags = await getTags();
		filteredTags = tags;
		currentTags.forEach((tag) => {
			selectedTags.push(tag.id);
		});
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
			<Dialog.Title>Change Tags</Dialog.Title>
			<Dialog.Description>Select Tags</Dialog.Description>
		</Dialog.Header>

		<input
			type="text"
			bind:value={tagSearchTerm}
			class="input w-full"
			oninput={() => filterTag()}
		/>

		<ScrollArea class="bg-base-200/30 p-golden-md h-[20vh] rounded-lg">
			{#each filteredTags as tag}
				<ul class="list">
					<li class="list-row flex items-center">
						<label for="">
							<input
								type="checkbox"
								class="checkbox checkbox-md"
								value={tag.id}
								checked={selectedTags.includes(tag.id)}
								onchange={() => toggleTag(tag.id)}
							/>
							{tag.name}
						</label>
					</li>
				</ul>
			{/each}
		</ScrollArea>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					action(selectedTags);
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
