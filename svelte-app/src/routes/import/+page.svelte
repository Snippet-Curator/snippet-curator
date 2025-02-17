<script lang="ts">
	import { parseEnex, EnImport } from '$lib/parser';

	let enexFiles: File[] = [];

	async function parseUploadedEnex() {
		console.log(enexFiles);

		const decoder = new TextDecoder('utf-8');
		const decodedText = decoder.decode(await enexFiles[0].arrayBuffer());

		const parsedXML = new EnImport(decodedText);

		console.log('enNote: ', parsedXML.content);
		console.log('enResources: ', parsedXML.enResources);
		await parsedXML.uploadToDB();
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			enexFiles = Array.from(input.files);
		}
	}
</script>

<div class="mt-20 flex items-center justify-center">
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
		<label class="fieldset-label">Max size 2MB</label>
		<button onclick={parseUploadedEnex} class="btn btn-neutral">Upload</button>
	</fieldset>
</div>
