import { Match, Push_SongFinished, RealtimeScore, Response_ResponseType, TAClient, Tournament } from 'moons-ta-client';
import dotenv from 'dotenv';

dotenv.config();
type Listener<T> = (event: T) => void;

interface TAClientManagerInterface {
    taConnectedListeners: Listener<{}>[];
    realtimeScoreListeners: Listener<RealtimeScore>[];
    songFinishedListeners: Listener<Push_SongFinished>[];
    failedToCreateMatchListeners: Listener<{}>[];
    matchCreatedListeners: Listener<[Match, Tournament]>[];
    matchUpdatedListeners: Listener<[Match, Tournament]>[];
    matchDeletedListeners: Listener<[Match, Tournament]>[];
    taClient: TAClient | null;
    taClientConnected: boolean;

    subscribeToTAConnected(listener: Listener<{}>): () => void;
    subscribeToRealtimeScores(listener: Listener<RealtimeScore>): () => void;
    subscribeToSongFinished(listener: Listener<Push_SongFinished>): () => void;
    subscribeToFailedToCreateMatch(listener: Listener<{}>): () => void;
    subscribeToMatchCreated(listener: Listener<[Match, Tournament]>): () => void;
    subscribeToMatchUpdated(listener: Listener<[Match, Tournament]>): () => void;
    subscribeToMatchDeleted(listener: Listener<[Match, Tournament]>): () => void;
}

