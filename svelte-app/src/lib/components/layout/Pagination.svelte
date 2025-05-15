<script lang="ts">
	import { getMobileState } from '$lib/utils.svelte';
	import { ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight } from 'lucide-svelte';

	let { notelistState, changePage } = $props();

	let currentPage = $derived(notelistState.notes.page);
	let totalPages = $derived(notelistState.notes.totalPages);

	const maxVisiblePages = 5;
	let pages = $derived(getPages());
	const mobileState = getMobileState();

	function getPages() {
		let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start < maxVisiblePages - 1) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	async function handleClick(clickedPage: number) {
		notelistState.clickedPage = clickedPage;
		changePage();
	}
</script>

<svelte:boundary>
	{#if pages.length > 1}
		<div
			class="join bg-base-100/95 sticky top-0 z-20 flex w-full items-center justify-center py-1 backdrop-blur-2xl md:py-3"
		>
			<button
				disabled={notelistState.clickedPage == 1}
				onclick={() => handleClick(1)}
				class="btn join-item"
			>
				{#if mobileState.isMobile}
					<ChevronsLeft size={18} />
				{:else}
					First
				{/if}
			</button>
			<button
				onclick={() => handleClick(notelistState.clickedPage - 1)}
				disabled={notelistState.clickedPage == 1}
				class="btn join-item"
			>
				{#if mobileState.isMobile}
					<ChevronLeft size={18} />
				{:else}
					Previous
				{/if}
			</button>
			{#each pages as page}
				<button
					onclick={() => handleClick(page)}
					disabled={currentPage == page}
					class="join-item btn">{page}</button
				>
			{/each}
			<button
				onclick={() => handleClick(notelistState.clickedPage + 1)}
				disabled={notelistState.clickedPage == notelistState.notes?.totalPages}
				class="btn join-item"
			>
				{#if mobileState.isMobile}
					<ChevronRight size={18} />
				{:else}
					Next
				{/if}
			</button>
			<button
				disabled={notelistState.clickedPage == notelistState.notes?.totalPages}
				onclick={() => handleClick(notelistState.notes?.totalPages)}
				class="btn join-item"
			>
				{#if mobileState.isMobile}
					<ChevronsRight size={18} />
				{:else}
					Last
				{/if}</button
			>
		</div>
	{/if}
	{#snippet failed()}
		Pagination Failed to Render
	{/snippet}
</svelte:boundary>
