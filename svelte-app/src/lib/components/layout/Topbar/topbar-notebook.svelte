<script lang="ts">
	import { Notebook as NotebookIcon } from 'lucide-svelte';

	import type { Notebook } from '$lib/types';

	type Props = {
		notebook: Notebook;
		isOpen: boolean;
	};

	let { notebook, isOpen = $bindable() }: Props = $props();
</script>

<div class="tooltip tooltip-bottom z-30" data-tip="Change Notebook">
	<button onclick={() => (isOpen = true)} class="btn btn-ghost flex items-center gap-x-2"
		><NotebookIcon size={18} />{notebook.name}</button
	>
</div>
