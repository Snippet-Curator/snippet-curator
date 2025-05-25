<script lang="ts">
	import { Archive } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		action: () => void;
	};

	let { action }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		if (event.shiftKey && event.key === 'A') {
			action();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>

<div class="tooltip tooltip-bottom z-30" data-tip="Archive">
	<button
		onclick={() => {
			action();
		}}
		class="btn btn-ghost flex items-center gap-x-2"><Archive size={18} /></button
	>
</div>
