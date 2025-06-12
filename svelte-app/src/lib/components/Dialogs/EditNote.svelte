<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import type { Snippet } from 'svelte';
	import type { Note } from '$lib/types';
	import { replacePbUrl } from '$lib/utils';

	type Props = {
		isOpen: boolean;
		children?: Snippet;
		action: (selectedThumbnailURL: string) => void;
		note: Note;
		thumbURL: string;
	};

	let { isOpen = $bindable(), action, children, note, thumbURL }: Props = $props();

	let selectedThumbnailURL = $state<string>(thumbURL.split('?')[0]);

	$effect(() => {
		selectedThumbnailURL = thumbURL.split('?')[0];
	});
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			isOpen = false;
		}}
		class="max-w-5xl"
	>
		<Dialog.Header>
			<Dialog.Title>{note.title}</Dialog.Title>
			<Dialog.Description></Dialog.Description>
		</Dialog.Header>
		<ScrollArea class="max-h-[calc(100vh-200px)] overflow-y-auto">
			<!-- <h2 class="m-golden-md font-semibold">Sources</h2>
			{#if note.sources}
				{#each note.sources as source}
					{source.source}
					{source.source_url}
				{/each}
			{/if} -->

			<h2 class="m-golden-md font-semibold">Change Thumbnail</h2>
			<div class="gap-golden-md m-golden-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#if note && note.resources}
					{#each note.resources as resource}
						{#if resource.type.includes('image')}
							<label class="gap-golden-md flex cursor-pointer items-center">
								<input
									type="radio"
									class="peer sr-only"
									value={resource.fileURL}
									bind:group={selectedThumbnailURL}
									name="thumbnail"
								/>

								<img
									class="peer-checked:border-primary border-base-100 border-base-200
										w-[200px] rounded-md border-4 transition-transform duration-150 ease-in-out peer-checked:scale-105"
									src="{replacePbUrl(resource.fileURL)}?thumb=200x0"
									alt=""
								/>
							</label>
						{/if}
					{/each}
					<label class="gap-golden-md flex cursor-pointer items-center">
						<input
							type="radio"
							class="peer sr-only"
							value=""
							bind:group={selectedThumbnailURL}
							name="thumbnail"
						/>
						<div
							class="peer-checked:border-primary border-base-100 bg-base-200 flex h-[200px] w-[200px] items-center justify-center
                                rounded-md border-4 transition-transform duration-150 ease-in-out peer-checked:scale-105"
						>
							No Thumbnail
						</div>
					</label>
				{/if}
			</div>
		</ScrollArea>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					if (!selectedThumbnailURL) {
						action('');
						isOpen = false;
						return;
					}
					action(selectedThumbnailURL);
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
