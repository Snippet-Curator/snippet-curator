<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	class={cn('scrollbar-thin max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
	{...restProps}
	bind:ref
/>
