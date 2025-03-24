<script lang="ts">
	import { Tag as TagIcon, Pencil } from 'lucide-svelte';
	import type { Tag } from '$lib/types';
	import TagList from './Taglist.svelte';
	import { page } from '$app/state';

	type Props = {
		tags: Tag[];
		allowEdit: boolean;
	};

	let { tags, allowEdit = false }: Props = $props();
</script>

{#each tags as tag}
	<li class="group">
		{#if tag.children.length > 0}
			<details class="w-full">
				<summary class="flex justify-between">
					<a
						href="#/tags/{tag.id}"
						class="{page.url.hash == `#/tags/${tag.id}`
							? 'badge-neutral'
							: ''} badge hover:badge-neutral badge-xl flex items-center gap-x-2 transition-colors"
						><TagIcon size={18} />{tag.name}</a
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
						{#if tag.children}
							<TagList {allowEdit} tags={tag.children} />
						{/if}
					</li>
				</ul>
			</details>
		{:else}
			<div class="flex justify-between">
				<a
					href="#/tags/{tag.id}"
					class="{page.url.hash == `#/tags/${tag.id}`
						? 'menu-active badge-neutral'
						: ''} badge hover:badge-neutral badge-xl ml-0 truncate transition-colors"
					><TagIcon size={18} />{tag.name}</a
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
