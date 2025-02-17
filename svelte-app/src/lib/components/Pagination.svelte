<script lang="ts">
	let { currentPage, totalPages, clickedPage = $bindable(), changePage } = $props();
	const maxVisiblePages = 5;
	let pages = $state(getPages());

	function getPages() {
		let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start < maxVisiblePages - 1) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	$effect(() => (pages = getPages()));
</script>

<div class="join">
	{#each pages as page}
		<button
			disabled={clickedPage == page}
			onclick={() => {
				clickedPage = page;
				changePage();
			}}
			class="join-item btn">{page}</button
		>
	{/each}
</div>
