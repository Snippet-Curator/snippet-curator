<script lang="ts">
	let { onLeft, onRight } = $props();

	document.addEventListener('keydown', function (event) {
		if (event.keyCode == 37) {
			onLeft();
		} else if (event.keyCode == 39 || event.keyCode == 32) {
			onRight();
		}
	});
</script>
