export interface Difficulty {
    name: string,
    characteristic: string,
}

export interface Song {
    hash: string,
    bsr: string,
    song_name: String,
    song_artist: String,
    song_mapper: String,
    date_uploaded: String,
    difficulties: Difficulty[],
}

export interface Playlist {
    playlist_title: string,
    songs: Song[],
}

export interface SongState {
    status: string,
    player: number,
    step: number,
}
export interface SongStates {
    [bsr: string]: SongState,
}

export interface FlowStep {
    label: string;
    player: number;
    action: string;
}

export interface PBState {
    songStates: SongStates,
    currentFlowStep: number,
}
