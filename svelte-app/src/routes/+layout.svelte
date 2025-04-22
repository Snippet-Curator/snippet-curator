<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import {
		Import,
		Notebook as NotebookIcon,
		Settings,
		Tags,
		WalletCards,
		Archive,
		Trash2
	} from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';

	import { getNotebookState, setNotebookState, getTagState, setTagState } from '$lib/db.svelte';
	import type { Notebook } from '$lib/types';

	import { Dock, Icon, NotebookList, TagList } from '$lib/components';

	let { children } = $props();
	setTagState();
	setNotebookState();
	const tagState = getTagState();
	const notebookState = getNotebookState();

	let notebookInbox = $state<Notebook>();
	let notebookArchive = $state<Notebook>();

	async function getDefaultNotebooks() {
		notebookInbox = await notebookState.getOneByName('Inbox');
		notebookArchive = await notebookState.getOneByName('Archive');
	}

	type LayoutPage = {
		name: string;
		icon: any;
		url: string;
	};

	const bottomPages: LayoutPage[] = [
		{
			name: 'Organize',
			icon: WalletCards,
			url: '#/organize'
		},
		{
			name: 'Import',
			icon: Import,
			url: '#/import'
		},
		{
			name: 'Settings',
			icon: Settings,
			url: '#/settings'
		}
	];

	let defaultNotebooks = $state();

	onMount(() => {
		defaultNotebooks = getDefaultNotebooks();
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

		<ul class="menu bg-base-200 min-h-screen w-64 space-y-2 p-4">
			<div class="mb-6 ml-1 flex h-8 items-center gap-x-1">
				<Icon /> <span class="text-xl font-semibold tracking-widest">urator</span>
			</div>

			<li>
				<a class={page.url.hash == '#/discover' ? 'menu-active' : ''} href="#/discover">Discover</a>
			</li>
			<li>
				<a class={page.url.hash == '#/' || page.url.hash == '' ? 'menu-active' : ''} href="#/"
					>Search</a
				>
			</li>
			{#await defaultNotebooks then}
				{#if notebookInbox}
					<li>
						<a
							class="{page.url.hash == `#/notebook/${notebookInbox.id}`
								? 'menu-active'
								: ''} flex w-full justify-between"
							href="#/notebook/{notebookInbox.id}"><span>Inbox</span> {notebookInbox.note_count}</a
						>
					</li>
				{/if}
			{/await}

			<div class="divider my-0 py-0"></div>

			<ScrollArea class="h-10 grow">
				<span class="menu-title flex max-h-60 items-center gap-2 overflow-y-auto"
					><NotebookIcon size={18} />Notebooks</span
				>

				<NotebookList notebooks={notebookState.notebooks} />

				<span class="menu-title flex items-center gap-2"><Tags size={18} /> Tags</span>

				<TagList tags={tagState.tags} />
			</ScrollArea>

			{#snippet renderBottomPages(name: string, url: string, icon: any)}
				{@const Icon = icon}
				<li>
					<a class={page.url.hash == url ? 'menu-active' : ''} href={url}>
						<Icon size={18} />
						{name}</a
					>
				</li>
			{/snippet}

			{#await defaultNotebooks then}
				{#if notebookArchive}
					{@render renderBottomPages('Archive', `#/notebook/${notebookArchive.id}`, Archive)}
				{/if}
			{/await}
			{#each bottomPages as page}
				{@render renderBottomPages(page.name, page.url, page.icon)}
			{/each}
		</ul>
	</div>
</div>

<Dock />
