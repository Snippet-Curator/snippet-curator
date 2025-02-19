<script lang="ts">
	let { isOpen, close, action, children } = $props();
</script>

{#if isOpen}
	<div class="modal modal-open">
		<div class="modal-box">
			<h2 class="text-lg font-bold">Delete</h2>
			<div class="pt-4">
				{@render children()}
			</div>
			<div class="modal-action">
				<button class="btn" onclick={close}>Close</button>
				<button class="btn btn-error" onclick={action}>Delete</button>
			</div>
		</div>
	</div>
{/if}
