<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { PicksBansClient } from '$lib/pbclient';

$: songClasses = Object.keys(songStates).reduce((a: any, bsr: string) => {
    a[bsr] = songStates[bsr].status === 'pick' ? 'picked-song' : 'banned-song';
    return a;
}, {});

export let data;
let selectedPlaylist = data.playlists.length > 0 ? data.playlists[0] : null;
//Map pick and ban flow i hardcoded it to bo5 for now
const flow = [{
        label: "Player 1 Pick",
        player: 1,
        action: "pick"
    },
    {
        label: "Player 2 Pick",
        player: 2,
        action: "pick"
    },
    {
        label: "Player 2 Ban",
        player: 2,
        action: "ban"
    },
    {
        label: "Player 1 Ban",
        player: 1,
        action: "ban"
    },
    {
        label: "Player 2 Pick",
        player: 2,
        action: "pick"
    },
    {
        label: "Player 1 Pick",
        player: 1,
        action: "pick"
    },
    {
        label: "Tiebreaker",
        player: 0,
        action: "pick"
    }
];

let currentFlowStep = 0;
let songStates: { [bsr: string]: { status: string; player: number; step: number } } = {};
let history: {
    songStates: any,
    currentFlowStep: number
} [] = []; //undo history
let updateTrigger = 0;

let pbClient: PicksBansClient;

onMount(() => {
    pbClient = new PicksBansClient();

    pbClient.getCurrentState().then(state => {
        if (state) {
            songStates = state.songStates;
            currentFlowStep = state.currentFlowStep;
            updateTrigger++;
        }
    });
});

function getCurrentFlowStep() {
    return flow[currentFlowStep] || null;
}

function isComplete() {
    return currentFlowStep >= flow.length;
}

async function setState(action: string, bsr: string, player: number) {
    if (songStates[bsr]) return;
    //save state for undo
    history.push({
        songStates: { ...songStates },
        currentFlowStep: currentFlowStep
    });
    //reassign to trigger
    history = [...history];

    const step = getCurrentFlowStep();
    if (!step || step.action !== action) {
        return
    };

    //set song state
    songStates = {
        ...songStates,
        [bsr]: {
            status: action,
            player: player,
            step: currentFlowStep
        }
    };
    currentFlowStep++;
    updateTrigger++;

    await pbClient.updateState(songStates, currentFlowStep);
}

function getSongState(bsr: string) {
    return songStates[bsr] || null;
}

async function resetFlow() {
    history.push({
        songStates: { ...songStates },
        currentFlowStep: currentFlowStep
    });
    history = [...history];

    songStates = {};
    currentFlowStep = 0;
    updateTrigger++;
    //reload page to clear everything like pointer events temp disable probably
    //window.location.reload();

    await pbClient.resetState();
}

async function undoAction() {
    if (history.length === 0) {
        return;
    }
    const previousState = history.pop();
    history = [...history];

    if (previousState) {
        songStates =  { ...previousState.songStates };
        currentFlowStep = previousState.currentFlowStep;
        updateTrigger++;
        await pbClient.updateState(songStates, currentFlowStep);
    }
}

function getSongBorderClass(bsr: string) {
    const state = getSongState(bsr);
    if (!state) return '';
    return state.status === 'pick' ? 'picked-song' : 'banned-song';
}

function getSongStatusLabel(bsr: string) {
    const state = getSongState(bsr);
    if (!state) return '';
    return `${state.status === 'pick' ? 'Picked' : 'Banned'} by Player ${state.player}`;
}

</script>

