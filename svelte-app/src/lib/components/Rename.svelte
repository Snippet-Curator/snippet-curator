<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';
	let { isOpen = $bindable(), name } = $props();
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		{@render name()}
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
