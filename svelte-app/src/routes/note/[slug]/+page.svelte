<script lang="ts">
	import { goto } from '$app/navigation';

	import { Note, Topbar, Delete } from '$lib/components/';
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

<Topbar bind:isDeleteOpen {...note} />
<div class="h-[calc(100vh-60px)]">
	<Note {note} />
</div>

<Delete bind:isOpen={isDeleteOpen} name="Note" action={() => deleteNote(note.id)} />
