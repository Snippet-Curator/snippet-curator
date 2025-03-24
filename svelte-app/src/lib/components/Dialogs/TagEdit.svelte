<script lang="ts">
	let { isOpen, close, action, children } = $props();
</script>

{#if isOpen}
	<div class="modal modal-open">
		<div class="modal-box">
			<h2 class="text-lg font-bold">Edit</h2>
			<div class="pt-4">
				{@render children()}
			</div>
			<div class="modal-action flex">
				<button class="btn btn-error">Delete</button>
				<div class="grow"></div>
				<button class="btn" onclick={close}>Close</button>
				<button class="btn btn-primary" onclick={action}>Save</button>
			</div>
		</div>
	</div>
{/if}
