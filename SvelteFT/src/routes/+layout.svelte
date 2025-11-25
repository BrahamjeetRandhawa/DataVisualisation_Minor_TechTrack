<script>
	import Airplane from '$lib/assets/Airplane.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={Airplane} />
</svelte:head>

{@render children()}
