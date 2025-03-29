<script lang="ts">
	import '../app.css';
	import TopBar from '$lib/components/TopBar.svelte';
	import { handleThemeChange } from '$lib/ThemeChange.svelte';
	import { theme } from '$lib/stores/theme';
	import { get } from 'svelte/store';

	const initialTheme = get(theme);
	handleThemeChange(initialTheme);
</script>

<div class="SiteContainer">
	<TopBar />
	<main class="container">
		<slot />
	</main>
	<footer>
		<div class="copyright">
			<p>PBUI  Copyright (C) 2025 Heggo, Ultraslayyy</p>
		</div>
	</footer>
</div>

<style>
	.SiteContainer {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	.SiteContainer main {
		flex: 1;
		padding-top: 70px;
	}
	main {
		flex: 1;
		padding-top: 70px;
	}
	.container {
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
	.copyright {
		text-align: center;
		width: 100%;
        max-width: 1200px;
        height: 20%;
        max-height: 20%;
        margin: 0 auto;
        padding: 0 1.5rem;
	}
	footer {
		color: var(--text-primary-color);
		padding: 2rem 0 1rem;
        background-color: var(--surface-alt-color);
		
	}
</style>
