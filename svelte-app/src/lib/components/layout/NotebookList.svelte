<script lang="ts">
	import type { Notebook as NotebookType } from '$lib/types';
	import { Notebook } from '$lib/components/';
	import NotebookList from './NotebookList.svelte';

	type Props = {
		notebooks: NotebookType[];
		allowEdit?: boolean;
	};

	let { notebooks, allowEdit = false }: Props = $props();
</script>

<svelte:boundary>
	{#each notebooks as notebook}
		{#if notebook.name != 'Inbox'}
			<li class="group mr-4">
				{#if notebook.children && notebook.children?.length > 0}
					<details class="w-full">
						<summary class="flex w-full py-0 pl-0">
							<div class="grow">
								<Notebook {notebook} />
							</div>
						</summary>

						{#if notebook.children}
							<ul>
								<NotebookList {allowEdit} notebooks={notebook.children} />
							</ul>
						{/if}
					</details>
				{:else}
					<Notebook {notebook} />
				{/if}
			</li>
		{/if}
	{/each}

	{#snippet failed()}
		NotebookList Failed to Render
	{/snippet}
</svelte:boundary>
