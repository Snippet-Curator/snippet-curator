<script lang="ts">
	import { Tag as TagIcon, Pencil } from 'lucide-svelte';

	import * as ContextMenu from '$lib/components/ui/context-menu/index';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import type { Tag } from '$lib/types';
	import TagList from './Taglist.svelte';
	import { page } from '$app/state';
	import { Rename } from '$lib/components/';

	type Props = {
		tags: Tag[];
		allowEdit: boolean;
	};

	let { tags, allowEdit = false }: Props = $props();

	let isOpen = $state(false);
</script>

{#snippet renderTag(tag)}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="p-0">
			<a
				href="#/tags/{tag.id}"
				class="{page.url.hash == `#/tags/${tag.id}`
					? 'badge-neutral'
					: ''} badge hover:badge-neutral badge-xl mx-2 my-2 flex items-center gap-x-2 text-nowrap transition-colors"
				><TagIcon size={18} />{tag.name}</a
			>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onSelect={() => (isOpen = true)}>Rename</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
{/snippet}

{#each tags as tag}
	<li class="group">
		{#if tag.children.length > 0}
			<details class="w-full">
				<summary class="flex justify-between py-0 pl-0">
					{@render renderTag(tag)}
				</summary>

				{#if tag.children}
					<div class="pl-6">
						<TagList {allowEdit} tags={tag.children} />
					</div>
				{/if}
			</details>
		{:else}
			{@render renderTag(tag)}
		{/if}
	</li>
{/each}

{isOpen}
<Rename bind:isOpen>
	{#snippet name()}
		Rename Tag
	{/snippet}
</Rename>
