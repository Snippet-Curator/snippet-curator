<script lang="ts">
	import Dock from '$lib/components/Dock.svelte';
	import { CloudUpload, Menu, Notebook, Pencil, Settings, Tags } from 'lucide-svelte';
	import '../app.css';
	let { children, data } = $props();
	let notebooks = $derived(data.notebooks);
	let tags = $derived(data.tags);
</script>

<div class="drawer lg:drawer-open font-display">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		{@render children()}
	</div>
	<div class="drawer-side border-base-300 border-r">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu bg-base-200 min-h-full w-64 p-4">
			<li><a href="#/discover">Discover</a></li>
			<li><a href="#/">Notes</a></li>
			<div class="divider"></div>
			<span class="menu-title flex items-center gap-2"><Notebook size={18} />Notebooks</span>
			{#each notebooks as notebook}
				<li><a href="">{notebook.name}</a></li>
			{/each}
			<div class="divider"></div>
			<span class="menu-title flex items-center gap-2"><Tags size={18} /> Tags</span>
			{#each tags as tag}
				<li><a href="">{tag.name}</a></li>
			{/each}
			<div class="grow"></div>

			<li><a href="#/notebooks"><Pencil size={18} />Manage Notebooks</a></li>
			<li><a href="#/upload"><CloudUpload size={18} />Upload</a></li>
			<li><a href="#/settings"><Settings size={18} />Settings</a></li>
		</ul>
	</div>
</div>

<Dock />