export const TAClientManager = (): TAClientManagerInterface => {
    const taConnectedListeners: Listener<{}>[] = [];
    const realtimeScoreListeners: Listener<RealtimeScore>[] = [];
    const songFinishedListeners: Listener<Push_SongFinished>[] = [];
    const failedToCreateMatchListeners: Listener<{}>[] = [];
    const matchCreatedListeners: Listener<[Match, Tournament]>[] = [];
    const matchUpdatedListeners: Listener<[Match, Tournament]>[] = [];
    const matchDeletedListeners: Listener<[Match, Tournament]>[] = [];
    let taClient: TAClient | null = null;
    let taClientConnected: boolean = false;

    // TA Connected
    const subscribeToTAConnected = (listener: Listener<{}>) => {
        taConnectedListeners.push(listener);
        return () => {
            taConnectedListeners.splice(taConnectedListeners.indexOf(listener), 1);
        }
    };

    const emitTAConnected = () => {
        taConnectedListeners.forEach(listener => listener({}));
        handleEmits();
        setupClient();
    };

    // Realtime Scores
    const subscribeToRealtimeScores = (listener: Listener<RealtimeScore>) => {
        realtimeScoreListeners.push(listener);
        return () => {
            realtimeScoreListeners.splice(realtimeScoreListeners.indexOf(listener), 1);
        }
    };

    const emitRealtimeScore = (event: RealtimeScore) => {
        realtimeScoreListeners.forEach(listener => listener(event));
        handleEmits();
    };

    // Song Finished
    const subscribeToSongFinished = (listener: Listener<Push_SongFinished>) => {
        songFinishedListeners.push(listener);
        return () => {
            songFinishedListeners.splice(songFinishedListeners.indexOf(listener), 1);
        }
    };

    const emitSongFinished = (event: Push_SongFinished) => {
        songFinishedListeners.forEach(listener => listener(event));
        handleEmits();
    };

    // Failed to Create Match
    const subscribeToFailedToCreateMatch = (listener: Listener<{}>) => {
        failedToCreateMatchListeners.push(listener);
        return () => {
            failedToCreateMatchListeners.splice(failedToCreateMatchListeners.indexOf(listener), 1);
        }
    };

    const emitFailedToCreateMatch = () => {
        failedToCreateMatchListeners.forEach(listener => listener({}));
        handleEmits();
    };

    // Match Created
    const subscribeToMatchCreated = (listener: Listener<[Match, Tournament]>) => {
        matchCreatedListeners.push(listener);
        return () => {
            matchCreatedListeners.splice(matchCreatedListeners.indexOf(listener), 1);
        }
    };

    const emitMatchCreated = (event: [Match, Tournament]) => {
        matchCreatedListeners.forEach(listener => listener(event));
        handleEmits();
    };

    // Match Updated
    const subscribeToMatchUpdated = (listener: Listener<[Match, Tournament]>) => {
        matchUpdatedListeners.push(listener);
        return () => {
            matchUpdatedListeners.splice(matchUpdatedListeners.indexOf(listener), 1);
        }
    };

    const emitMatchUpdated = (event: [Match, Tournament]) => {
        matchUpdatedListeners.forEach(listener => listener(event));
        handleEmits();
    };

    // Match Deleted
    const subscribeToMatchDeleted = (listener: Listener<[Match, Tournament]>) => {
        matchDeletedListeners.push(listener);
        return () => {
            matchDeletedListeners.splice(matchDeletedListeners.indexOf(listener), 1);
        }
    };

    const emitMatchDeleted = (event: [Match, Tournament]) => {
        matchDeletedListeners.forEach(listener => listener(event));
        handleEmits();
    };

    function setupClient() {
        const client = new TAClient();
        client.setAuthToken(process.env.TA_BOT_TOKEN!);
        let isMounted = true;

        const setupTAClient = async () => {
            try {
                const connectResponse = await client.connect('server.tournamentassistant.net', '8676');
                if (!isMounted) return;

                if (connectResponse.type !== Response_ResponseType.Success && connectResponse.details.oneofKind === 'connect') {
                    console.error(connectResponse.details.connect.reason);
                };

                const tournaments = client.stateManager.getTournaments();
                const selectedTournament = tournaments.find(x => x.settings?.tournamentName === process.env.TOURNAMENT_NAME);

                if (!selectedTournament) {
                    console.error(`Could not find tournament with name ${process.env.TOURNAMENT_NAME}`);
                    return;
                };

                const joinResponse = await client.joinTournament(selectedTournament.guid);
                if (!isMounted) return;

                if (joinResponse.type !== Response_ResponseType.Success && joinResponse.details.oneofKind === 'join') {
                    console.error(joinResponse.details.join.reason);
                };

                taClient = client;

                taClientConnected = true;
                emitTAConnected();
            } catch (error) {
                console.error('Error with setting up TAClient:', error);
            }
        };

        setupTAClient();

        return () => {
            isMounted = false;
            client.disconnect();
            taClientConnected = false;
        }
    }

    const handleEmits = () => {
        if (taClientConnected && taClient) {
            const handleRealtimeScore = (score: RealtimeScore) => {
                emitRealtimeScore(score);
            };
            taClient.on('realtimeScore', handleRealtimeScore);

            const handleSongFinished = (songFinished: Push_SongFinished) => {
                emitSongFinished(songFinished);
            };
            taClient.on('songFinished', handleSongFinished);

            const handleFailedToCreateMatch = () => {
                emitFailedToCreateMatch();
            };
            taClient.on('failedToCreateMatch', handleFailedToCreateMatch);

            const handleMatchCreated = (matchInfo: [Match, Tournament]) => {
                emitMatchCreated(matchInfo);
            };
            taClient.stateManager.on('matchCreated', handleMatchCreated);

            const handleMatchUpdated = (matchInfo: [Match, Tournament]) => {
                emitMatchUpdated(matchInfo);
            };
            taClient.stateManager.on('matchUpdated', handleMatchUpdated);

            const handleMatchDeleted = (matchInfo: [Match, Tournament]) => {
                emitMatchDeleted(matchInfo);
            };
            taClient.stateManager.on('matchDeleted', handleMatchDeleted);

            return () => {
                taClient?.removeListener('realtimeScore', handleRealtimeScore);
                taClient?.removeListener('songFinished', handleSongFinished);
                taClient?.removeListener('failedToCreateMatch', handleFailedToCreateMatch);
                taClient?.stateManager.removeListener('matchCreated', handleMatchCreated);
                taClient?.stateManager.removeListener('matchUpdated', handleMatchUpdated);
                taClient?.stateManager.removeListener('matchDeleted', handleMatchDeleted);
            };
        }
    }

    return { 
        taConnectedListeners,
        realtimeScoreListeners,
        songFinishedListeners,
        failedToCreateMatchListeners,
        matchCreatedListeners,
        matchUpdatedListeners,
        matchDeletedListeners,
        taClient,
        taClientConnected,
        subscribeToTAConnected,
        subscribeToRealtimeScores,
        subscribeToSongFinished,
        subscribeToFailedToCreateMatch,
        subscribeToMatchCreated,
        subscribeToMatchUpdated,
        subscribeToMatchDeleted
    }
}