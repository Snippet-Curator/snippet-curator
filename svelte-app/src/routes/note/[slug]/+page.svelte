<script lang="ts">
	import { goto } from '$app/navigation';

	import { Note, Topbar } from '$lib/components/';
	import pb from '$lib/db';

	import type { Props } from '$lib/types';

	let { data }: Props = $props();
	let note = $state(data.note);

	async function deleteNote() {
		await pb.collection('notes').delete(note.id);
		goto('#/');
	}
</script>

<Topbar {deleteNote} {...note} />
<div class="h-[calc(100vh-60px)]">
	<Note {note} />
</div>
