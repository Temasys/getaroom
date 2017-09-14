/**
 * The app keys and environment configuration object.
 * @attribute Constants
 * @type JSON
 * @public
 */
define([], function() {
  return {

    /**
     * The list of app states.
     * @property Constants.AppState
     * @param {String} FOYER   The state when app is in the foyer.
     * @param {String} IN_ROOM The state when app is connected to the Room.
     * @type JSON
     */
    AppState: {
      FOYER: 'foyer',
      IN_ROOM: 'in_room'
    },

    /**
     * The list of Room states.
     * @property Constants.RoomState
     * @param {String} IDLE             The state when self is not connected.
     * @param {String} LOADING          The state when self is initialising app.
     * @param {String} LOAD_ERROR       The state when self failed to initialise app.
     * @param {String} CONNECTING       The state when self is connecting to the Room.
     * @param {String} RECONNECTING     The state when self is reconnecting after failing to connect to the Room. 
     * @param {String} CONNECTION_ERROR The state when self failed to connect to the Room.
     * @param {String} CONNECTED        The state when self is connected to the Room (or to the MCU).
     * @param {String} DISCONNECTED     The state when self is disconnected from the Room.
     * @param {String} LOCKED           The state when self is rejected from the Room.
     * @type JSON
     */
    RoomState: {
      IDLE: 'Not Connected',
      LOADING: 'Initializing',
      LOAD_ERROR: 'Failed initializing',
      CONNECTING: 'Connecting',
      RECONNECTING: 'Reconnecting',
      CONNECTION_ERROR: 'Failed connecting',
      CONNECTED: 'Connected',
      DISCONNECTED: 'Disconnected',
      LOCKED: 'Room is locked'
    },

    /**
     * The list of message types.
     * @property Constants.MessageType
     * @param {String} MESSAGE The message is a chat message item.
     * @param {String} ACTION  The message is an action message item.
     * @type JSON
     */
    MessageType: {
      MESSAGE: 0,
      ACTION: 1
    }
  };
});
