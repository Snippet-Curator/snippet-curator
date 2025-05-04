<script lang="ts">
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
