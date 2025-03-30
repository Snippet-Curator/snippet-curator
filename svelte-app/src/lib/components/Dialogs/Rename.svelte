<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';

	type Props = {
		isOpen: boolean;
		renameType: string;
		currentName: string;
		newName: string;
		action: () => void;
	};

	let {
		isOpen = $bindable(),
		currentName,
		renameType,
		newName = $bindable(),
		action
	}: Props = $props();
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>Rename {renameType}</Dialog.Title>
			<Dialog.Description>Change {renameType.toLowerCase()} to new name</Dialog.Description>
		</Dialog.Header>
		<label class="input w-full">
			<span class="label">{renameType} Name</span>
			<input
				type="text"
				class="ring-0"
				placeholder={currentName}
				bind:value={newName}
				onfocus={() => (newName = currentName)}
			/>
		</label>
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
