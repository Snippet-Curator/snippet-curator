<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
</script>

<button
	class="btn btn-outline hover:btn-primary border-base-300 group flex pl-4 transition-all"
	onclick={() => window.history.back()}
>
	<ArrowLeft
		size={18}
		class="text-primary-content -mr-6 opacity-0 transition-all group-hover:mr-[2px] group-hover:opacity-100"
	/>

	<div>Back</div>
</button>
