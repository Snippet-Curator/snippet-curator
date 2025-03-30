<script lang="ts">
	import dayjs from 'dayjs';

	import { ArrowLeft, Info, Notebook, Pencil, Trash2 } from 'lucide-svelte';

	let {
		deleteNote,
		isDeleteOpen = $bindable(),
		added,
		updated,
		created,
		expand,
		source,
		sourceURL
	} = $props();

	let notebook = $state(expand.notebook);
	let tags = $state(expand.tags);

	function openURL(e: MouseEvent) {
		const target = e.currentTarget as HTMLAnchorElement;
		e.preventDefault();
		window.open(target.href);
	}
</script>

<div class="menu bg-base-200 border-base-200 h-15 w-full border-b px-4">
	<div class="flex items-center gap-x-2">
		<button
			class="btn btn-outline hover:btn-primary border-base-300 group flex pl-4 transition-all"
			onclick={() => window.history.back()}
		>
			<ArrowLeft
				size={18}
				class="text-primary-content -mr-6 opacity-0 transition-all group-hover:mr-[2px] group-hover:opacity-100"
			/>

			<div>Notes</div>
		</button>

		<div class="grow"></div>
		<div class="rating rating-xs">
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="1 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="2 star"
				checked="checked"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="3 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="4 star"
			/>
			<input
				type="radio"
				name="rating-5"
				class="mask mask-star-2 bg-orange-400"
				aria-label="5 star"
			/>
		</div>

		{#each tags as tag}
			<span class="badge">{tag.name}</span>
		{/each}

		<button class="btn btn-ghost flex items-center gap-x-2"
			><Notebook size={18} />{notebook.name}</button
		>

		<div class="divider divider-horizontal"></div>

		<button class="btn btn-ghost">
			<Pencil size={18} />
		</button>
		<button onclick={() => (isDeleteOpen = true)} class="btn btn-ghost"><Trash2 size={18} /></button
		>
		<div class="divider divider-horizontal"></div>

		<div class="dropdown dropdown-end">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" class="btn btn-ghost"><Info size={18} /></div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" class="dropdown-content bg-base-100 rounded-box w-76 px-4 py-2 shadow-sm">
				<div class="grid grid-cols-3 gap-x-2 gap-y-1 p-2">
					<div>Original Creation Date</div>
					<div class="col-span-2">{dayjs(added).format('MMM DD YYYY, hh:ss a')}</div>
					<div>Created in Curator</div>
					<div class="col-span-2">{dayjs(created).format('MMM DD YYYY, hh:ss a')}</div>
					<div>Last Modified</div>
					<div class="col-span-2">{dayjs(updated).format('MMM DD YYYY, hh:ss a')}</div>
					<div>Source</div>
					<div class="col-span-2">{source}</div>

					<div>URL</div>
					<div class="col-span-2 break-all">
						<a class="link" href={sourceURL} onclick={openURL}>{sourceURL}</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
