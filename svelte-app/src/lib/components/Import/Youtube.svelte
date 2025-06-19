<script lang="ts">
	import { getNotebookState, getSettingState } from '$lib/db.svelte';
	import { getImportState } from './import.svelte';

	const settingState = getSettingState();
	const importState = getImportState();
	const notebookState = getNotebookState();
	const notebooks = $derived(notebookState.flatNotebooks);

	let youtubeURLs = $state('');
	let selectedYoutubeNotebookID = $state<string>();
</script>

<section class="card mx-auto">
	<div class="card-body">
		<h2 class="card-title">Add Youtube Videos</h2>
		<div class="gap-golden-xl grid grid-cols-12">
			<div class="prose col-span-12 md:col-span-6">
				<p>
					This will add youtube videos as an embedded playable video. The video itself will not be
					downloaded. However, this enables organization of saved youtube videos and will also save
					the titles, thumbnail, and description. You need to have youtube API setup in Settings
					first to use this.
				</p>
			</div>

			<div class="gap-golden-md col-span-12 flex flex-col md:col-span-6">
				<textarea
					placeholder="Paste full youtube URLs or video IDs, one on each line."
					bind:value={youtubeURLs}
					class="textarea w-full"
				></textarea>
				<select class="select w-full" bind:value={selectedYoutubeNotebookID}>
					<option disabled selected>Import into Notebook</option>
					{#each notebooks as notebook}
						<option value={notebook.id}>{notebook.name}</option>
					{/each}
				</select>

				<button
					disabled={!settingState.youtubeAPIKey}
					onclick={async () => {
						importState.getSelectedNotebookID(selectedYoutubeNotebookID);
						await importState.importYoutube(youtubeURLs, settingState.youtubeAPIKey);
					}}
					class="btn btn-neutral">Import</button
				>
			</div>
		</div>
	</div>
</section>
