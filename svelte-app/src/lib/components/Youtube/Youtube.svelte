<script lang="ts">
	const API = 'AIzaSyBEes-owCgponHK68ZO7za_eLQx0s3-um4';

	async function fetchYoutubeMetadata(videoID: string, apiKey: string) {
		const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,player,contentDetails&id=${videoID}&key=${apiKey}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Fetch Youtube error: ${response.status}`);
		}

		const data = await response.json();
		const video = data.items?.[0];

		if (!video) {
			throw new Error('Video not found');
		}

		console.log(video);

		return {
			snippets: video.snippet,
			contentDetails: video.contentDetails,
			player: video.player
		};
	}

	let youtubeURL = $state('');
	let title = $state('');
	let description = $state('');
	let channelTitle = $state('');
	let thumbnails = $state('');
	let duration = $state(0);
	let player = $state('');
</script>

<input
	onchange={async () => {
		const video = await fetchYoutubeMetadata(youtubeURL, API);
		const { snippets, contentDetails: details, player: vPlayer } = video;
		player = vPlayer;
		title = snippets.title;
		description = snippets.description;
		thumbnails = snippets.thumbnails.standard.url;
		duration = details.duration;
		channelTitle = snippets.channelTitle;
	}}
	class="input"
	type="text"
	bind:value={youtubeURL}
/>

<div class="card">
	<div></div>

	<figure>
		<img src={thumbnails} alt="" />
	</figure>

	thumb: {thumbnails}

	<div class="aspect-video w-full">
		<iframe
			class="w-full"
			src="https://www.youtube.com/embed/vIzopZRbMso?si=Gi26b7n5kpxPLtz5"
			{title}
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
	</div>

	<div class="card-body">
		<h2 class="card-title">{title}</h2>

		<div>channel: {channelTitle}</div>
		<div>duration: {duration}</div>
		<div>description: {description}</div>
	</div>
</div>
