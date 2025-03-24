<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';
	import type { Snippet } from 'svelte';

	type Props = {
		isOpen: boolean;
		dialogName: Snippet;
		dialogType: Snippet;
		dialogContent: Snippet;
		dialogActions: Snippet;
	};

	let {
		isOpen = $bindable(),
		dialogType,
		dialogName,
		dialogContent,
		dialogActions
	}: Props = $props();
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content onCloseAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header>
			<Dialog.Title>{@render dialogType()}</Dialog.Title>
			<Dialog.Description>{@render dialogName()}</Dialog.Description>
		</Dialog.Header>
		{@render dialogContent()}
		{@render dialogActions()}
	</Dialog.Content>
</Dialog.Root>
