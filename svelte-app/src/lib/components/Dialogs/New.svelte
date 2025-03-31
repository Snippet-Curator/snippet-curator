<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';

	type Props = {
		isOpen: boolean;
		name: string;
		newType: 'Tag' | 'Notebook';
		action: () => void;
	};

	let { isOpen = $bindable(), newType, name = $bindable(), action }: Props = $props();
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content
		onInteractOutside={() => (isOpen = false)}
		onCloseAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>New {newType}</Dialog.Title>
		</Dialog.Header>
		<label class="input w-full">
			<span class="label">{newType} Name</span>
			<input type="text" class="ring-0" bind:value={name} />
		</label>
		<div class="flex justify-end gap-x-2">
			<button onclick={() => (isOpen = false)} class="btn">Close</button>
			<button
				onclick={() => {
					action();
					isOpen = false;
				}}
				class="btn btn-primary">Create</button
			>
		</div>
	</Dialog.Content>
</Dialog.Root>
