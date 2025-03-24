<script lang="ts">
	import { Notebook as NotebookIcon, Pencil } from 'lucide-svelte';
	import type { Notebook } from '$lib/types';
	import NotebookList from './NotebookList.svelte';
	import { page } from '$app/state';

	type Props = {
		notebooks: Notebook[];
		allowEdit: boolean;
	};

	let { notebooks, allowEdit = false }: Props = $props();
</script>

{#each notebooks as notebook}
	<li class="group flex pr-2">
		{#if notebook.children.length > 0}
			<details class="w-full">
				<summary class="flex justify-between py-1">
					<a
						href="#/notebook/{notebook.id}"
						class="{page.url.hash == `#/notebook/${notebook.id}`
							? 'bg-neutral'
							: ''} hover:bg-neutral flex w-full items-center gap-x-2 rounded-lg px-2 py-1 opacity-100 transition-colors"
						><NotebookIcon size={18} />{notebook.name}</a
					>
					<div class="grow"></div>
					{#if allowEdit}
						<button class="btn btn-ghost invisible group-hover:visible">
							<Pencil size={18} />
						</button>
					{/if}
				</summary>
				<ul>
					<li>
						{#if notebook.children}
							<NotebookList {allowEdit} notebooks={notebook.children} />
						{/if}
					</li>
				</ul>
			</details>
		{:else}
			<div class="{page.url.hash == `#/notebook/${notebook.id}` ? 'bg-neutral' : ''} flex">
				<a
					href="#/notebook/{notebook.id}"
					class=" mx-2 flex w-full items-center gap-x-2 truncate rounded-lg transition-colors"
					><NotebookIcon size={18} />{notebook.name}</a
				>
				{#if allowEdit}
					<button class="btn btn-ghost invisible group-hover:visible">
						<Pencil size={18} />
					</button>
				{/if}
			</div>
		{/if}
	</li>
{/each}
