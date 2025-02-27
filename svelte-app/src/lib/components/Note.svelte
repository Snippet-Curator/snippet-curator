<script lang="ts">
	import { ImageViewer } from 'svelte-image-viewer';
	import sanitizeHTML from 'sanitize-html';
	import { fade, scale } from 'svelte/transition';

	import { CircleX } from 'lucide-svelte';
	import type { Note } from '$lib/types';

	import { onMount } from 'svelte';
	import { categorizeMediabyType } from '$lib/utils';

	type Props = {
		note: Note;
	};

	let { note }: Props = $props();
	let content = $state(note.content);

	let isOpen = $state(false);
	let selectedImage = $state('');
	let textSize = $state(16);
	let container;

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

	let shadow;

	onMount(() => {
		content = categorizeMediabyType(content);
		shadow = container.attachShadow({ mode: 'open' });
		const cleanContent = sanitizeHTML(content, {
			allowedTags: sanitizeHTML.defaults.allowedTags.concat([
				'img',
				'form',
				'svg',
				'code',
				'style'
			]),
			// allowedTags: false,
			allowVulnerableTags: true,
			allowedAttributes: {
				'*': ['style', 'id', 'class', 'src']
			},
			allowedSchemes: ['data', 'http', 'https'],
			transformTags: {
				div: function (tagName, attribs) {
					let newStyle =
						'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;';
					attribs.style = attribs.style ? `${attribs.style};${newStyle}` : newStyle;
					return {
						tagName: 'div',
						attribs: attribs
					};
				},
				pre: sanitizeHTML.simpleTransform('pre', {
					style:
						'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
				}),
				p: sanitizeHTML.simpleTransform('p', {
					style:
						'background-color: var(--color-base-100) !important; background: var(--color-base-100) !important; color: var(--color-base-content) !important;'
				})
			}
		});
		// shadow.innerHTML = content;
		shadow.innerHTML = cleanContent;
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
		const style = document.createElement('style');
		style.textContent = `
		:host, :host * {
			font-size: ${textSize}px !important;
			line-height: 1.4;
		}`;
		shadow.appendChild(style);
	});
	$effect(() => {
		const style = document.createElement('style');
		style.textContent = `
		:host, :host * {
			font-size: ${textSize}px !important;
			line-height: 1.4;
		}`;
		shadow.appendChild(style);
	});
</script>

<!-- {#if note}
	<div class="card bg-base-100 min-w-4xl mx-auto mt-10 w-96 max-w-3xl">
		<div class="card-body">
			<h2 class="card-title">{note.title}</h2>
			<button class="prose select-text text-left">
				{@html content}
			</button>
		</div>
	</div>
{/if} -->
<div class="bg-base-100/90 sticky top-0 z-20 flex w-full px-8 py-4 backdrop-blur-2xl">
	<div class=" flex w-full">
		<h2 class="card-title grow">{note.title}</h2>
		<div
			class="text-base-content/20 hover:text-base-content flex gap-x-4 transition-colors duration-300"
		>
			<input type="range" class="range" min="14" max="30" bind:value={textSize} />
			<div class="w-40 text-nowrap">font {textSize}</div>
		</div>
	</div>
</div>

<div class="card mx-auto mt-10 max-w-3xl px-10 lg:max-w-5xl">
	<div class="card-body text-lg">
		<div bind:this={container}></div>
	</div>
</div>

{#if isOpen}
	<div
		class="bg-base-100 fixed left-0 top-0 z-30 flex h-screen w-screen items-center justify-center"
		transition:fade={{ duration: 100 }}
	>
		<button class="right-15 absolute top-10 z-30 hover:cursor-pointer" onclick={closeModal}>
			<CircleX size={42} class="stroke-base-content fill-base-100 drop-shadow-lg" />
		</button>
		<button onclick={(event) => event.stopPropagation()} in:scale={{ start: 0.8, duration: 200 }}>
			<ImageViewer src={selectedImage} />
		</button>
	</div>
{/if}
<div class="pb-20"></div>
