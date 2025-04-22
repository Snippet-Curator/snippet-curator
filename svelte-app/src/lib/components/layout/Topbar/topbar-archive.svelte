<script lang="ts">
	import { Archive } from 'lucide-svelte';

	type Props = {
		action: () => void;
	};

	let { action }: Props = $props();
</script>

<div class="tooltip tooltip-bottom z-30" data-tip="Archive Note">
	<button
		onclick={() => {
			action();
		}}
		class="btn btn-ghost flex items-center gap-x-2"><Archive size={18} /></button
	>
</div>
