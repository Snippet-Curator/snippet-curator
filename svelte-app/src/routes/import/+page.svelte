<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import * as Topbar from '$lib/components/Topbar/index';

	import { EnImport, fileImport, htmlImport } from '$lib/parser';
	import pb, { getDefaultNotebooksState, getNotebookState, getTagState } from '$lib/db.svelte';

	const decoder = new TextDecoder('utf-8');

	const notebookState = getNotebookState();
	const tagState = getTagState();
	const defaultNotebookState = getDefaultNotebooksState();

	let files: File[] = [];
	let listOfErrors = $state<
		{
			name: string;
			error: string;
		}[]
	>([]);
	let listofSuccesses = $state<string[]>([]);
	let totalFiles = $state(0);
	let progress = $state(0);
	let currentFile = $state('');
	let selectedNotebookID = $state<string>();
	let uploadStatus: 'stopped' | 'in progress' | 'error' | 'completed' = $state('stopped');
	const items = [
		{
			title: 'Evernote .enex files',
			description:
				'Click the "Sign Up" button in the top right corner and follow the registration process.'
		},
		{
			title: 'SingleFile .html files',
			description:
				'Click the "Sign Up" button in the top right corner and follow the registration process.'
		},
		{
			title: 'Images',
			description:
				'Click the "Sign Up" button in the top right corner and follow the registration process.'
		},
		{
			title: 'Videos and audio files',
			description:
				'Click the "Sign Up" button in the top right corner and follow the registration process.'
		},
		{
			title: 'Misc files',
			description:
				'Click the "Sign Up" button in the top right corner and follow the registration process.'
		}
	];

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;

		files = Array.from(input.files);
		totalFiles = files.length;
	}

	async function uploadFile(file: File) {
		if (selectedNotebookID?.startsWith('Import') || !selectedNotebookID) {
			selectedNotebookID = defaultNotebookState.inboxID;
		}

		const decodedText = decoder.decode(await file.arrayBuffer());

		if (file.type == 'text/html') {
			const parsedHTML = new htmlImport(decodedText, selectedNotebookID);
			try {
				await parsedHTML.uploadToDB();
				listofSuccesses.push(file.name);
			} catch (e) {
				listOfErrors.push({
					name: file.name,
					error: e.message
				});
			}
		} else if (file.name.includes('.enex')) {
			const parsedXML = new EnImport(decodedText, selectedNotebookID);
			try {
				await parsedXML.uploadToDB();
				listofSuccesses.push(file.name);
			} catch (e) {
				listOfErrors.push({
					name: file.name,
					error: e.message
				});
				console.log(e);
			}
		} else {
			const imageFile = new fileImport(file, selectedNotebookID);
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

		await notebookState.getAll();
		await tagState.getAll();
		await defaultNotebookState.getAll();

		// resubscribe
		await pb.collection('notes').subscribe('*', async () => {
			notebookState.getAll();
			tagState.getAll();
			defaultNotebookState.getAll();
		});
	}

	const notebooks = notebookState.notebooks;
</script>

<Topbar.Root>
	<Topbar.SidebarIcon></Topbar.SidebarIcon>
	<Topbar.Back />
	<div class="grow"></div>
</Topbar.Root>

<ScrollArea class="h-[calc(100vh-60px)] overflow-y-auto">
	<section class="gap-golden-xl p-golden-xl card mx-auto mt-10 grid max-w-5xl grid-cols-1">
		<div class="gap-golden-lg grid grid-cols-2">
			<div class="gap-golden-md flex flex-col">
				<input
					onchange={handleFileUpload}
					type="file"
					multiple
					id="file"
					required
					class="file-input w-full"
				/>

				<select class="select w-full" bind:value={selectedNotebookID}>
					<option disabled selected>Import into Notebook</option>
					{#each notebooks as notebook}
						<option value={notebook.id}>{notebook.name}</option>
					{/each}
				</select>

				<label for="file" class="fieldset-label text-sm">Max size 5GB</label>

				<button onclick={importFiles} class="btn btn-neutral">Import</button>
			</div>

			{#if uploadStatus == 'in progress' || uploadStatus == 'completed'}
				<div class="flex w-full self-start">
					<div class="card card-border p-golden-md grid w-full grid-cols-3">
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
				</div>
			{/if}
		</div>

		{#if uploadStatus == 'in progress' || uploadStatus == 'completed'}
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
									<th>File</th>
								</tr>
							</thead>
							<tbody>
								{#each listofSuccesses as item, index}
									<tr>
										<th>{index + 1}</th>
										<td>{item}</td>
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
			</Tabs.Root>
		{/if}
	</section>

	<div class="divider mx-auto max-w-5xl"></div>

	<section class="card prose p-golden-xl mx-auto max-w-5xl">
		<h2>Supported Import Files</h2>

		<div class="join join-vertical bg-base-100 w-full">
			{#each items as item}
				<div class="collapse-arrow join-item border-base-200 collapse border">
					<input type="checkbox" name="my-accordion-4" />
					<div class="collapse-title font-semibold">{item.title}</div>
					<div class="collapse-content">
						{item.description}
					</div>
				</div>
			{/each}
		</div>
	</section>
</ScrollArea>
