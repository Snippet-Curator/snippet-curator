<script lang="ts">
	let { note } = $props();
</script>

{#if note}
	<div class="card card-border bg-base-100 min-w-2xl mx-auto mt-10 w-96 max-w-3xl">
		<div class="card-body">
			<h2 class="card-title">{note.title}</h2>
			{@html note.content}
			<div class="card-actions justify-end">
				<button class="btn btn-neutral">Buy Now</button>
			</div>
		</div>
	</div>
{/if}
