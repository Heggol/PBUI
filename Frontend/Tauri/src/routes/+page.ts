import type { Playlist } from '$lib/types.ts';
import { invoke } from '@tauri-apps/api/core';

export const load = async () => {
    try {
        const playlists = await invoke<Playlist[]>('get_playlists');
        return {
            playlists
        };
    } catch (error) {
        console.error('Failed to load playlists:', error);
        return {
            playlists: []
        };
    }
};