/** @jsx React.DOM */

define([
// Modules to load
  'react',
  'router',
  'skylink',
  'constants',
  'configs',
  'utils',
  'components/userareas',
  'components/controls',
  'components/chat'

], function (
  React,
  Router,
  Skylink,
  Constants,
  Configs,
  Utils,
  UserAreas,
  Controls,
  Chat

) {

  /**
   * The app Skylink object instance.
   * @attribute skylink
   * @type Skylink
   * @global
   */
  window.skylink = Skylink;

  /**
   * The entire app component.
   * @class App
   */
  var App = React.createClass({

    /**
     * Handles the state when self is in foyer (init: app.com/).
     * @method enterFoyer
     * @for App
     */
    enterFoyer: function() {
      var app = this;

      app.state.state = Constants.AppState.FOYER;
      app.state.room.status = Constants.RoomState.IDLE;
      app.state.room.screensharing = false;
      app.state.room.messages = [];
      app.state.show.controls = true;

      app.setState(app.state);
    },

    /**
     * Handles the state when self is retrieving the list of available stream track sources.
     * @method fetchStreamSources
     * @for App
     */
    fetchStreamSources: function (fn) {
      var app = this;

      if (navigator.mediaDevices && typeof navigator.mediaDevices === 'object' &&
        typeof navigator.mediaDevices.enumerateDevices === 'function') {
        navigator.mediaDevices.enumerateDevices().then(fn);

      } else if (window.MediaStreamTrack && typeof window.MediaStreamTrack.getSources === 'function') {
        MediaStreamTrack.getSources(fn);

      // Spoof to just retrieve audio and video tracks if possible
      } else {
        fn([{ kind: 'videoinput' }, { kind: 'audioinput' }]);
      }
    },

    /**
     * Handles the state when self is retrieving stream.
     * @method fetchStream
     * @for App
     */
    fetchStream: function (fn) {
      var app = this;

      app.fetchStreamSources(function (sources) {
        var audioSources = false;
        var videoSources = false;
        var index = 0;

        while (index < sources.length) {
          audioSources = ['audio', 'audioinput'].indexOf(sources[index].kind) > -1 || audioSources;
          videoSources = ['video', 'videoinput'].indexOf(sources[index].kind) > -1 || videoSources;
          index++;
        }

        switch (window.location.searchParameters.media) {
          case 'a':
            videoSources = false;
            break;
          case 'v':
            audioSources = false;
            break;
          case 'none':
            audioSources = false;
            videoSources = false;
        }

        if (!audioSources && !videoSources) {
          return fn();
        }

        Skylink.getUserMedia({
          audio: audioSources ? { stereo: true, echoCancellation: true } : false,
          video: videoSources
        }, fn);
      });
    },

    /**
     * Handles the state when self is joining to the Room (init: app.com/roomName).
     * @method enterFoyer
     * @for App
     */
    joinRoom: function(room) {
      var app = this;

      if(!room) {
        return;
      }

      room = room.toString();

      app.state.state = Constants.AppState.IN_ROOM;
      app.state.room.status = Constants.RoomState.IDLE;
      app.state.room.states.screensharing = false;
      app.state.room.flags.mcu = ['1', 'true'].indexOf(window.location.searchParameters.mcu) > -1;
      app.state.room.flags.forceTurn = ['1', 'true'].indexOf(window.location.searchParameters.forceTurn) > -1;
      app.state.show.controls = true;
      app.state.users.self.name = 'User ' + (new Date ()).getTime();

      app.setState(app.state);

      var config = {
        appKey: window.location.searchParameters.appkeyId || (app.state.room.flags.mcu ? Configs.Skylink.apiMCUKey : Configs.Skylink.apiNoMCUKey),
        defaultRoom: room,
        forceTURN: !app.state.room.flags.mcu && app.state.room.flags.forceTurn,
        useEdgeWebRTC: true,
        socketTimeout: 7500,
        usePublicSTUN: false,
        throttleIntervals: {
          shareScreen: 0,
          getUserMedia: 0,
          refreshConnection: 0
        },
        socketServer: window.location.searchParameters.signalingNode || null,
        iceServer: window.location.searchParameters.turnNode || null
      };

      if (window.location.searchParameters.appkeyId && window.location.searchParameters.appkeySecret) {
        var duration = 24;
        var start = (new Date ()).toISOString();

        config.credentials = {
          duration: duration,
          startDateTime: start,
          credentials: encodeURIComponent(CryptoJS.HmacSHA1(config.defaultRoom + '_' + duration + '_' + start,
            window.location.searchParameters.appkeySecret).toString(CryptoJS.enc.Base64))
        };
      }

      Skylink.init(config, function(err) {
        if (err) return;

        app.fetchStream(function () {
          Skylink.joinRoom({
            userData: {
              name: app.state.users.self.name,
              screensharing: false
            }
          });
        })
      });
    },

    /**
     * Handles the state to toggle controls.
     * @method handleShowControls
     * @for App
     */
    handleShowControls: function(e) {
      Dispatcher.toggleControls();
    },

    /**
     * Handles the parsing of user info.
     * @method parseUserInfo
     * @param {JSON} [peerInfo] The Peer information.
     * @for App
     */
    parseUserInfo: function (peerInfo, peerId) {
      peerInfo = peerInfo || {};
      peerInfo.settings = peerInfo.settings || {};
      peerInfo.userData = peerInfo.userData || {};

      return {
        name: peerInfo.userData.name || 'User ' + (peerId || (new Date()).getTime()),
        priority: peerInfo.userData.priority || 0,
        audio: peerInfo.settings.audio ? {
          muted: peerInfo.mediaStatus.audioMuted
        } : false,
        video: peerInfo.settings.video ? {
          muted: peerInfo.mediaStatus.videoMuted,
          screensharing: typeof peerInfo.settings.video === 'object' &&
            peerInfo.settings.video && peerInfo.settings.video.screenshare
        } : false
      };
    },

    getInitialState: function() {
      var app = this;

      return {
        state: Constants.AppState.FOYER,
        show : {
          controls: true,
          chat: true
        },
        room: {
          status: Constants.RoomState.IDLE,
          statusError: '',
          states: {
            locked: false,
            recording: false,
            recordingTimer: null,
            mcuServerId: null,
            mcuRestart: false,
            screensharing: false
          },
          flags: {
            mcu: false,
            forceTurn: false
          },
          prevent: {
            screensharing: false,
            recording: false
          },
          messages: []
        },
        users: {
          self: app.parseUserInfo({})
        }
      };
    },

    componentWillMount: function() {
      var app = this;

      // Read more on Skylink API from docs here: https://cdn.temasys.io/skylink/skylinkjs/0.6.x/doc/classes/Skylink.html
      // This sets the Web Console log levels.
      Skylink.setLogLevel(Skylink.LOG_LEVEL.DEBUG);

      // Handles initialisation states like if required modules have been loaded successfully or app key is valid.
      Skylink.on('readyStateChange', function (state, error) {
        switch (state) {

          case Skylink.READY_STATE_CHANGE.INIT:
            app.state.room.status = Constants.RoomState.IDLE;
            app.state.room.statusError = '';
            break;

          case Skylink.READY_STATE_CHANGE.LOADING:
            app.state.room.status = Constants.RoomState.LOADING;
            app.state.room.statusError = '';
            break;

          case Skylink.READY_STATE_CHANGE.COMPLETED:
            app.state.room.status = Constants.RoomState.CONNECTING;
            app.state.room.statusError = '';
            break;

          default:
            var errorMessage = (error || {}).content;

            if (errorMessage instanceof Error) {
              errorMessage = errorMessage.message;
            }

            app.state.room.status = Constants.RoomState.LOAD_ERROR;
            app.state.room.statusError = errorMessage || 'Unknown Error';
        
        }

        app.setState(app.state);
      });

      // Handles when self is rejected from the Room.
      Skylink.on('systemAction', function(action, serverMessage, reason) {
        switch (action) {

          case Skylink.SYSTEM_ACTION.REJECT:
            app.state.room.status = Constants.RoomState.CONNECTION_ERROR;
            app.state.room.statusError = serverMessage;
            app.state.room.states.locked = reason === reason === Skylink.SYSTEM_ACTION_REASON.ROOM_LOCKED;
            app.state.show.controls = true;
            Skylink.stopStream();
            break;

          default:
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Warning: ' + (serverMessage.message || serverMessage),
              date: (new Date()).toISOString()
            });

        }

        app.setState(app.state);
      });

      // Handles when socket connection to signaling server fails.
      // Signaling server connection is required to start connection to the Room.
      Skylink.on('socketError', function (state) {
        switch (state) {

          case Skylink.SOCKET_ERROR.RECONNECTION_ABORTED:
          case Skylink.SOCKET_ERROR.CONNECTION_ABORTED:
            app.state.room.status = Constants.RoomState.CONNECTION_ERROR;
            break;
          
          case Skylink.SOCKET_ERROR.RECONNECTION_ATTEMPT:
            app.state.room.status = Constants.RoomState.RECONNECTING;
            break;

        }

        app.setState(app.state);
      });

      // Handles when socket connection to signaling server encounters app UI exception.
      Skylink.on('channelError', function (error) {
        app.state.room.messages.push({
          userId: 'getaroom.io',
          type: Constants.MessageType.ACTION,
          content: 'Error: ' + (error.message || error),
          date: (new Date()).toISOString()
        });

        app.setState(app.state);
      });

      // Handles when MCU is connected to the Room.
      Skylink.on('serverPeerJoined', function (peerId, peerType) {
        switch (peerType) {

          case Skylink.SERVER_PEER_TYPE.MCU:
            app.state.room.states.mcuServerId = peerId;
            app.state.room.states.mcuRestart = false;

        }

        app.setState(app.state);
      });

      // Handles when MCU has restarted connection.
      Skylink.on('serverPeerRestart', function (peerId, peerType) {
        switch (peerType) {

          case Skylink.SERVER_PEER_TYPE.MCU:
            app.state.room.states.mcuRestart = true;

        }

        app.setState(app.state);
      });

      // Handles when MCU is disconnected from the Room.
      Skylink.on('serverPeerLeft', function (peerId, peerType) {
        switch (peerType) {

          case Skylink.SERVER_PEER_TYPE.MCU:
            app.state.room.states.mcuServerId = null;

        }

        app.setState(app.state);
      });

      // Handles when a new Peer is connected to the Room.
      Skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
        app.state.users[isSelf ? 'self' : peerId] = app.parseUserInfo(peerInfo, peerId);

        if (isSelf) {
          app.state.room.status = Constants.RoomState.CONNECTED;
          app.state.users.self.connected = true;
        }

        app.state.room.messages.push({
          userId: isSelf ? 'self' : peerId,
          type: Constants.MessageType.ACTION,
          content: 'Has joined the room',
          date: (new Date()).toISOString()
        });

        app.setState(app.state);
      });

      // Handles when a Peer has updated user info.
      Skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
        if (!app.state.users[isSelf ? 'self' : peerId]) {
          return;
        }

        var userInfo = app.parseUserInfo(peerInfo, peerId);

        app.state.users[isSelf ? 'self' : peerId].name = userInfo.name;
        app.state.users[isSelf ? 'self' : peerId].priority = userInfo.priority;
        app.state.users[isSelf ? 'self' : peerId].audio = userInfo.audio;
        app.state.users[isSelf ? 'self' : peerId].video = userInfo.video;

        app.setState(app.state);
      });

      // Handles when a Peer has disconnected from the Room.
      Skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
        if (!app.state.users[isSelf ? 'self' : peerId]) {
          return;
        }

        app.state.room.messages.push({
          userId: isSelf ? 'self' : peerId,
          type: Constants.MessageType.ACTION,
          content: 'Has left the room',
          date: (new Date()).toISOString()
        });

        app.setState(app.state);

        if (isSelf) {
          app.state.users.self.connected = false;
          app.state.room.status = app.state.room.states.mcuRestart ?
            Constants.RoomState.RECONNECTING : Constants.RoomState.DISCONNECTED;
      
        } else {
          delete app.state.users[peerId];
          app.setState(app.state);
        }

        Dispatcher.setScreen();
      });

      // Handles when stream fails to load.
      Skylink.on('mediaAccessError', function (error, isScreensharing) {
        app.state.room.messages.push({
          userId: 'getaroom.io',
          type: Constants.MessageType.ACTION,
          content: (isScreensharing ? 'Screen' : 'Media') + ': ' + (error.message || error),
          date: (new Date()).toISOString()
        });

        if (isScreensharing) {
          app.state.room.prevent.screensharing = false;
        }

        app.setState(app.state);
      });

      // Handles when stream loads.
      Skylink.on('mediaAccessSuccess', function (stream, isScreensharing) {
        app.state.room.messages.push({
          userId: 'getaroom.io',
          type: Constants.MessageType.ACTION,
          content: (isScreensharing ? 'Screen' : 'Media') + ': Access has been granted',
          date: (new Date()).toISOString()
        });

        if (isScreensharing) {
          app.state.room.prevent.screensharing = false;
        }

        app.setState(app.state);
      });

      // Handles when Peer's ICE connection state changes.
      Skylink.on('iceConnectionState', function(state, peerId) {
        if (!app.state.users[peerId] && !(peerId === app.state.room.states.mcuServerId)) {
          return;
        }

        switch (state) {

          case Skylink.ICE_CONNECTION_STATE.CONNECTED:
          case Skylink.ICE_CONNECTION_STATE.COMPLETED:
            if (peerId === app.state.room.states.mcuServerId) {
              app.state.users.self.mcuConnected = true;
            } else {
              app.state.users[peerId].connected = true;
            }
            break;

          default:
            if (peerId === app.state.room.states.mcuServerId) {
              app.state.users.self.mcuConnected = false;
            } else {
              app.state.users[peerId].connected = false;
            }
        }

        app.setState(app.state);
      });

      // Handles when receiving Peer's stream.
      Skylink.on('incomingStream', function(peerId, stream, isSelf, peerInfo, isScreensharing, streamId) {
        if (!app.state.users[isSelf ? 'self' : peerId]) {
          return;
        }

        var userInfo = app.parseUserInfo(peerInfo, peerId);
        
        app.state.users[isSelf ? 'self' : peerId].name = userInfo.name;
        app.state.users[isSelf ? 'self' : peerId].priority = userInfo.priority;
        app.state.users[isSelf ? 'self' : peerId].audio = userInfo.audio;
        app.state.users[isSelf ? 'self' : peerId].video = userInfo.video;
        app.state.users[isSelf ? 'self' : peerId].stream = stream;
        app.state.users[isSelf ? 'self' : peerId].streamId = streamId;

        if(Utils.keys(app.state.users).length >= 2) {
          app.state.show.controls = false;
        }
        
        app.setState(app.state);
        Dispatcher.setScreen();
      });

      // Handles when receiving Peer's message.
      Skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
        app.state.room.messages.push({
          userId: isSelf ? 'self' : peerId,
          type: Constants.MessageType.MESSAGE,
          content: message.content.content,
          date: message.content.date
        });

        app.setState(app.state);
      });

      // Handles the Room locked state change.
      Skylink.on('roomLock', function(locked) {
        app.state.room.states.locked = locked;
        app.setState(app.state);
      });

      // Handles the MCU recording state change.
      Skylink.on('recordingState', function (state, recordingId, link, error) {
        switch (state) {

          case Skylink.RECORDING_STATE.START:
            app.state.room.states.recording = true;
            app.state.room.prevent.recording = true;
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Recording: (ID: ' + recordingId + ')\nStarted for room. Waiting for minium of 10 seconds before enabling',
              date: (new Date()).toISOString()
            });

            // Ensure 10 seconds of recording first.
            app.state.room.states.recordingTimer = setTimeout(function () {
              app.state.room.prevent.recording = false;
              app.state.room.states.recordingTimer = null;
              app.setState(app.state);
            }, 10000);
            break;

          case Skylink.RECORDING_STATE.STOP:
            // Clear away the timer just incase
            if (app.state.room.states.recordingTimer) {
              clearTimeout(app.state.states.room.states.recordingTimer);
              app.state.states.room.states.recordingTimer = null;
            }

            app.state.room.states.recording = false;
            app.state.room.prevent.recording = false;
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Recording: (ID: ' + recordingId + ')\nStopped for room. Video is mixing ....',
              date: (new Date()).toISOString()
            });
            break;

          case Skylink.RECORDING_STATE.LINK:
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Recording: (ID: ' + recordingId + ')\nMixing completed. [Download link](' + link.mixin + ')',
              date: (new Date()).toISOString()
            });
            break;
          
          default:
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Recording: (ID: ' + recordingId + ')\nError. ' + (error.message || error),
              date: (new Date()).toISOString()
            });

        }

        app.setState(app.state);
      });

      /**
       * The module to handle shared methods.
       * @class Dispatcher
       * @public
       */
      Dispatcher = {

        /**
         * Dispatch to display the screensharing state.
         * @method setScreen
         * @for Dispatcher
         */
        setScreen: function () {
          var screensharing = 0;

          Utils.forEach(app.state.users, function (user, userId) {
            if (user.priority > screensharing && user.video && user.video.screensharing) {
              screensharing = user.priority;
            }
          });

          if (app.state.users.self.video && app.state.users.self.video.screensharing && app.state.users.self.priority < screensharing) {
            Skylink.stopScreen();
          }

          if (screensharing && app.state.users.length > 4) {
            app.state.room.messages.push({
              userId: 'getaroom.io',
              type: Constants.MessageType.ACTION,
              content: 'Room: Current screensharing layout scales up to 4 users, and some of the peers ' +
                'might not be displayed due to the layout. Current users count is ' + Utils.keys(app.states.users).length,
              date: (new Date()).toISOString()
            });
          }

          app.state.room.states.screensharing = screensharing > 0;
          app.setState(app.state);
        },

        /**
         * Dispatch to toggle chat box.
         * @method toggleChat
         * @for Dispatcher
         */
        toggleChat: function(state) {
          app.state.show.chat = state !== undefined ? state : !app.state.show.chat;
          app.setState(app.state);
        },

        /**
         * Dispatch to toggle controls
         * @method toggleChat
         * @for Dispatcher
         */
        toggleControls: function(state) {
          if(app.state.room.status === Constants.RoomState.CONNECTED) {
            app.state.show.controls = state !== undefined ? state : !app.state.show.controls;
          }

          app.setState(app.state);
        }
      }
    },

    componentDidMount: function() {
      var app = this;
  
      Router.configure({
        html5history: true
      }).mount({
        '/:room': app.joinRoom.bind(app),
        '/': app.enterFoyer.bind(app)
      });

      Router.init();
    },

    render: function() {
      var app = this;
      var className = '';
      var screensharingSupported = 
        (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) ||
        (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 33) ||
        (AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable);

      if(app.state.show.controls) {
        className = className + 'controls';
      }

      if(app.state.show.chat) {
        className = className + ' chat';
      }

      if (screensharingSupported) {
        className = className + ' enableScreensharing';
      }

      return (
        <div className={className}>
          <div onClick={app.handleShowControls}>
            <UserAreas state={app.state} />
          </div>
          <Controls state={app.state} />
          <Chat state={app.state} />
        </div>
      )
    }
  });

  React.renderComponent(<App />, document.getElementById('app'));
});
