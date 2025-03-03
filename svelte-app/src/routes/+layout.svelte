<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';

	import pb from '$lib/db';

	import { Dock } from '$lib/components';
	import { Import, Notebook, Settings, Tags, WalletCards } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';

	let { children } = $props();
	let notebooks = $state();
	let tags = $state();

	pb.realtime.subscribe('tags', async function (event) {
		tags = await pb.collection('tags').getFullList({
			sort: 'name'
		});
	});
	pb.realtime.subscribe('notebooks', async function (event) {
		notebooks = await pb.collection('notebooks').getFullList({
			sort: 'name'
		});
	});

	onMount(async () => {
		notebooks = await pb.collection('notebooks').getFullList({
			sort: 'name'
		});
		tags = await pb.collection('tags').getFullList({
			sort: 'name'
		});
	});
	onDestroy(() => {
		pb.realtime.unsubscribe('notebooks');
		pb.realtime.unsubscribe('tags');
	});
</script>

<div class="drawer lg:drawer-open font-display">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<div>
			{@render children()}
		</div>
	</div>
	<div class="drawer-side border-base-300 border-r">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>

		<ul class="menu bg-base-200 h-screen w-64 space-y-2 p-4">
			<li>
				<a class={page.url.hash == '#/discover' ? 'menu-active' : ''} href="#/discover">Discover</a>
			</li>
			<li>
				<a class={page.url.hash == '#/' ? 'menu-active' : ''} href="#/">Notes</a>
			</li>

			<div class="divider"></div>

			<ScrollArea class="h-[calc(80%-200px)]">
				<span class="menu-title flex max-h-60 items-center gap-2 overflow-y-auto"
					><Notebook size={18} />Notebooks</span
				>

				{#each notebooks as notebook}
					<li>
						<a
							class={page.url.hash == `#/notebook/${notebook.id}` ? 'menu-active' : ''}
							href="#/notebook/{notebook.id}">{notebook.name}</a
						>
					</li>
				{/each}

				<div class="divider"></div>
				<span class="menu-title flex items-center gap-2"><Tags size={18} /> Tags</span>

				{#each tags as tag}
					<li><a href="#/tags/{tag.id}">{tag.name}</a></li>
				{/each}
			</ScrollArea>

			<div class="grow"></div>

			<li>
				<a class={page.url.hash == '#/organize' ? 'menu-active' : ''} href="#/organize"
					><WalletCards size={18} />Organize</a
				>
			</li>

			<li>
				<a class={page.url.hash == '#/import' ? 'menu-active' : ''} href="#/import"
					><Import size={18} />Import</a
				>
			</li>

			<li>
				<a class={page.url.hash == '#/settings' ? 'menu-active' : ''} href="#/settings"
					><Settings size={18} />Settings</a
				>
			</li>
		</ul>
	</div>
</div>

<Dock />

<ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
	Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the
	place: under the king's pillow, in his soup, even in the royal toilet. The king was furious, but
	he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered that
	the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started
	laughing, they couldn't stop.
</ScrollArea>
