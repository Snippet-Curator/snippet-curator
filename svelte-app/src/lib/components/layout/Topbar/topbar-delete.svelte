<script lang="ts">
	import { Trash2 } from 'lucide-svelte';

	type Props = {
		isOpen: boolean;
	};

	let { isOpen = $bindable() }: Props = $props();
</script>

<button onclick={() => (isOpen = true)} class="btn btn-ghost"><Trash2 size={18} /></button>
