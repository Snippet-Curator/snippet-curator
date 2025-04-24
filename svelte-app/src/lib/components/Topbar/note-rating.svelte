<script lang="ts">
	type Props = {
		rating: number;
		action: () => void;
		newRating: number;
	};

	let { rating, action, newRating = $bindable() }: Props = $props();

	function updateRating(star: number) {
		newRating = star == rating ? 0 : star;
		action();
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
