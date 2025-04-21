<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
</script>

<button
	class="btn btn-outline hover:btn-primary border-base-300 group flex pl-4 transition-colors duration-300"
	onclick={() => window.history.back()}
>
	<ArrowLeft size={18} class="text-primary-content" />

	<div>Back</div>
</button>
