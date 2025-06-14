<script lang="ts">
	import { getSettingState } from '$lib/db.svelte';
	import { onMount } from 'svelte';

	const settingState = getSettingState();

	let initialLoading = $state();

	onMount(async () => {
		initialLoading = await settingState.getDefaultSettings();
	});
</script>

{#snippet renderSetting(name: string, title: string, initialValue = 0, description = '')}
	<div class="grid grid-cols-12 items-start">
		<div class="col-span-9">
			<legend class="fieldset-legend">{title}</legend>
			<p>{description}</p>
		</div>
		<input
			type="number"
			class="input col-span-2 col-start-10 text-right"
			min="0"
			max="1"
			value={initialValue}
			step="0.1"
			onchange={(event: Event) => {
				const input = event.target as HTMLInputElement;
				const newValue = input.valueAsNumber;
				console.log('Changed setting: ', name, newValue);
				settingState.changeSetting(name, newValue);
			}}
		/>
	</div>
{/snippet}

<div class="card mb-20">
	<div class="card-body">
		<div class="card-title text-xl">Discover Settings</div>
		<p>Settings are updated on restart.</p>
		{#await initialLoading then}
			<div class="gap-golden-md grid grid-cols-1 md:grid-cols-2">
				{@render renderSetting(
					'recencyWeight',
					'Recency Weight',
					settingState.recencyWeight,
					'Weight of how recently a note was seen. Older notes will be ranked higher.'
				)}
				{@render renderSetting(
					'ratingWeight',
					'Rating Weight',
					settingState.ratingWeight,
					'Weight of note rating in score calculation. Higher rated notes will be ranked higher.'
				)}
				{@render renderSetting(
					'weightWeight',
					'Voting Weight',
					settingState.weightWeight,
					'Weight of upvote vs downvote of a note. More upvoted notes will be ranked higher'
				)}
				{@render renderSetting(
					'randomWeight',
					'Random Weight',
					settingState.randomWeight,
					'Weight of random modifier. Higher weight means more randomness.'
				)}
				{@render renderSetting(
					'fullPenaltyWindow',
					'Full Penalty Window (Hour)',
					settingState.fullPenaltyWindow,
					'Notes seen in this window will be penalized to be ranked less (default 1 hour).'
				)}
				{@render renderSetting(
					'decayWindow',
					'Penality Recovery Window (Hour)',
					settingState.decayWindow,
					'Penalty will gradually reduce during this time period for penalized notes (default 12 hours).'
				)}
				{@render renderSetting(
					'daysOld',
					'Refresh Score Cutoff (Day)',
					settingState.daysOld,
					'Notes older than this will get a score refresh on startup to recalculate based on recency. Use 0 to refresh all notes (can increase load time).'
				)}
				{@render renderSetting(
					'scoreRefreshHour',
					'Score Refresh Frequency When Open (hour)',
					settingState.scoreRefreshHour,
					'Curator will refresh scores when open. Default refresh is every 6 hours. Changing it to 0 will not refresh automatically.'
				)}
			</div>
		{/await}
	</div>
</div>
