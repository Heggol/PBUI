
export function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }
}