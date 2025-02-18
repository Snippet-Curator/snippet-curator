<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	import { Dock } from '$lib/components';
	import { Import, Notebook, Settings, Tags, WalletCards } from 'lucide-svelte';

	let { children, data } = $props();
	let notebooks = $derived(data.notebooks);
	let tags = $derived(data.tags);
	let notes = $derived(data.notes);
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

		<ul class="menu bg-base-200 min-h-full w-64 space-y-2 p-4">
			<li>
				<a class={page.url.hash == '#/discover' ? 'menu-active' : ''} href="#/discover">Discover</a>
			</li>
			<li>
				<a class={page.url.hash == '#/' ? 'menu-active' : ''} href="#/">Notes</a>
			</li>

			<div class="divider"></div>

			<span class="menu-title flex items-center gap-2"><Notebook size={18} />Notebooks</span>

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
