<script lang="ts">
	let { notelistState, currentID = '', changePage } = $props();

	let currentPage = $derived(notelistState.notes.page);
	let totalPages = $derived(notelistState.notes.totalPages);

	const maxVisiblePages = 5;
	let pages = $derived(getPages());

	function getPages() {
		let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end - start < maxVisiblePages - 1) {
			start = Math.max(1, end - maxVisiblePages + 1);
		}
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	async function handleClick(clickedPage: number) {
		// pages = getPages();

		notelistState.clickedPage = clickedPage;
		changePage();
		// if (currentID == 'homepage') {
		// 	console.log('home page change');
		// 	await notelistState.getByPage();
		// } else {
		// 	await notelistState.getByNotebook(currentID);
		// }
	}
</script>

<div
	class="join bg-base-100/95 sticky top-0 z-20 flex w-full items-center justify-center pb-5 pt-5 backdrop-blur-2xl"
>
	<button
		disabled={notelistState.clickedPage == 1}
		onclick={() => handleClick(1)}
		class="btn join-item">First</button
	>
	<button
		onclick={() => handleClick(notelistState.clickedPage - 1)}
		disabled={notelistState.clickedPage == 1}
		class="btn join-item">Previous</button
	>
	{#each pages as page}
		<button onclick={() => handleClick(page)} disabled={currentPage == page} class="join-item btn"
			>{page}</button
		>
	{/each}
	<button
		onclick={() => handleClick(notelistState.clickedPage + 1)}
		disabled={notelistState.clickedPage == notelistState.notes?.totalPages}
		class="btn join-item">Next</button
	>
	<button
		disabled={notelistState.clickedPage == notelistState.notes?.totalPages}
		onclick={() => handleClick(notelistState.notes?.totalPages)}
		class="btn join-item">Last</button
	>
</div>
