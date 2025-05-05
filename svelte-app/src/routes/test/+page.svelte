<script lang="ts">
	let content = $state('');
	let iframe;

	$effect(() => {
		if (iframe && content) {
			const doc = iframe.contentDocument || iframe.contentWindow.document;
			doc.open();
			doc.write(content);
			doc.close();
		}
	});
</script>

<textarea class="textarea h-100 mb-20 mt-10 w-full" contenteditable="true" bind:value={content}
></textarea>

<iframe class="mt-4 h-[600px] w-full border" bind:this={iframe} />
