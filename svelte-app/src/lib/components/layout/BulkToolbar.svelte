<script lang="ts">
	import { Archive, Merge, Trash2 } from 'lucide-svelte';
</script>

<div
	class="bg-base-100/90 border-t-base-200 animate-in fade-in-0 absolute bottom-0 left-0 z-20 flex w-full items-center justify-center border-t py-6 backdrop-blur-2xl"
>
	<div
		class="animate-in zoom-in-95 zoom-out-95 fade-out-0 flex flex-row items-center gap-x-4 px-3 py-2"
	>
		<div>0 Note Selected</div>
		<button class="btn flex items-center gap-x-2"><Merge size={18} />Merge</button>
		<button class="btn flex items-center gap-x-2"><Archive size={18} />Archive</button>
		<button class="btn flex items-center gap-x-2"><Trash2 size={18} />Delete</button>
	</div>
</div>
