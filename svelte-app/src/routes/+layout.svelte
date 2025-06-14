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
		Archive
	} from 'lucide-svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index';
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	import {
		getNotebookState,
		setNotebookState,
		getTagState,
		setTagState,
		setSettingState
	} from '$lib/db.svelte';

	import { Command, Dock, Icon, NotebookList, TagList } from '$lib/components';
	import { getMobileState, setMobileState } from '$lib/utils.svelte';

	let { children } = $props();
	setTagState();
	setNotebookState();
	setMobileState();
	setSettingState();
	const tagState = getTagState();
	const notebookState = getNotebookState();
	const mobileState = getMobileState();

	let screenWidth = window.innerWidth;

	async function getDefaultNotebooks() {
		await notebookState.getInbox();
		await notebookState.getAllCounts();
	}

	const updateScreenWidth = () => {
		screenWidth = window.innerWidth;
		mobileState.isMobile = screenWidth < 768 ? true : false;
		// mobileState.isSidebarOpen = screenWidth < 768 ? false : true;
		if (screenWidth < 768) {
			mobileState.isSidebarOpen = false;
		}
	};

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
		// {
		// 	name: 'Test',
		// 	icon: Settings,
		// 	url: '#/test'
		// }
	];

	let defaultNotebooks = $state();

	onMount(async () => {
		updateScreenWidth();
		defaultNotebooks = getDefaultNotebooks();
	});

	$effect(() => {
		window.addEventListener('resize', updateScreenWidth);
	});
</script>

<Command />

<Resizable.PaneGroup direction="horizontal" class="font-display max-h-screen min-h-screen w-full">
	<Resizable.Pane
		class="{mobileState.isSidebarOpen
			? '-motion-translate-x-in-100 motion-duration-200'
			: 'hidden'} menu bg-base-200 border-base-content/10 space-y-2 border-r"
		defaultSize={16}
		minSize={10}
		maxSize={30}
		collapsible={true}
		collapsedSize={0}
	>
		<div class="mb-5 ml-1 mt-2 flex h-6 items-center gap-x-1">
			<Icon /> <span class="text-xl font-semibold tracking-widest">ecollect</span>
		</div>

		<li>
			<a class={page.url.hash == '#/discover' ? 'menu-active' : ''} href="#/discover">Discover</a>
		</li>
		<li>
			<a
				class="{page.url.hash == '#/' || page.url.hash == ''
					? 'menu-active'
					: ''} flex w-full justify-between"
				href="#/"
			>
				<span>Search</span> {notebookState.totalNoteCount}</a
			>
		</li>
		{#await defaultNotebooks then}
			<li>
				<a
					class="{page.url.hash == `#/notebook/${notebookState.inboxID}`
						? 'menu-active'
						: ''} flex w-full justify-between"
					href="#/notebook/{notebookState.inboxID}"><span>Inbox</span> {notebookState.inboxCount}</a
				>
			</li>
		{/await}

		<div class="divider my-0 py-0"></div>

		<ScrollArea scrollHideDelay={200} class="h-10 grow">
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

		{#each bottomPages as page}
			{@render renderBottomPages(page.name, page.url, page.icon)}
		{/each}
	</Resizable.Pane>

	<Resizable.Handle />
	<Resizable.Pane>
		{@render children()}
	</Resizable.Pane>
</Resizable.PaneGroup>

<!-- <div class="drawer lg:drawer-open font-display">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<div>
			{@render children()}
		</div>
	</div>
	<div class="drawer-side border-base-300 border-r">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>

		<ul class="menu bg-base-200 min-h-screen w-64 space-y-2 p-4">
			<div class="m-golden-md flex h-8 items-center gap-x-1">
				<Icon /> <span class="text-xl font-semibold tracking-widest">ecollect</span>
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
				<li>
					<a
						class="{page.url.hash == `#/notebook/${defaultNotebooksState.inboxID}`
							? 'menu-active'
							: ''} flex w-full justify-between"
						href="#/notebook/{defaultNotebooksState.inboxID}"
						><span>Inbox</span> {defaultNotebooksState.inboxCount}</a
					>
				</li>
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
				{@render renderBottomPages(
					'Archive',
					`#/notebook/${defaultNotebooksState.archiveID}`,
					Archive
				)}
			{/await}
			{#each bottomPages as page}
				{@render renderBottomPages(page.name, page.url, page.icon)}
			{/each}
		</ul>
	</div>
</div> -->

<Dock />
