<script lang="ts">
	import { Tag as TagIcon } from 'lucide-svelte';

	type Props = {
		isOpen: boolean;
	};

	let { isOpen = $bindable() }: Props = $props();
</script>

<div class="tooltip tooltip-bottom z-30" data-tip="Edit Tags">
	<button onclick={() => (isOpen = true)} class="btn btn-ghost flex items-center gap-x-2"
		><TagIcon size={18} /></button
	>
</div>
