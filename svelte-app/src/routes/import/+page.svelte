<script lang="ts">
	import { goto } from '$app/navigation';
	import { EnImport, htmlImport } from '$lib/parser';

	let enexFiles: File[] = [];
	let listOfUploads;
	let listOfErrors: string[] = $state([]);
	let listofSuccesses: string[] = $state([]);
	let totalFiles: number = $state(0);
	let progress: number = $state(0);
	let currentFile: string = $state('');
	let uploadStatus: 'stopped' | 'in progress' | 'error' | 'completed' = $state('stopped');

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			enexFiles = Array.from(input.files);
			totalFiles = enexFiles.length;
		}
	}

	async function parseUploadedEnex() {
		uploadStatus = 'in progress';
		const decoder = new TextDecoder('utf-8');
		for (const [index, file] of enexFiles.entries()) {
			progress = Math.round(((index + 1) / totalFiles) * 100);
			currentFile = file.name;
			const decodedText = decoder.decode(await file.arrayBuffer());

			if (file.type == 'text/html') {
				const parsedHTML = new htmlImport(decodedText);
				await parsedHTML.uploadToDB();
			}

			if (file.name.includes('.enex')) {
				const parsedXML = new EnImport(decodedText);
				try {
					await parsedXML.uploadToDB();
					listofSuccesses.push(file.name);
				} catch (e) {
					console.log(e);
				}
			}
		}
		uploadStatus = 'completed';
	}
</script>

<div class="flex pl-5 pt-20 md:pl-20">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Upload Evernote Enex File</legend>
		<input
			onchange={handleFileUpload}
			type="file"
			multiple
			accept=".enex, .html"
			id="file"
			required
			class="file-input"
		/>
		<label for="file" class="fieldset-label">Max size 5GB</label>
		<button onclick={parseUploadedEnex} class="btn btn-neutral">Upload</button>
	</fieldset>

	<div class="mx-4">
		<div>
			Total files: {totalFiles}
		</div>
		<div>
			Progress:
			<progress class="progress h-4 w-72" value={progress} max="100"></progress>
			{progress}%
		</div>
		<div>uploadStatus: {uploadStatus}</div>
		<div>
			currentFile: {currentFile}
		</div>
	</div>
</div>

<div class="max-h-screen overflow-y-auto">
	<div>
		Successes
		{#each listofSuccesses as item}
			<ul class="list">
				<li class="list-row">{item}</li>
			</ul>
		{/each}
	</div>

	<div>
		Errors
		{#each listOfErrors as item}
			<div>{item}</div>
		{/each}
	</div>
</div>
