<script lang="ts">
	import { pushState } from '$app/navigation';

	let { currentPage, totalPages, clickedPage = $bindable(), changePage, url } = $props();
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

	function handleClick(page: number) {
		clickedPage = page;
		pushState('', {
			url: url,
			previousHistoryPage: clickedPage
		});
		changePage();
	}

	$effect(() => (pages = getPages()));
</script>

<div class="join">
	<button disabled={clickedPage == 1} onclick={() => handleClick(1)} class="btn join-item"
		>First</button
	>
	<button
		onclick={() => handleClick(clickedPage - 1)}
		disabled={clickedPage == 1}
		class="btn join-item">Previous</button
	>
	{#each pages as page}
		<button disabled={clickedPage == page} onclick={() => handleClick(page)} class="join-item btn"
			>{page}</button
		>
	{/each}
	<button
		onclick={() => handleClick(clickedPage + 1)}
		disabled={clickedPage == totalPages}
		class="btn join-item">Next</button
	>
	<button
		disabled={clickedPage == totalPages}
		onclick={() => handleClick(totalPages)}
		class="btn join-item">Last</button
	>
</div>
