<script lang="ts">
	import { ImageViewer } from 'svelte-image-viewer';
	import { fade, scale } from 'svelte/transition';

	import pb from '$lib/db';
	import { Topbar } from '$lib/components';

	import { CircleX } from 'lucide-svelte';
	import type { Note } from '$lib/types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { categorizeMediabyType } from '$lib/utils';

	type Props = {
		note: Note;
	};

	let { note }: Props = $props();
	let content = $state(note.content);

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

	async function deleteNote() {
		await pb.collection('notes').delete(note.id);
		console.log('delete');
		goto('#/');
	}

	onMount(() => {
		content = categorizeMediabyType(content);
	});
</script>

<Topbar {deleteNote} />
<div class="h-[calc(100vh-60px)] overflow-y-auto">
	{#if note}
		<div class="card bg-base-100 min-w-4xl mx-auto mt-10 w-96 max-w-3xl">
			<div class="card-body">
				<h2 class="card-title">{note.title}</h2>
				<button class="prose text-left" onclick={handleClick}>
					{@html content}
				</button>
			</div>
		</div>
	{/if}
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
