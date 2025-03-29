<script lang="ts">
    import { onMount } from 'svelte';
    import { theme } from '$lib/stores/theme';
</script>

<script context="module" lang="ts">
export function handleThemeChange(currentTheme: string) {
    onMount(() => {
        const handleChange = () => {
            if (currentTheme === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', isDark);
            } else {
                document.documentElement.classList.toggle('dark', currentTheme === 'dark');
            }
        };
        
        handleChange();
        
        const unsubscribe = theme.subscribe((value) => {
            currentTheme = value;
            handleChange();
        });
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = () => {
            if (currentTheme === 'system') {
                document.documentElement.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            unsubscribe();
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    });
}
</script>
