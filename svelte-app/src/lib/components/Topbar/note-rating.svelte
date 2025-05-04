<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		rating: number;
		action: (newRating: number) => void;
	};

	let { rating, action }: Props = $props();
	let newRating = $state(0);

	function updateRating(star: number) {
		newRating = star == rating ? 0 : star;
		action(newRating);
	}

	function handler(event: KeyboardEvent) {
		switch (event.key) {
			case 'h':
				event.preventDefault();
				updateRating(0);
				break;
			case 'j':
				event.preventDefault();
				updateRating(1);
				break;
			case 'k':
				event.preventDefault();
				updateRating(2);
				break;
			case 'l':
				event.preventDefault();
				updateRating(3);
				break;
			case ';':
				event.preventDefault();
				updateRating(4);
				break;
			case "'":
				event.preventDefault();
				updateRating(5);
				break;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handler);

		onDestroy(() => {
			document.removeEventListener('keydown', handler);
		});
	});
</script>

<div class="rating rating-xs">
	{#each [1, 2, 3, 4, 5] as star}
		<input
			type="radio"
			name="ratings"
			class="mask mask-star-2 bg-orange-400"
			aria-label="{star} star"
			checked={rating === star}
			onclick={() => updateRating(star)}
		/>
	{/each}
</div>
