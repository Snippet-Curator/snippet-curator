<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
</script>

<button
	class="btn btn-outline hover:btn-neutral border-base-300 flex items-center transition-colors duration-200"
	onclick={() => window.history.back()}
>
	<ArrowLeft size={15} />

	<div class="hidden md:block">Back</div>
</button>
