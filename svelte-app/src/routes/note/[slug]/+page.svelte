<script lang="ts">
	import Note from '$lib/components/Note.svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import type { Props } from '$lib/types';

	let { data }: Props = $props();
	let note = $state(data.note);
</script>

<Topbar />
<Note {note} />
