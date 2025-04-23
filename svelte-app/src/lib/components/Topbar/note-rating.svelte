<script lang="ts">
	type Props = {
		rating: number;
		action: () => void;
	};

	let { rating = $bindable(), action }: Props = $props();

	function updateRating(newRating) {
		console.log(rating, newRating);
		rating = rating === newRating ? 0 : newRating;
	}
</script>

{rating}

<div class="rating rating-xs">
	{#each [1, 2, 3, 4, 5] as star}
		<input
			type="radio"
			name="rating-5"
			class="mask mask-star-2 bg-orange-400"
			aria-label="{star} star"
			checked={rating === star}
			onclick={() => updateRating(star)}
		/>
	{/each}
</div>

<!-- <input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" aria-label="1 star" />
	<input
		type="radio"
		name="rating-5"
		class="mask mask-star-2 bg-orange-400"
		aria-label="2 star"
		checked="checked"
	/>
	<input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" aria-label="3 star" />
	<input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" aria-label="4 star" />
	<input type="radio" name="rating-5" class="mask mask-star-2 bg-orange-400" aria-label="5 star" /> -->
