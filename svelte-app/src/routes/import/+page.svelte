<script lang="ts">
	import { EnImport } from '$lib/parser';

	let enexFiles: File[] = [];

	async function parseUploadedEnex() {
		const decoder = new TextDecoder('utf-8');
		for (const file of enexFiles) {
			const decodedText = decoder.decode(await file.arrayBuffer());
			const parsedXML = new EnImport(decodedText);
			await parsedXML.uploadToDB();
		}
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			enexFiles = Array.from(input.files);
		}
	}
</script>

<div class="flex pl-5 pt-20 md:pl-20">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Upload Evernote Enex File</legend>
		<input
			onchange={handleFileUpload}
			type="file"
			multiple
			accept=".enex"
			id="file"
			required
			class="file-input"
		/>
		<label class="fieldset-label">Max size 5GB</label>
		<button onclick={parseUploadedEnex} class="btn btn-neutral">Upload</button>
	</fieldset>
</div>
