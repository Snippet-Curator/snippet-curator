<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Import, Notebook as NotebookIcon, Settings, Tags, WalletCards } from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';

	import { getNotebookState, setNotebookState, getTagState, setTagState } from '$lib/db.svelte';

	import { Dock, NotebookList, TagList } from '$lib/components';

	let { children } = $props();
	setTagState();
	setNotebookState();
	const tagState = getTagState();
	const notebookState = getNotebookState();
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
				<a class={page.url.hash == '#/' || page.url.hash == '' ? 'menu-active' : ''} href="#/"
					>Notes</a
				>
			</li>

			<div class="divider"></div>

			<ScrollArea class="h-[calc(80%-200px)]">
				<span class="menu-title flex max-h-60 items-center gap-2 overflow-y-auto"
					><NotebookIcon size={18} />Notebooks</span
				>

				<NotebookList notebooks={notebookState.notebooks} />

				<div class="divider"></div>

				<span class="menu-title flex items-center gap-2"><Tags size={18} /> Tags</span>

				<TagList tags={tagState.tags} />
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

			<!-- <li>
				<a class={page.url.hash == '#/test' ? 'menu-active' : ''} href="#/test"
					><Settings size={18} />Test</a
				>
			</li> -->
		</ul>
	</div>
</div>

<Dock />
