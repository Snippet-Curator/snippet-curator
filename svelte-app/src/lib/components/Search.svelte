<script lang="ts">
	import { CircleX } from 'lucide-svelte';

	type Props = {
		searchInput: string;
		getNotesByPage: () => void;
	};

	let { searchInput = $bindable(), getNotesByPage }: Props = $props();
</script>

<div class="border-base-300 bg-base-200 relative w-full border-b px-2 py-2">
	<input
		type="text"
		oninput={getNotesByPage}
		bind:value={searchInput}
		placeholder="Search..."
		class="input w-full pr-10"
	/>
	{#if searchInput && searchInput.trim() != ''}
		<button
			class="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer"
			onclick={() => {
				searchInput = '';
				getNotesByPage();
			}}
		>
			<CircleX size={18} />
		</button>
	{/if}
</div>
