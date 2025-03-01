<script lang="ts">
	import { Modal } from '$lib/components';
	import { ArrowLeft, Info, Notebook, Pencil, Trash2 } from 'lucide-svelte';

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
	<div class="flex items-center gap-x-2">
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

		<div class="grow"></div>
		<div class="rating rating-xs">
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="1 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="2 star"
				checked="checked"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="3 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="4 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="5 star"
			/>
		</div>

		<span class="badge">#Tags</span>

		<button class="btn btn-ghost flex items-center gap-x-2"><Notebook size={18} />Notebook</button>

		<div class="divider divider-horizontal"></div>

		<div>
			<div class="dropdown dropdown-center">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div tabindex="0" class="btn btn-ghost"><Info size={18} /></div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div tabindex="0" class="dropdown-content bg-base-100 rounded-box w-70 px-4 py-2 shadow-sm">
					<ul class="list">
						<li class="list-row">Created: 2/28/2025</li>
						<li class="list-row">Modified: 2/28/2025</li>
						<li class="list-row items-center">Source:<a href="">https://google.com...</a></li>
					</ul>
				</div>
			</div>

			<button class="btn btn-ghost">
				<Pencil size={18} />
			</button>
			<button onclick={openModal} class="btn btn-ghost"><Trash2 size={18} /></button>
		</div>
	</div>
</div>

<Modal isOpen={isModalOpen} close={closeModal} action={deleteNote}
	>Are you sure you want to delete this note?</Modal
>
