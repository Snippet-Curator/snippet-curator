<script lang="ts">
	import { Notebook as NotebookIcon } from 'lucide-svelte';

	import type { Notebook } from '$lib/types';

	type Props = {
		notebook: Notebook;
	};

	let { notebook }: Props = $props();
</script>

<button class="btn btn-ghost flex items-center gap-x-2"
	><NotebookIcon size={18} />{notebook.name}</button
>
