<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	type KBD = {
		display: string;
		alternate?: string;
		description: string;
	};

	const ratings: KBD[] = [
		{
			display: 'h',
			alternate: '0',
			description: 'no star'
		},
		{
			display: 'j',
			alternate: '1',
			description: '1 star'
		},
		{
			display: 'k',
			alternate: '2',
			description: '2 stars'
		},
		{
			display: 'l',
			alternate: '3',
			description: '3 stars'
		},
		{
			display: ';',
			alternate: '4',
			description: '4 stars'
		},
		{
			display: "'",
			alternate: '5',
			description: '5 stars'
		}
	];
	const navigations: KBD[] = [
		{
			display: '←',
			alternate: 'a',
			description: 'Previous note'
		},
		{
			display: '→',
			alternate: 'd',
			description: 'Next note'
		},
		{
			display: '↑',
			alternate: 'w',
			description: 'See more'
		},
		{
			display: '↓',
			alternate: 's',
			description: 'See less'
		}
	];
	const edits: KBD[] = [
		{
			display: 'b',
			description: 'Bulk edit'
		},
		{
			display: 'n',
			description: 'Edit notebooks'
		},
		{
			display: 't',
			description: 'Edit tags'
		}
	];
</script>

{#snippet renderKBD(kbds: KBD[], title: string)}
	<div class="gap-golden-md flex flex-col">
		<span class="text-lg">{title}</span>
		{#each kbds as kbd}
			<div class="gap-golden-md flex items-center">
				<kbd class="kbd">{kbd.display}</kbd>
				{#if kbd.alternate}
					<kbd class="kbd">{kbd.alternate}</kbd>
				{/if}
				{kbd.description}
			</div>
		{/each}
	</div>
{/snippet}

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
