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
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				onLeft();
				break;
			case 'ArrowRight':
				event.preventDefault();
				onRight();
				break;
			case 'ArrowUp':
				event.preventDefault();
				onUp();
				break;
			case 'ArrowDown':
				event.preventDefault();
				onDown();
				break;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>
