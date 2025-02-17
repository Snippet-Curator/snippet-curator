<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { note } = $props();

	let isOpen = $state(false);
	let selectedImage = $state('');

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.tagName === 'IMG') {
			const img = target as HTMLImageElement;
			selectedImage = img.src;
			isOpen = true;
			console.log('clicked');
		}
	}

	function closeModal() {
		isOpen = false;
	}
</script>

{#if note}
	<div class="card card-border bg-base-100 min-w-2xl mx-auto mt-10 w-96 max-w-3xl">
		<div class="card-body">
			<h2 class="card-title">{note.title}</h2>
			<div class="prose" onclick={handleClick}>
				{@html note.content}
			</div>
			<div class="card-actions justify-end">
				<button class="btn btn-neutral">Buy Now</button>
			</div>
		</div>
	</div>
{/if}

{#if isOpen}
	<div
		class="bg-base-100 fixed left-0 top-0 flex h-screen w-screen items-center justify-center"
		onclick={closeModal}
		transition:fade={{ duration: 100 }}
	>
		<img
			src={selectedImage}
			transition:scale={{ start: 0.8, duration: 200 }}
			class="max-h-[90%] max-w-[90%]"
		/>
	</div>
{/if}
