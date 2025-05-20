<script lang="ts">
	import { ImageViewer } from 'svelte-image-viewer';
	import sanitizeHTML from 'sanitize-html';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';

	import { fade, scale } from 'svelte/transition';

	import { CaseSensitive, CircleX } from 'lucide-svelte';
	import type { Note } from '$lib/types';

	import { onMount } from 'svelte';
	import { tryCatch } from '$lib/utils.svelte';
	import pb, { replacePbUrl } from '$lib/db.svelte';

	type Props = {
		note: Note;
	};

	let { note }: Props = $props();
	let content = $derived.by(() => replacePbUrl(note.content));
	let iframe = $state();
	let doc = $state();
	let fontScale = $state(1);

	let isOpen = $state(false);
	let isEditHTML = $state(false);
	let selectedImage = $state('');

	function closeModal() {
		isOpen = false;
	}

	function onImageClick(src: string) {
		selectedImage = src;
		isOpen = true;
	}

	const customStyles = $state(`
	  :root {
			--color-base-100: oklch(100% 0 0);
			--color-base-content: oklch(27.807% 0.029 256.847);
		}
		@media (prefers-color-scheme: dark) {
		  :root {
				--color-base-100: oklch(25.33% 0.016 252.42);
				--color-base-content: oklch(97.807% 0.029 256.847); 
		 }
	  }
		html, body {
			margin: 0 !important;
			height: 100% !important;
		}
		* {
			font-size: calc(1em * var(--fontScale, 1)) !important;
			line-height: 1.4 !important;
	   }
		html, body, main, section, p, pre, div {
			background-color: var(--color-base-100) !important;
			background: var(--color-base-100) !important; 
			color: var(--color-base-content) !important;
			// transition: font-size 0.05s ease !important;
		}
		img {
			max-width: 100% !important;
			height: auto !important;
		}
		.img-wrapper {
			display: flex;
			justify-content: center;
			margin-bottom: 1rem;
		}
		video {
			max-height: 800px; !important;
		}
		`);

	async function saveHTML(newHTML: HTMLElement) {
		const { data, error } = await tryCatch(
			pb.collection('notes').update(note.id, {
				content: newHTML
			})
		);
		if (error) {
			console.error('Error updating note: ', note.title, error.message);
		}
		return data;
	}

	function manipulateIframe(doc) {
		// click link opens browser
		const links = doc.querySelectorAll('a');
		links.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault(); // Prevent default navigation
				window.open(link.href);
			});
		});
		// remove image links
		const imgLinks = doc.querySelectorAll('a img');
		imgLinks.forEach((img) => {
			const link = img.parentElement;
			link.parentNode.insertBefore(img, link);
			link.parentNode.removeChild(link);
		});
		// add image viewing clicks
		const images = doc.querySelectorAll('img');
		images.forEach((img) => {
			img.addEventListener('click', () => {
				onImageClick(img.src);
			});
		});
	}

	onMount(() => {
		doc = iframe.contentDocument;
		const styleTag = doc.createElement('style');
		styleTag.textContent = customStyles;
		doc.head.appendChild(styleTag);

		iframe.onload = () => {
			requestAnimationFrame(() => {
				const height = doc.body.scrollHeight;
				iframe.style.height = `${height + 100}px`;
			});
		};
	});

	$effect(() => {
		const doc = iframe.contentDocument || iframe.contentWindow.document;
		doc.open();
		doc.write(content);
		doc.close();

		doc.documentElement.style.setProperty('--fontScale', fontScale);

		manipulateIframe(doc);
		const styleTag = doc.createElement('style');
		styleTag.textContent = customStyles;
		doc.head.appendChild(styleTag);

		iframe.onload = () => {
			const doc = iframe.contentDocument;

			doc.documentElement.style.setProperty('--fontScale', fontScale);

			iframe.style.height = '0px';

			requestAnimationFrame(() => {
				const doc = iframe.contentDocument;
				const height = doc.body.scrollHeight;
				iframe.style.height = `${height + 100}px`;
			});
		};

		doc.addEventListener('keydown', (event) => {
			document.dispatchEvent(new KeyboardEvent(event.type, event));
		});
	});
</script>

<div class="bg-base-100/90 p-golden-sm md:p-golden-md z-20 flex w-full px-4 md:sticky md:top-0">
	<div class="flex w-full">
		<h2 class="card-title grow truncate">{note.title}</h2>
		<div
			class="text-base-content/20 hover:text-base-content hidden items-center gap-x-4 transition-colors duration-300 md:flex"
		>
			<input
				type="range"
				class="range range-xs"
				min="0.98"
				max="1.2"
				step="0.01"
				bind:value={fontScale}
				oninput={() => {
					const doc = iframe.contentDocument;
					doc?.documentElement.style.setProperty('--fontScale', fontScale);
				}}
			/>
			<CaseSensitive size={32} />
		</div>
	</div>
</div>

<ScrollArea scrollHideDelay={200} type="scroll" class="mb-20 h-full">
	<div class="card mx-2 mt-10 max-w-3xl md:px-10 lg:max-w-5xl">
		<!-- <div class="card-body z-0">
			<div class="relative" bind:this={container}></div>
		</div> -->

		<iframe
			title="content"
			class="{isEditHTML
				? 'border-base-content rounded-md border'
				: 'border-none'} bg-base-100 mb-10"
			scrolling="no"
			bind:this={iframe}
		></iframe>

		<div class="mb-20 flex justify-end gap-x-2">
			{#if isEditHTML}
				<button
					class="btn"
					onclick={() => {
						const doc = iframe.contentDocument;
						doc.body.contentEditable = 'false';
						isEditHTML = false;
					}}>Cancel</button
				>
				<button
					class="btn btn-primary"
					onclick={async () => {
						const doc = iframe.contentDocument;
						doc.body.contentEditable = 'false';
						content = await saveHTML(doc.documentElement.outerHTML);
						isEditHTML = false;
					}}>Save</button
				>
			{:else}
				<button
					onclick={() => {
						const doc = iframe.contentDocument;
						doc.body.contentEditable = 'true';
						isEditHTML = true;
					}}
					class="btn">Edit</button
				>
			{/if}
		</div>
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
