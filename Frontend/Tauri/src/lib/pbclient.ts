import { invoke } from '@tauri-apps/api/core';
import type { SongStates, PBState } from './types';

export class PicksBansClient {
    async updateState(songStates: SongStates, currentFlowStep: number): Promise<boolean> {
        try {
            return await invoke<boolean>('update_state', { songStates, currentFlowStep });
        } catch (error) {
            console.error('Failed to update state:', error);
            return false;
        }
    }

    async resetState(): Promise<boolean> {
        try {
            return await invoke<boolean>('reset_state');
        } catch (error) {
            console.error('Failed to reset state:', error);
            return false;
        }
    }

    async getCurrentState(): Promise<PBState | null> {
        try {
            return await invoke<PBState>('get_current_state');
        } catch (error) {
            console.error('Failed to get current state:', error);
            return null;
        }
    }
}
