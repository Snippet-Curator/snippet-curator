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
	// import { Toaster } from '$lib/components/ui/sonner/index';

	import {
		getNotebookState,
		setNotebookState,
		getTagState,
		setTagState,
		getDefaultNotebooksState,
		setDefaultNotebooksState
	} from '$lib/db.svelte';

	import { Dock, Icon, NotebookList, TagList } from '$lib/components';

	let { children } = $props();
	setTagState();
	setNotebookState();
	setDefaultNotebooksState();
	const tagState = getTagState();
	const notebookState = getNotebookState();
	const defaultNotebooksState = getDefaultNotebooksState();

	async function getDefaultNotebooks() {
		await defaultNotebooksState.getAll();
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
		},
		{
			name: 'Test',
			icon: Settings,
			url: '#/test'
		}
	];

	let defaultNotebooks = $state();

	onMount(async () => {
		defaultNotebooks = getDefaultNotebooks();

		// // update note scores. First unsubscribe real time
		// await pb.collection('notes').unsubscribe();

		// // update note score
		// await refreshStaleScores(5);

		// // update UI
		// Promise.all([
		// 	await notebookState.getAll(),
		// 	await tagState.getAll(),
		// 	await defaultNotebooksState.getAll()
		// ]);

		// // resubscribe
		// await pb.collection('notes').subscribe('*', async () => {
		// 	notebookState.getAll();
		// 	tagState.getAll();
		// 	defaultNotebooksState.getAll();
		// });
	});
</script>

<div class="drawer lg:drawer-open font-display">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<div>
			{@render children()}
			<!-- <Toaster duration={1000} position="top-right" visibleToasts={1} /> -->
		</div>
	</div>
	<div class="drawer-side border-base-300 border-r">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>

		<ul class="menu bg-base-200 w-68 min-h-screen space-y-2 p-4">
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
</div>

<Dock />
