<script>
	import { goto } from '$app/navigation';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<div class="menu bg-base-200 border-base-200 w-full border-b px-4 py-2">
	<div>
		<button
			class="btn btn-ghost group items-center pl-2.5 transition-all"
			onclick={() => goto('#/')}
		>
			<ArrowLeft
				size={18}
				class="-mr-6 opacity-0 transition-all group-hover:mr-[2px] group-hover:opacity-100"
			/>

			<div>Back to Notes</div>
		</button>
	</div>
</div>
