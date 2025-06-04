<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Trash2 } from 'lucide-svelte';

	type Props = {
		isTrash: boolean;
		trash: () => void;
		restore: () => void;
		selectedNotesID: string[];
	};

	let { isTrash, trash, restore, selectedNotesID }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		if (event.key === 'Delete') {
			event.preventDefault();
			if (selectedNotesID.length > 0) {
				trash();
			}
			return;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>

{#snippet renderDeleted(deletedString: string, Icon, action)}
	<button
		onclick={() => {
			if (selectedNotesID.length > 0) {
				action();
			}
		}}
		class="btn"
	>
		<Icon size={18} class="text-base-content/60" />{deletedString}</button
	>
{/snippet}

{#if isTrash}
	{@render renderDeleted('Restore', Trash2, restore)}
{:else}
	{@render renderDeleted('Delete', Trash2, trash)}
{/if}
