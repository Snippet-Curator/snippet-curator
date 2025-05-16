<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Topbar from '$lib/components/Topbar/index';

	type KBD = {
		displays: string[];
		description: string;
	};

	const ratings: KBD[] = [
		{
			displays: ['h', '0'],
			description: 'no star'
		},
		{
			displays: ['j', '1'],
			description: '1 star'
		},
		{
			displays: ['k', '2'],
			description: '2 stars'
		},
		{
			displays: ['l', '3'],
			description: '3 stars'
		},
		{
			displays: [';', '4'],
			description: '4 stars'
		},
		{
			displays: ["'", '5'],
			description: '5 stars'
		}
	];
	const navigations: KBD[] = [
		{
			displays: ['→', 'd', 'space'],
			description: 'Next note'
		},
		{
			displays: ['←', 'a'],
			description: 'Previous note'
		},
		{
			displays: ['↑', 'w'],
			description: 'See more'
		},
		{
			displays: ['↓', 's'],
			description: 'See less'
		}
	];
	const edits: KBD[] = [
		{
			displays: ['b'],
			description: 'Bulk edit'
		},
		{
			displays: ['n'],
			description: 'Edit notebooks'
		},
		{
			displays: ['t'],
			description: 'Edit tags'
		}
	];
</script>

{#snippet renderKBD(kbds: KBD[], title: string)}
	<div class="gap-golden-md flex flex-col">
		<span class="text-lg">{title}</span>
		{#each kbds as kbd}
			<div class="grid grid-cols-2">
				{kbd.description}
				<div class="gap-golden-md flex">
					{#each kbd.displays as display}
						<kbd class="kbd">{display}</kbd>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/snippet}

<Topbar.Root>
	<Topbar.SidebarIcon></Topbar.SidebarIcon>
	<Topbar.Back />
	<div class="grow"></div>
</Topbar.Root>

<ScrollArea class="h-[calc(100vh-60px)]">
	<div class="p-golden-xl mx-auto max-w-5xl">
		<div class="card">
			<div class="card-body">
				<div class="card-title text-xl">Keyboard Shortcuts</div>
				<div class="gap-golden-md grid md:grid-cols-3">
					{@render renderKBD(navigations, 'Discover Navigation')}
					{@render renderKBD(ratings, 'Note Rating')}
					{@render renderKBD(edits, 'Editing')}
				</div>
			</div>
		</div>
	</div>
</ScrollArea>