<div class="container">
    {#if data.playlists.length === 0}
    <div class="no-map-pools">
        <p class="no-map-text">No Map Pools found</p>
    </div>
    {:else}
    <div class="select-map-pool">
        <label for="playlist-select" class="select-label">Select a Map Pool</label>
        <select id="playlist-select" bind:value={selectedPlaylist} class="custom-select">
            {#each data.playlists as playlist}
            <option value={playlist} class="option-text"
            on:click={resetFlow}>
                {playlist.playlist_title}
            </option>
            {/each}
        </select>
    </div>

    {#if selectedPlaylist}
    <div class="pb-flow">
        <h2 class="pb-title">P&B Best of 5</h2>

        <div class="steps-container">
            {#each flow as step, index}
            <div class="step-item {index === currentFlowStep ? 'current-step' : ''} {index < currentFlowStep ? 'completed-step' : ''}">
                {step.label}
            </div>
            {/each}
        </div>

        <div class="current-action">
            {#if isComplete()}
            <div class="complete-message">Picks and Bans Complete!</div>
            {:else}
            <div class="action-message">
                Current Action: <strong>{getCurrentFlowStep().label}</strong>
            </div>
            {/if}
        </div>

        <div class="control-buttons">
            <button class="control-btn undo-btn" on:click={undoAction} disabled={history.length === 0}>
                Undo Last Action
            </button>
            <button class="control-btn reset-btn" on:click={resetFlow}>
                Reset All
            </button>
        </div>
    </div>
    <div class="playlist-container">
        <div class="playlist-header">
            <h2 class="playlist-title">
                {selectedPlaylist.playlist_title}
            </h2>
        </div>
        {#if selectedPlaylist.songs.length === 0}
        <div class="no-songs">
            <p class="no-songs-text">No songs in this Map Pool</p>
        </div>
        {:else}
        <div class="songs-list">
            {#each selectedPlaylist.songs as song}
            <!-- Start of song item -->
            <div class="song-item {getSongBorderClass(song.bsr)} {songClasses[song.bsr] || ''}" data-update={updateTrigger} >
                <div class="song-header">
                    <div class="song-header-info">
                        <h3 class="song-name">
                            {song.song_name}
                        </h3>
                        <div class="song-meta">
                            <span>BSR: {song.bsr}</span>
                            <span>Artist: {song.song_artist}</span>
                            <span>Mapper: {song.song_mapper}</span>
                            <span>Upload Date: {song.date_uploaded}</span>
                            {#if getSongState(song.bsr)}
                            <span class="song-status">{getSongStatusLabel(song.bsr)}</span>
                            {/if}
                        </div>
                    </div>
                </div>
                {#if getCurrentFlowStep()}
                <div class="song-actions">
                    {#if getCurrentFlowStep().action === 'pick'}
                    <button
                        class="action-btn pick-btn"
                        on:click={() => setState('pick', song.bsr, getCurrentFlowStep().player)}>
                        Pick
                    </button>
                    {:else if getCurrentFlowStep().action === 'ban'}
                    <button
                        class="action-btn ban-btn"
                        on:click={() => setState('ban', song.bsr, getCurrentFlowStep().player)}>
                        Ban
                    </button>
                    {:else if getCurrentFlowStep().action === 'pick' && getCurrentFlowStep().player === 0}
                    <button
                        class="action-btn tiebreaker-btn"
                        on:click={() => setState('pick', song.bsr, 0)}>
                        Set as Tiebreaker
                    </button>
                    {/if}
                </div>
                {/if}
            </div>
            <!-- End of song item -->
            <div class="song-difficulties">
                {#each song.difficulties as difficulty}
                <div class="difficulty-badge">
                    <span>{difficulty.characteristic}</span>
                    <span class="blue-dot">•</span>
                    <span>{difficulty.name}</span>
                </div>
                {/each}
            </div>
            {/each}
        </div>
        {/if}
    </div>
    {/if}
    {/if}
</div>

<style>
.container {
    margin: 0 auto;
    padding: 2rem 1rem;
    max-width: 56rem;
}

.no-map-pools {
    text-align: center;
    padding: 3rem 0;
}

.no-map-text {
    color: #6B7280;
}

.select-map-pool {
    margin-bottom: 2rem;
}

.select-label {
    display: block;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 0.75rem;
}

.custom-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #E5E7EB;
    border-radius: 0.75rem;
    background-color: #fff;
    transition: all 0.2s ease;
}

.custom-select:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 1px #3B82F6;
}

.option-text {
    color: #374151;
}

.pb-flow {
    background-color: #fff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.pb-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 1.25rem;
    text-align: center;
}

.steps-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    position: relative;
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.steps-container::after {
    content: '';
    position: absolute;
    height: 2px;
    background-color: #E5E7EB;
    top: 50%;
    left: 0;
    right: 0;
    z-index: 1;
}

.step-item {
    padding: 0.5rem 1rem;
    background-color: #fff;
    border: 2px solid #E5E7EB;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6B7280;
    z-index: 2;
    position: relative;
    white-space: nowrap;
    margin: 0 0.25rem;
}

.current-step {
    border-color: #3B82F6;
    color: #3B82F6;
    font-weight: 700;
    background-color: #EFF6FF;
}

.completed-step {
    border-color: #10B981;
    color: #10B981;
    background-color: #ECFDF5;
}

.current-action {
    text-align: center;
    font-size: 1.125rem;
    margin-bottom: 1.25rem;
}

.action-message {
    color: #4B5563;
}

.complete-message {
    color: #10B981;
    font-weight: 600;
}

.control-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.control-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.undo-btn {
    background-color: #E5E7EB;
    color: #4B5563;
    border: none;
}

.undo-btn:hover:not(:disabled) {
    background-color: #D1D5DB;
}

.undo-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reset-btn {
    background-color: #FEE2E2;
    color: #EF4444;
    border: none;
}

.reset-btn:hover {
    background-color: #FECACA;
}

/* Playlist Container Styles */
.playlist-container {
    background-color: #fff;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.playlist-header {
    margin-bottom: 1.5rem;
}

.playlist-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: #1F2937;
    border-bottom: 2px solid currentColor;
    padding-bottom: 0.75rem;
    margin: 0;
}

.no-songs {
    text-align: center;
    padding: 1.5rem 0;
}

.no-songs-text {
    color: #6B7280;
}

.songs-list>*+* {
    margin-top: 1.25rem;
}

.song-item {
    border: 2px solid #F3F4F6;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}


.picked-song{
    border: 3px solid #10B981 !important;
    border-radius: 0.75rem !important;
    padding: 1.25rem !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    background-color: rgba(16, 185, 129, 0.05);
}

.banned-song {
    border: 3px solid #EF4444 !important;
    border-radius: 0.75rem !important;
    padding: 1.25rem !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    background-color: rgba(239, 68, 68, 0.05);
}

.picked-song,
.banned-song,
.picked-song *,
.banned-song * {
    pointer-events: none !important;
    cursor: not-allowed;
}

.song-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.song-header-info {
    flex: 1;
}

.song-name {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 0.25rem;
}

.song-meta {
    font-size: 0.875rem;
    color: #6B7280;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.song-status {
    font-weight: 600;
    color: #4B5563;
}

.song-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.pick-btn {
    background-color: #D1FAE5;
    color: #059669;
}

.pick-btn:hover {
    background-color: #A7F3D0;
}

.ban-btn {
    background-color: #FEE2E2;
    color: #DC2626;
}

.ban-btn:hover {
    background-color: #FECACA;
}

.tiebreaker-btn {
    background-color: #E0E7FF;
    color: #4F46E5;
}

.tiebreaker-btn:hover {
    background-color: #C7D2FE;
}

.song-difficulties {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.difficulty-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    background-color: rgba(219, 234, 254, 0.5);
    border: 1px solid #BFDBFE;
    color: #1E40AF;
    transition: background-color 0.2s ease;
}

.difficulty-badge:hover {
    background-color: rgba(191, 219, 254, 0.5);
}

.blue-dot {
    color: #2563EB;
}
</style>