<script lang="ts">
	import { ImageViewer } from 'svelte-image-viewer';
	import sanitizeHTML from 'sanitize-html';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';

	import { fade, scale } from 'svelte/transition';

	import { CaseSensitive, CircleX } from 'lucide-svelte';
	import type { Note } from '$lib/types';

	import { onMount } from 'svelte';

	type Props = {
		note: Note;
	};

	let { note }: Props = $props();
	let content = $state(note.content);
	let container;

	let isOpen = $state(false);
	let isEditHTML = $state(false);
	let selectedImage = $state('');
	let textSize = $state(16);

	// function handleClick(event: MouseEvent) {
	// 	console.log('click');
	// 	console.log(event.target);
	// 	const target = event.target as HTMLElement;
	// 	if (target.tagName === 'IMG') {
	// 		const img = target as HTMLImageElement;
	// 		selectedImage = img.src;
	// 		isOpen = true;
	// 	}
	// }

	function closeModal() {
		isOpen = false;
	}

	function onImageClick(src: string) {
		selectedImage = src;
		isOpen = true;
	}

	function changeTextSize(event: Event) {
		const target = event.target as HTMLInputElement;
		let newTextSize = Number(target.value);
		// style.textContent = `
		// :host, :host * {
		// 	font-size: ${newTextSize}px !important;
		// 	line-height: 1.4;
		// 	transition: font-size 0.3s ease;
		// }
		// 	p, pre, div {
		// background-color: var(--color-base-100) !important;
		// background: var(--color-base-100) !important;
		// color: var(--color-base-content) !important;
		// }
		// img {
		// 	max-width: 100% !important;
		// 	height: auto !important;
		// }
		// `;
	}

	let shadow;
	let style = document.createElement('style');

	function changeContent() {
		shadow.innerHTML = content;
		manipulateContent(shadow);
	}

	function manipulateContent(shadow) {
		// click link opens browser
		const links = shadow.querySelectorAll('a');
		links.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault(); // Prevent default navigation
				window.open(link.href);
			});
		});
		// remove image links
		const imgLinks = shadow.querySelectorAll('a img');
		imgLinks.forEach((img) => {
			const link = img.parentElement;
			link.parentNode.insertBefore(img, link);
			link.parentNode.removeChild(link);
		});
		// add image viewing clicks
		const images = shadow.querySelectorAll('img');
		images.forEach((img) => {
			img.addEventListener('click', () => {
				onImageClick(img.src);
			});
		});
	}

	onMount(() => {
		content = note.content;
	});

	$effect(() => {
		if (!container.shadowRoot) {
			shadow = container.attachShadow({ mode: 'open' });
		} else {
			shadow = container.shadowRoot;
		}

		shadow.innerHTML = content;
		manipulateContent(shadow);
		style.textContent = `
		:host, :host * {
			font-size: ${textSize}px !important;
			line-height: 1.4;
		}
		p, pre, div {
		background-color: var(--color-base-100) !important;
		background: var(--color-base-100) !important; 
		color: var(--color-base-content) !important;
		}
		img {
			max-width: 100% !important;
			height: auto !important;
		}
		`;
		shadow.appendChild(style);
	});
</script>

<div class="bg-base-100/90 sticky top-0 z-20 flex w-full px-8 py-4 backdrop-blur-2xl">
	<div class="flex w-full">
		<h2 class="card-title grow">{note.title}</h2>
		<div
			class="text-base-content/20 hover:text-base-content flex items-center gap-x-4 transition-colors duration-300"
		>
			<input
				type="range"
				class="range range-xs"
				min="14"
				max="30"
				bind:value={textSize}
				oninput={changeTextSize}
			/>
			<CaseSensitive size={32} />
		</div>
	</div>
</div>

<ScrollArea type="scroll" class="h-full pb-20">
	<div class="card mx-auto mt-10 max-w-3xl px-10 lg:max-w-5xl">
		<div class="card-body z-0">
			<div class="relative" bind:this={container}></div>
		</div>

		{#if isEditHTML}
			<button class="btn" onclick={() => (isEditHTML = false)}>Cancel</button>

			<textarea
				class="textarea h-100 mb-20 mt-10 w-full"
				contenteditable="true"
				oninput={changeContent}
				bind:value={content}
			></textarea>
		{:else}
			<button onclick={() => (isEditHTML = true)} class="btn mb-20">Edit HTML</button>
		{/if}
	</div>
</ScrollArea>

{#if isOpen}
	<div
		class="bg-base-100 fixed left-0 top-0 z-30 flex h-screen w-screen items-center justify-center"
		transition:fade={{ duration: 100 }}
	>
		<button class="right-15 absolute top-10 z-30 hover:cursor-pointer" onclick={closeModal}>
			<CircleX size={42} class="stroke-base-content fill-base-100  drop-shadow-lg " />
		</button>
		<button onclick={(event) => event.stopPropagation()} in:scale={{ start: 0.8, duration: 200 }}>
			<ImageViewer src={selectedImage} />
		</button>
	</div>
{/if}
<div class="pb-20"></div>
