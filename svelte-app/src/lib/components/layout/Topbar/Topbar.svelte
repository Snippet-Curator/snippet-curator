<script lang="ts">
	let { children } = $props();
</script>

<div class="menu bg-base-200 border-base-200 h-15 w-full border-b px-4">
	<div class="flex items-center gap-x-2">
		{@render children()}
	</div>
</div>
