import io from 'socket.io-client';
import { SOCKET_URL } from '../config/index';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        try {
            if (!this.socket) {
                console.log('Attempting to connect to socket server at:', SOCKET_URL, 'with namespace /main');
                this.socket = io(`${SOCKET_URL}/main`, {
                    transports: ['polling', 'websocket'], // Prioritize polling for diagnostics
                    autoConnect: true,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 2000, // Increased delay
                    reconnectionDelayMax: 10000,
                    timeout: 20000 // Standard timeout
                });

                this.socket.on('connect', () => {
                    console.log('Socket connected successfully');
                    this.connected = true;
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                    this.connected = false;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Socket connection error (message):', error.message);
                    // Log full error object properties for more details
                    let errorDetails = {};
                    if (error && typeof error === 'object') {
                        for (const prop of Object.getOwnPropertyNames(error)) {
                            errorDetails[prop] = error[prop];
                        }
                    }
                    console.error('Socket connection error (full details):', JSON.stringify(errorDetails));
                    console.error('Socket connection error (type):', error.type); 
                    console.error('Socket connection error (description):', error.description); 
                    this.connected = false;
                    if (this.socket && this.socket.io && this.socket.io.engine) {
                        console.error('Connection attempt failed with transport:', this.socket.io.engine.transport.name);
                    }
                });

                this.socket.on('reconnect', (attemptNumber) => {
                    console.log('Socket reconnected after', attemptNumber, 'attempts');
                    this.connected = true;
                });

                this.socket.on('reconnect_error', (error) => {
                    console.error('Socket reconnection error:', error.message);
                });

                this.socket.on('error', (error) => {
                    console.error('Socket error:', error);
                });
            }
            return this.socket;
        } catch (error) {
            console.error('Error in socket connection:', error);
            this.connected = false;
            return null;
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket...');
            try {
                this.socket.disconnect();
                console.log('Socket disconnected successfully');
            } catch (error) {
                console.error('Error disconnecting socket:', error);
            } finally {
                this.socket = null;
                this.connected = false;
            }
        }
    }

    joinCompetition(competitionId) {
        if (this.socket && competitionId) {
            this.socket.emit('joinCompetition', competitionId);
        }
    }

    leaveCompetition(competitionId) {
        if (this.socket && competitionId) {
            this.socket.emit('leaveCompetition', competitionId);
        }
    }

    onCompetitionUpdate(callback) {
        if (this.socket) {
            this.socket.on('competitionUpdate', callback);
        }
    }

    onMatchUpdate(callback) {
        if (this.socket) {
            this.socket.on('matchUpdate', callback);
        }
    }

    onTeamUpdate(callback) {
        if (this.socket) {
            this.socket.on('teamUpdate', callback);
        }
    }
}

export default new SocketService();