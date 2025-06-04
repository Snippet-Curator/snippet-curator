<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Archive, ArchiveRestore } from 'lucide-svelte';

	type Props = {
		archive: () => void;
		unArchive: () => void;
		isArchive?: boolean;
		selectedNotesID: string[];
	};

	let { archive, unArchive, isArchive = false, selectedNotesID }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		if (event.shiftKey && event.key === 'A') {
			event.preventDefault();
			if (selectedNotesID.length > 0) {
				archive();
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

{#snippet renderArchived(archived: string, Icon, action)}
	<button
		onclick={() => {
			if (selectedNotesID.length > 0) {
				action();
			}
		}}
		class="btn"
	>
		<Icon size={18} class="text-base-content/60" />{archived}</button
	>
{/snippet}

{#if isArchive}
	{@render renderArchived('Un-Archive', ArchiveRestore, unArchive)}
{:else}
	{@render renderArchived('Archive', Archive, archive)}
{/if}
