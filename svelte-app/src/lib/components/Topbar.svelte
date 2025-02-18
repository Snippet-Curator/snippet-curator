<script lang="ts">
	import { Modal } from '$lib/components';
	import { ArrowLeft } from 'lucide-svelte';

	let { deleteNote } = $props();

	let isModalOpen = $state(false);
	function openModal() {
		isModalOpen = true;
	}
	function closeModal() {
		isModalOpen = false;
	}
</script>

<div class="menu bg-base-200 border-base-200 h-15 w-full border-b px-4">
	<div class="flex items-center">
		<button
			class="btn btn-ghost group items-center justify-center pl-2.5 transition-all"
			onclick={() => window.history.back()}
		>
			<ArrowLeft
				size={18}
				class="-mr-6 opacity-0 transition-all group-hover:mr-[2px] group-hover:opacity-100"
			/>

			<div>Back to Notes</div>
		</button>
		<div class="flex grow">
			<div class="grow"></div>
			<button onclick={openModal} class="btn btn-neutral">Delete Note</button>
		</div>
	</div>
</div>

<Modal isOpen={isModalOpen} close={closeModal} action={deleteNote}
	>Are you sure you want to delete this note?</Modal
>
