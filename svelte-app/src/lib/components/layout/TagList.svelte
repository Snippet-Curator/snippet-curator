<script lang="ts">
	import type { Tag as TagType } from '$lib/types';
	import { TagList, Tag } from '$lib/components/';
	import { getTagState } from '$lib/db.svelte';

	type Props = {
		tags: TagType[];
		allowEdit?: boolean;
	};

	let { tags, allowEdit = false }: Props = $props();

	const tagState = getTagState();
	const flatTags = $derived(tagState.flatTags);
</script>

<svelte:boundary>
	{#each tags as tag}
		<li class="group mr-4">
			{#if tag.children && tag.children?.length > 0}
				<details class="w-full cursor-pointer">
					<summary class="mr-4 flex w-full py-0 pl-0">
						<div class="grow">
							<Tag {tag} {tagState} {flatTags} />
						</div>
					</summary>

					{#if tag.children}
						<ul>
							<TagList {allowEdit} tags={tag.children} />
						</ul>
					{/if}
				</details>
			{:else}
				<Tag {tag} {tagState} {flatTags} />
			{/if}
		</li>
	{/each}

	{#snippet failed()}
		Tags Failed to Render
	{/snippet}
</svelte:boundary>
