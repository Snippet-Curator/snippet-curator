<script lang="ts">
	let { children } = $props();
</script>

<div
	class="bg-base-100/95 border-t-base-200 animate-in fade-in-0 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div
		class="animate-in zoom-in-95 zoom-out-95 fade-out-0 gap-golden-md flex flex-col items-center md:flex-row"
	>
		{@render children()}
	</div>
</div>
