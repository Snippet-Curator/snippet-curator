<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Tags } from 'lucide-svelte';

	type Props = {
		isOpen: boolean;
		selectedNotesID: string[];
	};

	let { isOpen = $bindable(), selectedNotesID }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		switch (event.key) {
			case 't':
				event.preventDefault();
				if (selectedNotesID.length > 0) {
					isOpen = true;
				}
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

<button
	onclick={() => {
		if (selectedNotesID.length > 0) {
			isOpen = true;
		}
	}}
	class="btn"><Tags size={18} class="text-base-content/60" />Tags</button
>
