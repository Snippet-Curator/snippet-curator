<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';

	type Props = {
		isOpen: boolean;
		name: string;
		item: {
			id: string;
			name: string;
		};
		action: (itemID: string, newName: string) => void;
	};

	let { isOpen = $bindable(), name, item, action }: Props = $props();

	let newName = $state(item?.name);
	$effect(() => {
		newName = item?.name;
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Rename</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete this tag?</Dialog.Description>
		</Dialog.Header>

		<label class="input w-full">
			<span class="label">Tag Name</span>
			<input type="text" class="ring-0" placeholder={item.name} bind:value={newName} />
		</label>

		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					action(item.id, newName);
					isOpen = false;
				}}
				class="btn btn-primary">Save</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
