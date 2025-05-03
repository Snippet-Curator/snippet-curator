<script lang="ts">
	let { onLeft, onRight, onUp, onDown } = $props();

	document.addEventListener('keydown', function (event) {
		if (event.keyCode == 37) {
			onLeft();
		} else if (event.keyCode == 39 || event.keyCode == 32) {
			onRight();
		} else if (event.keyCode == 38) {
			onUp();
		} else if (event.keyCode == 40) {
			onDown();
		}
	});
</script>
