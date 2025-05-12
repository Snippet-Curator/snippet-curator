<script lang="ts">
	import { getSideBarState } from '$lib/utils.svelte';
	import { PanelLeft } from 'lucide-svelte';

	const sidebarState = getSideBarState();

	let { action }: Props = $props();
</script>

<button
	onclick={() => (sidebarState.isOpen = !sidebarState.isOpen)}
	class="btn btn-sm btn-square flex cursor-pointer items-center gap-x-2"
	><PanelLeft size={18} /></button
>
