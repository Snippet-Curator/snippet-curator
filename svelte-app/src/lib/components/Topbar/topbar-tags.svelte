<script lang="ts">
	import { Tag as TagIcon } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		isOpen: boolean;
	};

	let { isOpen = $bindable() }: Props = $props();

	function handler(event: KeyboardEvent) {
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		switch (event.key) {
			case 't':
				event.preventDefault();
				isOpen = true;
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

<div class="tooltip tooltip-bottom z-30" data-tip="Edit Tags">
	<button onclick={() => (isOpen = true)} class="btn btn-ghost flex items-center gap-x-2"
		><TagIcon size={18} /></button
	>
</div>
