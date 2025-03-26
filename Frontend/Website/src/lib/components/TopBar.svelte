<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { theme } from '$lib/stores/theme';
    import { get } from 'svelte/store';

    let scrollY = $state(0);
    let isScrolling = $state(false);
    let currentTheme = $state(get(theme));
    
    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            currentTheme = value;
        });
        
        return unsubscribe;
    });
    
    onMount(() => {
        const handleScroll = () => {
            scrollY = window.scrollY;
            isScrolling = scrollY > 20;
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });

    function toggleTheme() {
        theme.set(currentTheme === 'dark' ? 'light' : 'dark');
    }
</script>

<header class:scrolled={isScrolling}>
    <div class="container">
        <div class="statusIndicator">Status indicators</div>
        <nav>
            <ul>
                <li>
                    <a href="/" class:active={page.url.pathname === '/'}>
                        Playlists
                    </a>
                </li>
                <li>
                    <a href="/settings" class:active={page.url.pathname === '/settings'}>
                        Settings
                    </a>
                </li>
            </ul>
        </nav>
        <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
            {#if currentTheme === 'dark'}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            {/if}
        </button>
    </div>
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        width: 100%;
        height: 70px;
        display: flex;
        align-items: center;
        background-color: var(--surface-alt-color);
    }
    header.scrolled {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(20px);
    }
    .container {
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .statusIndicator {
        width: 150px;
        height: 50px;
        border-radius: 50%;
        border-color: var(--primary-color);
        color: var(--text-primary-color);
        z-index: 101;
    }

    nav {
        display: flex;
        align-items: center;
    }

    nav ul {
        display: flex;
        gap: 2.5rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav a {
        color: var(--text-secondary-color);
        text-decoration: none;
        font-weight: 600;
        position: relative;
    }
    
    nav a:hover, nav a.active {
        color: var(--text-primary-color);
    }

    nav a.active::after {
        border-radius: 2rem;
        border-color: var(--primary-color);
    }

    .theme-toggle {
        display: flex;
        align-items: center;
        border: none;
        cursor: pointer;
        background: none;
        color: var(--text-primary-color);
        border-radius: 1rem;
        transition: background-color 0.25s ease;
    }

    .theme-toggle:hover {
        background-color: var(--surface-hover-color);
    }
</style>