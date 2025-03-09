<script lang="ts">
	type Props = {
		searchInput: string;
		getNotesByPage: () => void;
	};

	let { searchInput = $bindable(), getNotesByPage }: Props = $props();
</script>

<div class="border-base-300 bg-base-200 w-full border-b px-2 py-2">
	<input
		type="text"
		oninput={getNotesByPage}
		bind:value={searchInput}
		placeholder="Search..."
		class="input w-full"
	/>
</div>
