<script lang="ts">
	import { goto } from '$app/navigation';

	import { Note, Topbar, Delete, TopbarTags, TopbarDelete, Rating } from '$lib/components/';
	import TopbarBack from '$lib/components/layout/Topbar/topbar-back.svelte';
	import TopbarNoteInfo from '$lib/components/layout/Topbar/topbar-note-info.svelte';
	import TopbarNotebook from '$lib/components/layout/Topbar/topbar-notebook.svelte';
	import pb from '$lib/db.svelte';

	import type { Props } from '$lib/types';

	let { data }: Props = $props();
	let note = $state(data.note);
	let isDeleteOpen = $state(false);
	async function deleteNote(noteID) {
		await pb.collection('notes').delete(noteID);
		goto('#/');
	}
</script>

<Topbar>
	<TopbarBack />
	<div class="grow"></div>
	<Rating />
	<TopbarTags tags={note?.expand.tags} />
	<div class="divider divider-horizontal"></div>
	<TopbarNotebook notebook={note?.expand.notebook} />
	<TopbarDelete bind:isOpen={isDeleteOpen} />
	<TopbarNoteInfo {...note} />
</Topbar>

<div class="relative h-[calc(100vh-60px)]">
	<Note {note} />
</div>

<Delete bind:isOpen={isDeleteOpen} name="Note" action={() => deleteNote(note.id)} />
