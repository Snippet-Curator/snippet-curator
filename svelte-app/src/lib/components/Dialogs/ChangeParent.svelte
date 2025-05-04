<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import * as Dialog from '$lib/components/ui/dialog/index';

	type Props = {
		isOpen: boolean;
		renameType: string;
		searchTerm: string;
		filteredItems: [
			{
				name: string;
				id: string;
			}
		];
		selectedID: string;
		cancel: () => void;
		action: () => Promise<void>;
		filter: () => void;
	};

	let {
		isOpen = $bindable(),
		renameType,
		selectedID = $bindable(),
		searchTerm = $bindable(),
		filteredItems,
		cancel,
		action,
		filter
	}: Props = $props();
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			searchTerm = '';
			isOpen = false;
		}}
	>
		<Dialog.Header>
			<Dialog.Title>Change Parent {renameType}</Dialog.Title>
			<Dialog.Description>Select parent {renameType.toLowerCase()} to change</Dialog.Description>
		</Dialog.Header>
		<input type="text" bind:value={searchTerm} class="input w-full" oninput={filter} />
		<ScrollArea class="bg-base-200/30 h-[30vh] rounded-lg">
			{#each filteredItems as item}
				<ul class="list">
					<li class="list-row flex items-center">
						<label for="">
							<input
								type="radio"
								class="radio radio-sm mx-2"
								name="radio-1"
								bind:group={selectedID}
								value={item.id}
							/>
							{item.name}
						</label>
					</li>
				</ul>
			{/each}
		</ScrollArea>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					cancel();
					searchTerm = '';
					isOpen = false;
				}}
				class="btn">Clear Parent {renameType}</button
			>
			<button
				onclick={async () => {
					await action();
					searchTerm = '';
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
