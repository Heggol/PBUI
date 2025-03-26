export interface Song_State {
    status: string;
    player: number;
    step: number;
    name: string
}

export interface Song_States {
    [bsr: string]: Song_State;
}

export interface FlowStep {
    label: string;
    player: number;
    action: string;
}

export interface PBState {
    song_states: Song_States;
    current_flow_step: number;
}