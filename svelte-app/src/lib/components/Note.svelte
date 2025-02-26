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

	onMount(() => {
		content = categorizeMediabyType(content);
		const shadow = container.attachShadow({ mode: 'open' });
		const cleanContent = sanitizeHTML(
			content,
			{
				// allowedTags: sanitizeHTML.defaults.allowedTags.concat([
				// 	'img',
				// 	'a',
				// 	'body',
				// 	'form',
				// 	'ul',
				// 	'li',
				// 	'svg'
				// ]),
				allowedTags: false,
				disallowedtags: [],
				allowedAttributes: {
					'*': ['style', 'id', 'class', 'src']
				},
				// allowedAttributes: false,
				allowedSchemes: ['data', 'http', 'https'],
				allowedStyles: {
					p: {
						color: {}
					}
				},
				transformTags: {
					div: sanitizeHTML.simpleTransform('div', {
						style:
							'background-color: var(--color-base-100); background: var(--color-base-100); color: var(--color-base-content);'
					})
				}
			}
			// allowedStyles: {
			// 	'*': {
			// 		// color: [/^#/, /^rgb/, /^hsl/], // Allow only color styles
			// 		'font-size': [/^\d+(px|em|rem|%)$/], // Allow limited font sizes
			// 		'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/], // Allow text alignment,
			// 		'font-weight': [/^bold$/, /^normal$/, /^[1-9]00$/], // Allow boldness
			// 		'font-style': [/^italic$/, /^normal$/], // Allow italic
			// 		display: [/^flex$/, /^block$/, /^inline$/, /^inline-block$/, /^grid$/, /^none$/], // Allow flex and layout styles
			// 		'justify-content': [
			// 			/^flex-start$/,
			// 			/^flex-end$/,
			// 			/^center$/,
			// 			/^space-between$/,
			// 			/^space-around$/,
			// 			/^space-evenly$/
			// 		], // Allow flex alignment
			// 		'align-items': [/^stretch$/, /^flex-start$/, /^flex-end$/, /^center$/, /^baseline$/], // Allow flex alignment
			// 		'flex-direction': [/^row$/, /^row-reverse$/, /^column$/, /^column-reverse$/], // Allow flex directions
			// 		'flex-wrap': [/^nowrap$/, /^wrap$/, /^wrap-reverse$/], // Allow flex wrapping
			// 		gap: [/^\d+(px|em|rem|%)$/] // Allow gaps
			// 	},
			// 	div: {
			// 		'background-color': []
			// 	}
			// }
		);
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
			console.log(link);
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
			font-size: 16px !important;
			line-height: 1.4;
		}
	
 
			`;
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

<div class="card bg-base-100 mx-auto mt-10 max-w-3xl px-10">
	<h2 class="card-title">{note.title}</h2>
	<div class="card-body text-lg" bind:this={container}></div>
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
