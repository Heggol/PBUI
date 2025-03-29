import { writable } from "svelte/store";
import { browser } from "$app/environment";

type Theme = "light" | "dark" | "system";

const getInitialTheme = (): Theme => {
    if (!browser) return "system";

    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) return savedTheme;

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
}

export const theme = writable<Theme>(getInitialTheme());

if (browser) {
    theme.subscribe(value => {
        localStorage.setItem("theme", value);
        
        if (value === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", isDark);
        } else {
            document.documentElement.classList.toggle("dark", value === "dark");
        }
    });
}