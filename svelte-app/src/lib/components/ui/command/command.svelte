<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...restProps
	}: CommandPrimitive.RootProps = $props();
</script>

<CommandPrimitive.Root
	class={cn(
		'text-base-content bg-base-100 flex h-full w-full flex-col overflow-hidden rounded-md',
		className
	)}
	bind:value
	bind:ref
	{...restProps}
/>
