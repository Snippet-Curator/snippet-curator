<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		onLeft: () => Promise<void>;
		onRight: () => Promise<void>;
		onUp: () => Promise<void>;
		onDown: () => Promise<void>;
	};

	let { onLeft, onRight, onUp, onDown }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.keyCode == 37) {
			event.preventDefault();
			onLeft();
		} else if (event.keyCode == 39 || event.keyCode == 32) {
			event.preventDefault();
			onRight();
		} else if (event.keyCode == 38) {
			event.preventDefault();
			onUp();
		} else if (event.keyCode == 40) {
			event.preventDefault();
			onDown();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>
