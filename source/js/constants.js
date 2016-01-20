define([], function() {
  return {
    /**
     * Application states
     */
    AppState: {
      FOYER: 'foyer',
      IN_ROOM: 'in_room'
    },

    /**
     * Room states
     */
    RoomState: {
      IDLE: 'Not Connected',
      LOADING: 'Initializing',
      LOAD_ERROR: 'Failed initializing',
      CONNECTING: 'Connecting',
      RECONNECTING: 'Reconnecting',
      RECONNECTING_ATTEMPT: 'Retrying connection ..',
      CONNECTION_ERROR: 'Failed connecting',
      CONNECTED: 'Connected',
      DISCONNECTED: 'Disconnected',
      LOCKED: 'Room is locked'
    },

    /**
     * Message types
     */
    MessageType: {
      MESSAGE: 0,
      ACTION: 1
    }
  };
});
