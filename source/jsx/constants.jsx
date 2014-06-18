define([], function() {
    return {
        AppState: {
            FOYER: 'foyer',
            IN_ROOM: 'in_room'
        },
        RoomState: {
            IDLE: 'idle',
            CONNECTING: 'connecting',
            ERROR: 'error',
            CONNECTED: 'connected'
        }
    };
});
