<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Tabs from '$lib/components/ui/tabs/index';

	import { EnImport, fileImport, htmlImport } from '$lib/parser';
	import pb, { getNotebookState, getTagState } from '$lib/db.svelte';

	const decoder = new TextDecoder('utf-8');

	const notebookState = getNotebookState();
	const tagState = getTagState();

	let files: File[] = [];
	let listOfUploads;
	let listOfErrors = $state([]);
	let listofSuccesses: string[] = $state([]);
	let totalFiles: number = $state(0);
	let progress: number = $state(0);
	let currentFile: string = $state('');
	let uploadStatus: 'stopped' | 'in progress' | 'error' | 'completed' = $state('stopped');

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;

		files = Array.from(input.files);
		totalFiles = files.length;
	}

	async function uploadFile(file: File) {
		const decodedText = decoder.decode(await file.arrayBuffer());

		console.log('filetype: ', file.type);

		if (file.type == 'text/html') {
			const parsedHTML = new htmlImport(decodedText);
			await parsedHTML.uploadToDB();
		} else if (file.name.includes('.enex')) {
			const parsedXML = new EnImport(decodedText);
			try {
				await parsedXML.uploadToDB();
				listofSuccesses.push(file.name);
			} catch (e) {
				listOfErrors.push({
					name: file.name,
					error: e.message
				});
			}
		} else {
			const imageFile = new fileImport(file);
			try {
				await imageFile.uploadToDB();
				listofSuccesses.push(file.name);
			} catch (e) {
				console.log(e);
			}
		}
	}

	async function importFiles() {
		uploadStatus = 'in progress';

		// avoid updating tags and notebook errors
		await pb.collection('notes').unsubscribe();

		for (const [index, file] of files.entries()) {
			currentFile = file.name;
			await uploadFile(file);
			progress = Math.round(((index + 1) / totalFiles) * 100);
		}
		currentFile = '';
		uploadStatus = 'completed';

		// resubscribe
		await pb.collection('notes').subscribe('*', async () => {
			notebookState.getAll();
			tagState.getAll();
		});
	}
</script>

<ScrollArea class="mx-auto max-h-screen max-w-6xl">
	<section class="gap-golden-2xl m-golden-xl grid grid-cols-1">
		<div>
			<div class="card">
				<div>
					<p>Import Files. Currently supported formats include Evernote.</p>
					<ul>
						<li>.Enex</li>
						<li>HTML</li>
						<li>Image files</li>
						<li>Video files</li>
					</ul>
				</div>
			</div>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">Import Files</legend>
				<input
					onchange={handleFileUpload}
					type="file"
					multiple
					id="file"
					required
					class="file-input"
				/>
				<label for="file" class="fieldset-label">Max size 5GB</label>
				<button onclick={importFiles} class="btn btn-neutral">Import</button>
			</fieldset>

			<div class="divider"></div>

			<div class="flex w-full">
				<!-- {#if uploadStatus == 'in progress' || uploadStatus == 'completed'} -->
				<div class="card card-border grid w-full grid-cols-3 items-center p-4">
					<div>Progress</div>
					<div class="col-span-2 flex items-center gap-x-2">
						<progress class="progress h-4" value={progress} max="100"></progress>
						{progress}%
					</div>

					<div>Status</div>
					<div class="col-span-2 text-right">{uploadStatus}</div>
					<div>Current File</div>
					<div class="col-span-2 text-right">{currentFile}</div>
				</div>
				<!-- {/if} -->
			</div>
		</div>
		<!-- div left -->

		<!-- {#if uploadStatus == 'in progress' || uploadStatus == 'completed'} -->
		<Tabs.Root value="success">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="success">Success</Tabs.Trigger>
				<Tabs.Trigger value="errors">Errors</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="success">
				<ScrollArea class="h-100">
					<table class="table-zebra table">
						<thead>
							<tr>
								<th></th>
								<th>File name</th>
							</tr>
						</thead>
						<tbody>
							{#each listofSuccesses as item, index}
								<tr>
									<th>{index + 1}</th>
									<td>{item.name}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</ScrollArea>
			</Tabs.Content>
			<Tabs.Content value="errors">
				<ScrollArea class="h-100">
					<table class="table-zebra table">
						<thead>
							<tr>
								<th></th>
								<th>File name</th>
								<th>Error Message</th>
							</tr>
						</thead>
						<tbody>
							{#each listOfErrors as item, index}
								<tr>
									<th>{index + 1}</th>
									<td>{item.name}</td>
									<td>{item.error}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</ScrollArea>
			</Tabs.Content>

			<!-- {/if} -->
		</Tabs.Root>
	</section>
</ScrollArea>
