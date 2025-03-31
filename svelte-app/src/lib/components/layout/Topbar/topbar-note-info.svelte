<script lang="ts">
	import dayjs from 'dayjs';
	import { Info } from 'lucide-svelte';

	let { added, updated, created, source, source_url } = $props();

	function openURL(e: MouseEvent) {
		const target = e.currentTarget as HTMLAnchorElement;
		e.preventDefault();
		window.open(target.href);
	}
</script>

<div class="dropdown dropdown-end">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="tooltip tooltip-bottom z-30" data-tip="Info">
		<div tabindex="0" class="btn btn-ghost"><Info size={18} /></div>
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		tabindex="0"
		class="dropdown-content border-base-content/20 bg-base-100 rounded-box w-76 border px-4 py-2 shadow-sm"
	>
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
				<a class="link" href={source_url} onclick={openURL}>{source_url}</a>
			</div>
		</div>
	</div>
</div>
