<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { Tag as TagIcon, Pin } from 'lucide-svelte';

	const tags = [
		{
			name: 'angie-varona',
			id: 'fdsfds'
		}
	];
</script>

{#each tags as tag}
	<div class=" flex w-full items-center justify-between">
		<a
			href="#/notebook/{tag.id}"
			class="{page.url.hash == `#/notebook/${tag.id}` && 'menu-active'} flex w-full justify-between"
		>
			{tag.name}
		</a>
		<Pin size={15} />
	</div>
{/each}
