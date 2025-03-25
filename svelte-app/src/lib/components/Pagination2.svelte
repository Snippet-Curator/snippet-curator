<script lang="ts">
	let { noteState, currentID } = $props();

	const maxVisiblePages = 5;
	let pages = $state(getPages());

	function getPages() {
		console.log(noteState.notes?.page, noteState.notes?.totalPages);
		let start = Math.max(1, noteState.notes?.page - Math.floor(maxVisiblePages / 2));
		const end = Math.min(noteState.notes?.totalPages, start + maxVisiblePages - 1);

		if (end - start < maxVisiblePages - 1) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	async function handleClick(page: number) {
		noteState.clickedPage = page;
		await noteState.getByNotebook(currentID);
		pages = getPages();
		console.log('current pages', pages);
		console.log('current page', page);
		console.log('clicked page', noteState.clickedPage);
	}

	// $effect(() => (pages = getPages()));
</script>

clickedPage: {noteState.clickedPage}

<div
	class="join bg-base-100/95 sticky top-0 z-20 flex w-full items-center justify-center pb-5 pt-5 backdrop-blur-2xl"
>
	<button disabled={noteState.clickedPage == 1} onclick={() => handleClick(1)} class="btn join-item"
		>First</button
	>
	<button
		onclick={() => handleClick(noteState.clickedPage - 1)}
		disabled={noteState.clickedPage == 1}
		class="btn join-item">Previous</button
	>
	{#each pages as page}
		<button
			disabled={noteState.clickedPage == page}
			onclick={() => handleClick(page)}
			class="join-item btn">{page}</button
		>
	{/each}
	<button
		onclick={() => handleClick(noteState.clickedPage + 1)}
		disabled={noteState.clickedPage == noteState.notes?.totalPages}
		class="btn join-item">Next</button
	>
	<button
		disabled={noteState.clickedPage == noteState.notes?.totalPages}
		onclick={() => handleClick(noteState.notes?.totalPages)}
		class="btn join-item">Last</button
	>
</div>
