<script lang="ts">
	import { Note, Topbar } from '$lib/components/';

	import type { Props } from '$lib/types';

	let { data }: Props = $props();
	let note = $state(data.note);
</script>

<Note {note} />
