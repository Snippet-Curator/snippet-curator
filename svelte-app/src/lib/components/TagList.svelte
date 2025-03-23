<script lang="ts">
	import { Tag as TagIcon } from 'lucide-svelte';
	import type { Tag } from '$lib/types';
	import TagList from './Taglist.svelte';

	type Props = {
		tags: Tag[];
	};

	let { tags }: Props = $props();
</script>

{#each tags as tag}
	<li>
		{#if tag.children.length > 0}
			<details class="w-full">
				<summary>
					<a
						href=""
						class="badge hover:badge-neutral badge-xl flex items-center gap-x-2 transition-colors"
						><TagIcon size={18} />{tag.name}</a
					>
				</summary>
				<ul>
					<li>
						{#if tag.children}
							<TagList tags={tag.children} />
						{/if}
					</li>
				</ul>
			</details>
		{:else}
			<a href="" class="badge hover:badge-neutral badge-xl my-2 ml-3 transition-colors"
				><TagIcon size={18} />{tag.name}</a
			>
		{/if}
	</li>
{/each}
