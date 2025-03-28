import { io } from 'socket.io-client';

class PBUI {
    constructor() {
        this.socket = null;
        this.apiBaseURL = 'https://api.pbui.net';
        this.listeners = {};
        this.state = new PBUIState(this.apiBaseURL);
        this.reconnectionAttempts = 0;
        this.heartbeatInterval = null;
        this.connecting = false;
        this.connectionPromise = null;
        this.manualDisconnect = false;
    }

    async connect(url, options = {}) {
        if (url) {
            this.setApiBase(url);
        }

        this.connecting = true;
        this.connectionPromise = new Promise(async (resolve, reject) => {
            if (this.socket) {
                console.warn('[PBUI] Already connected to a WebSocket. Disconnecting first...');
                this.manualDisconnect = true;
                await this.disconnect();
            }

            this.socket = io(this.apiBaseURL, {
                transports: ['websocket'],
                secure: true,
                rejectUnauthorized: false,
                reconnection: false,
                timeout: 5000,
                ...options
            });

            this.socket.once('connect', () => {
                console.log(`[PBUI] Connected to WebSocket: ${this.apiBaseURL}`);
                this.connecting = false;
                this.reconnectionAttempts = 0;
                this.startHeatbeat();
                resolve();
            });

            this.socket.once('connect_error', (error) => {
                console.warn(`[PBUI] Connection Error: ${error}`);
                if (!this.connecting) {
                    this.reconnect(this.apiBaseURL);
                }
                reject(error);
            });
        });

        this.setupEventHandlers();
        return this.connectionPromise;
    }

    async ensureConnected() {
        if (this.connecting) await this.connectionPromise;
        if (!this.socket.connected) throw new Error('[PBUI] Websocket not connected. Call connect() first.');
    }

    setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on('disconnect', (reason) => {
            console.warn(`[PBUI] Disconnected: ${reason}`);
            this.cleanupSocket();
            if (!this.manualDisconnect) {
                this.reconnect(this.apiBaseURL);
            } else {
                this.manualDisconnect = false;
            }
        });

        this.socket.on('initial-state', (data) => {
            this.triggerListeners('initial-state', data);
        });

        this.socket.on('state-updated', (data) => {
            this.triggerListeners('state-updated', data);
        })
    }

    startHeatbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('ping');
            }
        }, 30000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    reconnect() {
        if (this.reconnectionAttempts >= 10 || this.connecting) {
            console.error('[PBUI] Max reconnection attempts reached or already reconnecting.');
            return;
        }
        this.connecting = true;

        let delay = Math.min(1000 * (2 ** this.reconnectionAttempts), 30000);
        this.reconnectionAttempts++;

        console.log(`[PBUI] Reconnecting in ${delay / 1000} seconds...`);
        setTimeout(() => {
            this.connect(this.apiBaseURL).finally(() => { this.connecting = false; });
        }), delay;
    }

    async disconnect() {
        if (!this.socket) {
            console.log(`[PBUI] WebSocket is not connected. Please connect before disconnecting.`);
            return;
        }

        this.manualDisconnect = true;

        this.stopHeartbeat();
        return new Promise((resolve) => {
            this.socket.once('disconnect', () => {
                this.cleanupSocket();
                console.log('[PBUI] WebSocket fully disconnected.');
                resolve();
            });
            this.socket.disconnect();
        })
    }

    cleanupSocket() {
        if (this.socket) {
            this.socket.off();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    async on(event, callback) {
        await this.ensureConnected();

        if (!this.socket) {
            console.error('[PBUI] Not connected to WebSocket.');
            return;
        }
        this.socket.on(event, callback);
    }

    async send(event, data) {
        await this.ensureConnected();

        if (!this.socket) {
            console.error('[PBUI] Not connected to WebSocket.');
            return;
        }
        this.socket.emit(event, data);
    }

    async subscribe(event, listener) {
        await this.ensureConnected();

        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        if (!this.listeners[event].includes(listener)) {
            this.listeners[event].push(listener);
            console.log(`[PBUI] Subscribed to event: ${event}`);
        }
    }

    triggerListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(data));
        }
    }

    setApiBase(url) {
        this.apiBaseURL = url;
    }
}

class PBUIState {
    constructor(apiBaseURL) {
        this.data = {};
        this.listeners = {};
        this.apiBaseURL = `${apiBaseURL}/api` || 'https://api.pbui.net/api';
        this.defaultHeaders = { 'Content-Type': 'application/json' };
    }

    internalUpdate(key, value) {
        if (!this.valueEqual(this.data[key], value)) {
            this.data[key] = value;
            if (this.listeners[key]) {
                this.listeners[key].forEach(callback => callback(value));
            }
        }
    }

    valueEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key)) return false;

            if (!this.valueEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    }

    async fetchData(endpoint, method = 'GET', body = null) {
        const url = `${this.apiBaseURL}${endpoint}`;
        const options = {
            method,
            headers: this.defaultHeaders,
            ...(body && { body: JSON.stringify(body) })
        };

        try {
            console.log(url, options);
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`[PBUI] HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`[PBUI] Failed to fetch ${endpoint}`);
            throw error;
        }
    }

    async get(key = 'state') {
        if (key === 'state') {
            console.log('[PBUI] Fetching state...');
            const data = await this.fetchData('/state');
            this.internalUpdate(key, data);
            console.log(`[PBUI] State fetched:`, data);
            return data;
        }
        return this.data[key];
    }

    async update(songStates, currentFlowStep) {
        if (typeof songStates !== 'object' || songStates === null) {
            throw new Error('[PBUI] Invalid songStates: Must be an object.');
        }
        if (!Object.keys(songStates).length) {
            throw new Error('[PBUI] songStates should not be empty.');
        }
        if (typeof currentFlowStep !== 'number' || isNaN(currentFlowStep)) {
            throw new Error('[PBUI] Invalid flowStep: Must be a number.');
        }

        const body = { song_states: songStates, current_flow_step: currentFlowStep };
        const data = await this.fetchData('/update', 'POST', body);
        return data.success;
    }

    async reset() {
        console.log('[PBUI] Resetting state...');
        const data = await this.fetchData('/reset', 'POST');
        console.log('[PBUI] State successfully reset!');
        return data.success;
    }
}

export { PBUI };
export default PBUI;