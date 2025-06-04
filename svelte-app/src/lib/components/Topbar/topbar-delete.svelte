<script lang="ts">
	import { Inbox, Trash2 } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		isOpen: boolean;
		noteStatus: 'active' | 'archived' | 'deleted';
	};

	let { isOpen = $bindable(), noteStatus }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		if (event.key === 'Delete') {
			isOpen = true;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>

{#snippet renderArchived(status: string, Icon)}
	<div class="tooltip tooltip-bottom z-30" data-tip={status}>
		<button onclick={() => (isOpen = true)} class="btn btn-ghost"><Icon size={18} /></button>
	</div>
{/snippet}

{#if noteStatus === 'active'}
	{@render renderArchived('Delete', Trash2)}
{:else if noteStatus === 'deleted'}
	{@render renderArchived('Restore', Inbox)}
{:else if noteStatus === 'archived'}{/if}
