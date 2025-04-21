<script lang="ts">
	import { CircleX, Search } from 'lucide-svelte';

	type Props = {
		searchInput: string;
	};

	let { searchInput = $bindable() }: Props = $props();
</script>

<div class="relative w-full px-2">
	<input
		type="text"
		bind:value={searchInput}
		placeholder="Search..."
		class="input relative w-full pl-10 pr-10"
	/>
	<div class="text-base-content/50 absolute inset-y-0 left-5 flex items-center">
		<Search size={18} />
	</div>
	{#if searchInput && searchInput.trim() != ''}
		<button
			class="absolute right-5 top-1/2 -translate-y-1/2 hover:cursor-pointer"
			onclick={() => {
				searchInput = '';
			}}
		>
			<CircleX size={18} />
		</button>
	{/if}
</div>
