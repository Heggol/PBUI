import { io } from "socket.io-client";

class PBUI {
    constructor() {
        this.socket = null;
        this.apiBaseURL = 'https://api.pbui.net';
        this.listeners = {};
        this.state = new PBUIState();
    }

    connect(url, options = {}) {
        if (!url) {
            url = this.apiBaseURL;
        }

        console.log('Listeners:', this.listeners);

        if (this.socket) {
            console.warn('[PBUI] I am already connected to a WebSocket.');
            return;
        }

        this.socket = io(url, {
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 5000,
            ...options
        });

        this.socket.on('connect', () => {
            console.log(`[PBUI] Connected to WebSocket: ${url}`);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn(`[PBUI] Disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (error) => {
            console.error(`[PBUI] Connection error:`, error);
        });

        this.socket.on('initial-state', (data) => {
            this.triggerListeners('initial-state', data);
        });

        this.socket.on('state-updated', (data) => {
            this.triggerListeners('state-updated', data);
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('[PBUI] WebSocket disconnected.');
        }
    }

    on(event, callback) {
        if (!this.socket) {
            console.error('[PBUI] Not connected to WebSocket.');
            return;
        }
        this.socket.on(event, callback);
    }

    send(event, data) {
        if (!this.socket) {
            console.error('[PBUI] Not connected to WebSocket.');
            return;
        }
        this.socket.emit(event, data);
    }

    subscribe(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        console.log(`[PBUI] Subscribed to event: ${event}`);
    }

    triggerListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(data));
        }
    }

    // REST API

    setApiBase(url) {
        this.apiBaseURL = url;
    }
}

class PBUIState {
    constructor() {
        this.data = {};
        this.listeners = {};
        this.apiBaseURL = 'https://api.pbui.net/api';
    }

    internalUpdate(key, value) {
        this.data[key] = value;

        // Notify Subscribers example
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    }

    async update(songStates, currentFlowStep) {
        const url = `${this.apiBaseURL}/update`;

        const body = {
            songStates: songStates,
            currentFlowStep: currentFlowStep,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`[PBUI] HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            return data.success;
        } catch (error) {
            console.error('[PBUI] Failed to update state:', error);
            throw error;
        }
    }

    async get(key) {
        if (key === 'initial-state' && !this.data[key]) {
            console.log('[PBUI] Fetching initial state...');

            try {
                const response = await fetch(`${this.apiBaseURL}/state`);

                if (!response.ok) {
                    throw new Error(`[PBUI] HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                console.log('[PBUI] Initial state fetched:', data);
                this.internalUpdate(key, data);

                return data;
            } catch (error) {
                console.error('[PBUI] Failed to fetch initial state:', error);
                throw error;
            }
        }

        return this.data[key];
    }

    async reset() {
        const url = `${this.apiBaseURL}/reset`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`[PBUI] HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log(`[PBUI] State successfully reset!`);
            return data.success;
        } catch (error) {
            console.error('[PBUI] Error reseting state:', error);
            throw error;
        }
    }
}

export { PBUI };
export default PBUI;