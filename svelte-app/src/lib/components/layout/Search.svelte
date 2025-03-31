<script lang="ts">
	import { CircleX } from 'lucide-svelte';

	type Props = {
		searchInput: string;
	};

	let { searchInput = $bindable() }: Props = $props();
</script>

<div class="relative w-full px-2">
	<input type="text" bind:value={searchInput} placeholder="Search..." class="input w-full pr-10" />
	{#if searchInput && searchInput.trim() != ''}
		<button
			class="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer"
			onclick={() => {
				searchInput = '';
			}}
		>
			<CircleX size={18} />
		</button>
	{/if}
</div>
