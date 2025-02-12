<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { House, Notebook, NotebookText, Settings, WalletCards } from 'lucide-svelte';

	const pages = [
		{
			name: 'Discover',
			icon: House,
			url: '#/discover'
		},
		{
			name: 'Notes',
			icon: NotebookText,
			url: '#/'
		},
		{
			name: 'Organize',
			icon: WalletCards,
			url: '#/organize'
		},
		{
			name: 'Settings',
			icon: Settings,
			url: '#/settings'
		}
	];
</script>

{#snippet bar(item)}
	<button
		class={page.url.hash == item.url ? 'dock-active' : ''}
		onclick={() => goto(`${item.url}`)}
	>
		<svelte:component this={item.icon} size={22} class=" text-base-content/70" />
		<span class="dock-label">{item.name}</span>
	</button>
{/snippet}

<div class="dock lg:hidden">
	{#each pages as page}
		{@render bar(page)}
	{/each}
</div>
