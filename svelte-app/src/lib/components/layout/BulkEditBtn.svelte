<script lang="ts">
	import { Pencil } from 'lucide-svelte';

	type Props = {
		isBulkEdit: boolean;
		selectedNotesID: string[];
	};

	let { isBulkEdit = $bindable(), selectedNotesID = $bindable() }: Props = $props();
</script>

<div class="tooltip tooltip-bottom z-30" data-tip="Bulk Edit">
	<button
		class="{isBulkEdit ? 'btn-primary' : 'btn-ghost'} btn"
		onclick={() => {
			isBulkEdit = !isBulkEdit;
			selectedNotesID = [];
		}}
	>
		<Pencil size={18} />
	</button>
</div>
