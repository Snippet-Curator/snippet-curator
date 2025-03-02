<script lang="ts">
	import { pushState } from '$app/navigation';

	type Props = {
		currentPage: number;
		totalPages: number;
		clickedPage: number;
		changePage: () => void;
		url: string;
		pageType: 'notes' | 'tags' | 'notebooks';
		currentID;
	};

	let {
		currentPage = 1,
		totalPages = 1,
		clickedPage = $bindable(),
		changePage,
		pageType,
		currentID
	}: Props = $props();

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
		let currentTagID;
		let currentNotebookID;

		if (pageType == 'notes') {
			pushState('', {
				pageType: pageType,
				previousHistoryPage: page
			});
		} else if (pageType == 'tags') {
			currentTagID = currentID;
			pushState('', {
				pageType: pageType,
				currentTagID: currentTagID,
				previousHistoryPage: page
			});
		} else if (pageType == 'notebooks') {
			currentNotebookID = currentID;
			pushState('', {
				pageType: pageType,
				currentNotebookID: currentNotebookID,
				previousHistoryPage: page
			});
		}
		changePage();
	}

	$effect(() => (pages = getPages()));
</script>

<div
	class="join bg-base-100/95 sticky top-0 z-20 flex w-full items-center justify-center pb-5 pt-5 backdrop-blur-2xl"
>
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
