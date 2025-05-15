<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { children, class: className = '' } = $props();
</script>

<div class={cn('menu bg-base-200 border-base-200 md:h-15 w-full border-b md:px-4', className)}>
	<div class="flex items-center justify-around gap-x-2">
		{@render children()}
	</div>
</div>
