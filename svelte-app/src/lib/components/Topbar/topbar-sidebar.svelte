<script lang="ts">
	import { PanelLeft } from 'lucide-svelte';

	type Props = {
		action: () => void;
	};

	let { action }: Props = $props();
</script>

<button
	onclick={() => {
		action();
	}}
	class="btn btn-ghost flex items-center gap-x-2"><PanelLeft size={18} /></button
>
