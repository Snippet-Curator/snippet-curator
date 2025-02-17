<script lang="ts">
	import { CircleX } from 'lucide-svelte';
	import { ImageViewer } from 'svelte-image-viewer';
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
		}
	}

	function closeModal() {
		isOpen = false;
	}
</script>

<div class="pt-20"></div>
{#if note}
	<div class="card bg-base-100 min-w-4xl mx-auto mt-10 w-96 max-w-3xl">
		<div class="card-body">
			<h2 class="card-title">{note.title}</h2>
			<button class="prose" onclick={handleClick}>
				{@html note.content}
			</button>
			<div class="card-actions justify-end">
				<button class="btn btn-neutral">Buy Now</button>
			</div>
		</div>
	</div>
{/if}

{#if isOpen}
	<div
		class="bg-base-100 fixed left-0 top-0 z-30 flex h-screen w-screen items-center justify-center"
		transition:fade={{ duration: 100 }}
	>
		<button class="right-15 absolute top-10 z-30 hover:cursor-pointer" onclick={closeModal}>
			<CircleX size={42} />
		</button>
		<button onclick={(event) => event.stopPropagation()} in:scale={{ start: 0.8, duration: 200 }}>
			<ImageViewer src={selectedImage} />
		</button>
	</div>
{/if}
<div class="pb-20"></div>
