define([], function() {
    return {
        AppState: {
            FOYER: 'foyer',
            IN_ROOM: 'in_room'
        },
        RoomState: {
            IDLE: 'Not connected',
            CONNECTING: 'Connecting',
            LOCKED: 'Room is locked',
            CONNECTED: 'Connected'
        }
    };
});
