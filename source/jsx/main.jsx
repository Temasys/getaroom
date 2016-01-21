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
// How the modules appear after load
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

  window.test = Skylink;

  /**
   * Gets the query string information
   */
  var getQuery = function (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
    }
  };

  /**
   * Hook to allow the actual detection of the browser
   */
  (function () {
    var hasMatch, checkMatch = navigator.userAgent.match(
      /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if (/trident/i.test(checkMatch[1])) {
      hasMatch = /\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [];
      window.webrtcDetectedBrowser = 'IE';
      window.webrtcDetectedVersion = parseInt(hasMatch[1] || '0', 10);
    } else if (checkMatch[1] === 'Chrome') {
      hasMatch = navigator.userAgent.match(/\bOPR\/(\d+)/);
      if (hasMatch !== null) {
        window.webrtcDetectedBrowser = 'opera';
        window.webrtcDetectedVersion = parseInt(hasMatch[1], 10);
      }
    }

    if (navigator.userAgent.indexOf('Safari')) {
      if (typeof InstallTrigger !== 'undefined') {
        window.webrtcDetectedBrowser = 'firefox';
      } else if (/*@cc_on!@*/ false || !!document.documentMode) {
        window.webrtcDetectedBrowser = 'IE';
      } else if (
        Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        window.webrtcDetectedBrowser = 'safari';
      } else if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        window.webrtcDetectedBrowser = 'opera';
      } else if (!!window.chrome) {
        window.webrtcDetectedBrowser = 'chrome';
      }
    }

    if (!webrtcDetectedBrowser) {
      window.webrtcDetectedVersion = checkMatch[1];
    }

    if (!window.webrtcDetectedVersion) {
      try {
        checkMatch = (checkMatch[2]) ? [checkMatch[1], checkMatch[2]] :
          [navigator.appName, navigator.appVersion, '-?'];
        if ((hasMatch = navigator.userAgent.match(/version\/(\d+)/i)) !== null) {
          checkMatch.splice(1, 1, hasMatch[1]);
        }
        window.webrtcDetectedVersion = parseInt(checkMatch[1], 10);
      } catch (error) { }
    }
  })();

  window.test = Skylink;

  /**
   * Configure React App
   */
  var App = React.createClass({

    /*
     * Sets the initial stage when User joins the Room
     */
    getInitialState: function() {
      return {
        // Contains the Room information
        room: {
          id: '',
          messages: [],
          isLocked: false,
          status: Constants.RoomState.IDLE,
          useMCU: false,
          error: '',
          preventScreenshare: true
        },
        // Contains the list of User and Peers
        users: [{
          id: 0,
          name: '',
          stream: null,
          renderStreamId: null,
          audioMute: false,
          videoMute: false,
          screensharing: false
        }],
        // Current Room state
        state: Constants.AppState.FOYER,
        // The flag if we should display the controls
        controls: true,
        // The flag if we should allow chat
        chat: true
      };
    },

    /**
     * Keeps updating at different stages
     * Here is where all Skylink events are subscribed.
     */
    componentWillMount: function() {
      var app = this; // self

      // Disable debug mode because trace is ugly :(
      //Skylink.setDebugMode(true);

      // Set the log level for Skylink
      Skylink.setLogLevel(Skylink.LOG_LEVEL.DEBUG);

      /**
       * Handles the Skylink "readyStateChange" event
       * This triggers when the Room is fetching the session.
       */
      Skylink.on('readyStateChange', function (state, error) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        // Room has not loaded anything yet
        if (state === Skylink.READY_STATE_CHANGE.INIT) {
          appState.room.status = Constants.RoomState.IDLE;
          appState.room.error = '';

        // Room is retrieving the session information
        } else if (state === Skylink.READY_STATE_CHANGE.LOADING) {
          appState.room.status = Constants.RoomState.LOADING;
          appState.room.error = '';

        // Room has loaded the session information and at this point,
        //   the Room is ready to join
        } else if (state === Skylink.READY_STATE_CHANGE.COMPLETED) {
          appState.room.status = Constants.RoomState.CONNECTING;
          appState.room.error = '';

          //Skylink._signalingServer = 'test.com';

        // Room has failed loading - ERROR
        } else if (state === Skylink.READY_STATE_CHANGE.ERROR) {
          // Fallback when error object received is empty
          if (!error) {
            error = {};
          }

          // Loop out for key
          if (!error.content) {
            error.content = new Error('Application error');
          }

          appState.room.status = Constants.RoomState.LOAD_ERROR;
          appState.room.error = error.content.message || error.content;
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "systemAction" event
       * This triggers when Server is warning User or rejected User from Room
       */
      Skylink.on('systemAction', function(action, serverMessage, reason) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        // If User is rejected from Room
        if(action === Skylink.SYSTEM_ACTION.REJECT) {
          appState.room.status = Constants.RoomState.CONNECTION_ERROR;
          appState.room.error = serverMessage;
          appState.room.isLocked = true;
          appState.controls = true;

        } else {
          appState.room.messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Warning: ' + (serverMessage.message || serverMessage),
            date: (new Date()).toISOString()
          });
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "socketError" event
       * This triggers when failed to establish connection with Server
       */
      Skylink.on('socketError', function (state) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        // When all attempts have failed connecting
        if (state === Skylink.SOCKET_ERROR.RECONNECTION_ABORTED ||
          state === Skylink.SOCKET_ERROR.CONNECTION_ABORTED) {
          appState.room.status = Constants.RoomState.CONNECTION_ERROR;

        // When connection is attempting
        } else if (state === Skylink.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
          appState.room.status = Constants.RoomState.RECONNECTING_ATTEMPT;

        } else {
          appState.room.status = Constants.RoomState.CONNECTION_ERROR;
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "channelRetry" event
       * This triggers when attempting to establish connection with Server
       */
      Skylink.on('channelRetry', function (fallbackType) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        appState.room.status = Constants.RoomState.RECONNECTING;
        app.setState(appState);
      });

      /**
       * Handles the Skylink "channelError" event
       * This triggers when exception is caught during connection, mostly Application error
       */
      Skylink.on('channelError', function (error) {
        var appState = {
          room: Utils.extend(app.state.room, {}),
          users: app.state.users
        };

        appState.room.messages.push({
          user: 0,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: 'Error: ' + (error.message || error),
          date: (new Date()).toISOString()
        });

        app.setState(appState);
      });

      /**
       * Handles the Skylink "peerJoined" event
       * This triggers when a Peer or when User has joined the Room
       */
      Skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
        var appState = {
          room: Utils.extend(app.state.room, {}),
          users: app.state.users
        };

        // Fallback incase peerInfo.userData is not defined
        peerInfo.userData = peerInfo.userData || {};
        peerInfo.userData.name = peerInfo.userData.name || 'User ' + peerId;

        // User has joined the room
        if (isSelf) {
          appState.room.status = Constants.RoomState.CONNECTED;

          appState.room.messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Room: You have joined the room',
            date: (new Date()).toISOString()
          });

        // Peer has joined the room (new one)
        } else {
          appState.users.push({
            id: peerId,
            name: peerInfo.userData.name,
            stream: null,
            screensharing: peerInfo.userData.screensharing,
            videoMute: peerInfo.mediaStatus.videoMuted,
            audioMute: peerInfo.mediaStatus.audioMuted
          });

          // Get the status of the Peer's screensharing to
          //   prevent other users from screensharing
          if(peerInfo.userData.screensharing) {
            appState.room.screensharing = appState.room.preventScreenshare = true;
          }

          appState.room.messages.push({
            user: peerId,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Room: Peer "' + peerInfo.userData.name + '" has joined the room',
            date: (new Date()).toISOString()
          });
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "peerUpdated" event
       * This triggers when a Peer or when User data is updated
       */
      Skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
        var appState = {
          room: Utils.extend(app.state.room, {}),
          users: app.state.users
        };

        // Fallback incase peerInfo.userData is not defined
        peerInfo.userData = peerInfo.userData || {};
        peerInfo.userData.name = peerInfo.userData.name || 'User ' + peerId;

        for (var i = 0; i < appState.users.length; i++) {
          // If it is User's or the Peer's
          if ((isSelf && appState.users[i].id === 0) || (appState.users[i].id === peerId)) {
            appState.users[i].audioMute = peerInfo.mediaStatus.audioMuted;
            appState.users[i].videoMute = peerInfo.mediaStatus.videoMuted;
            appState.users[i].screensharing = peerInfo.userData.screensharing;
            appState.users[i].name = peerInfo.userData.name;
            break;
          }
        }

        if (!isSelf) {
          appState.room.preventScreenshare = appState.room.screensharing = peerInfo.userData.screensharing === true;
        }

        // Set Room status of screensharing if User screensharing is false
        /*if(app.state.users[0].screensharing === false) {
          state.room = Utils.extend(app.state.room, {
            screensharing:
          });
        }*/

        app.setState(appState);
      });

      /**
       * Handles the Skylink "peerLeft" event
       * This triggers when a Peer or when User has left the Room
       */
      Skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
        var appState = {
          room: Utils.extend(app.state.room, {}),
          users: app.state.users
        };

        // Fallback incase peerInfo,userData is not defined
        peerInfo.userData = peerInfo.userData || {};
        peerInfo.userData.name = peerInfo.userData.name || 'User ' + peerId;

        if (isSelf) {
          // Keep myself only
          appState.users = [appState.users[0]];
          appState.controls = true;
          appState.state = Constants.AppState.FOYER;

          appState.room.messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Room: You have left the room',
            date: (new Date()).toISOString()
          });

        } else {
          for (var i = 0; i < appState.users.length; i++) {
            if (appState.users[i].id === peerId) {
              appState.users.splice(i, 1);
              break;
            }
          }

          // If the Peer is meant to be cleared and screensharing mode is from Peer
          //  turn off screensharing mode and prevent screenshare mode
          if (peerInfo.userData.screensharing) {
            appState.room.screensharing = appState.room.preventScreenshare = false;
          }

          appState.room.messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Room: Peer "' + peerInfo.userData.name + '" has left the room',
            date: (new Date()).toISOString()
          });
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "mediaAccessError" event
       * This triggers when a User failed to retrieve Stream
       */
      Skylink.on('mediaAccessError', function (error, isScreensharing) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        appState.room.messages.push({
          user: 0,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: (isScreensharing ? 'Screen' : 'Media') + ': ' + (error.message || error),
          date: (new Date()).toISOString()
        });

        // When screensharing failed
        if (isScreensharing) {
          appState.room.preventScreenshare = false;

          // Ping all Peers to let them know screensharing has failed
          Dispatcher.sharescreen(false);

        // When inital stream failed for joinRoom()
        } else {
          appState.room.status = Constants.RoomState.CONNECTION_ERROR;
          appState.room.error = error.message || error;
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "mediaAccessError" event
       * This triggers when a User failed to retrieve Stream
       */
      Skylink.on('mediaAccessSuccess', function (stream, isScreensharing) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        appState.room.messages.push({
          user: 0,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: (isScreensharing ? 'Screen' : 'Media') + ': Access has been granted',
          date: (new Date()).toISOString()
        });

        if (isScreensharing) {
          appState.room.preventScreenshare = false;
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "incomingStream" event
       * This triggers when a new Stream is retrieved from User or Peer
       */
      Skylink.on('incomingStream', function(peerId, stream, isSelf) {
        var appState = {
          users: app.state.users
        };

        for (var i = 0; i < appState.users.length; i++) {
          if((isSelf && appState.users[i].id === 0) || appState.users[i].id === peerId) {
            appState.users[i].stream = stream;
          }
        }

        if(appState.users.length >= 2) {
          appState.controls = false;
        }

        app.setState(appState);
      });

      /**
       * Handles the Skylink "incomingMessage" event
       * This triggers when a new Message is received from User or Peer
       */
      Skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
        if(message.content.type !== 'chat') {
          return;
        }

        var appState = {
          users: app.state.users,
          room: Utils.extend(app.state.room, {})
        };

        appState.room.messages.push({
          user: isSelf ? 0 : peerId,
          name: peerInfo.userData.name + (isSelf ? ' (You)' : ''),
          type: Constants.MessageType.MESSAGE,
          content: message.content.content,
          date: message.content.date
        });

        app.setState(appState);
      });

      /**
       * Handles the Skylink "roomLock" event
       * This triggers when the Room is locked / unlocked
       */
      Skylink.on("roomLock", function(isLocked) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        app.room.isLocked = isLocked;
        app.setState(appState);
      });

      /**
       * Dispatcher of events
       */
      Dispatcher = {

        /**
         * Dispatch to ping the screensharing state
         */
        sharescreen: function (enable) {
          var appState = {
            users: app.state.users,
            room: Utils.extend(app.state.room, {})
          };

          appState.users[0].screensharing = enable;
          appState.room.screensharing = enable;

          // Ping the other Peers
          Skylink.setUserData({
            name: app.state.users[0].name,
            screensharing: enable
          });

          app.setState(appState);
        },

        /**
         * Dispatch to ping the MCU state
         */
        setMCU: function(state) {
          var appState = {
            room: Utils.extend(app.state.room, {})
          };

          appState.room.useMCU = state === true;
          app.setState(appState);
        },

        /**
         * Dispatch to ping the current User username
         */
        setName: function(name) {
          var appState = {
            users: app.state.users
          };

          appState.users[0].name = name;

          app.setState(appState);

          Skylink.setUserData({
            name: name,
            screensharing: appState.users[0].screensharing
          });
        },

        /**
         * Dispatch to send a message.
         */
        sendMessage: function(content, type) {
          Skylink.sendMessage({
            content: content,
            type: type || 'chat',
            date: (new Date()).toISOString()
          });
        },

        /**
         * Dispatch to toggle chat box
         */
        toggleChat: function(state) {
          var appState = {
            chat: state !== undefined ? state : !app.state.chat
          };

          app.setState(appState);
        },

        /**
         * Dispatch to toggle controls
         */
        toggleControls: function(state) {
          var appState = {
            room: Utils.extend(app.state.room, {})
          };

          if(appState.room.status === Constants.RoomState.CONNECTED) {
            appState.controls = state !== undefined ? state : !app.state.controls;
          }

          app.setState(appState);
        }
      }
    },

    /**
     * Happens at the beginning once
     * Here is where you start to joinRoom() in Skylink and init()
     */
    componentDidMount: function() {
      Router.configure({
        html5history: true
      }).mount({
        '/:room': this.joinRoom.bind(this),
        '/': this.enterFoyer.bind(this)
      });

      Router.init();
    },

    /**
     * State when entering the foyer
     */
    enterFoyer: function() {
      this.setState({
        state: Constants.AppState.FOYER,
        room: Utils.extend(this.state.room, {
          status: Constants.RoomState.IDLE,
          screensharing: false,
          messages: []
        }),
        controls: true
      });
    },

    /**
     * State when joining the room
     */
    joinRoom: function(room) {
      if(room === undefined) {
        return;
      }

      var appState = {
        room: Utils.extend(this.state.room, {}),
        users: this.state.users
      };

      room = room.toString();

      // Using MCU by queryString instead of "m" in Room names
      //var useMCU = room.substr(0,1) === 'm';
      appState.state = Constants.AppState.IN_ROOM;
      appState.room.id = room;
      appState.room.status = Constants.RoomState.IDLE;
      appState.room.screensharing = false;
      appState.room.useMCU =  getQuery('mcu') === '1';
      appState.controls = true;
      appState.users[0].name = 'User ' + (new Date ()).getTime();

      this.setState(appState);

      Skylink.init({
        roomServer: Configs.Skylink.roomServer || null,
        apiKey: appState.room.useMCU ? Configs.Skylink.apiMCUKey : Configs.Skylink.apiNoMCUKey,
        defaultRoom: room

      }, function(error, success) {
        // Only when it's successful, then join the Room
        if (success) {
          Skylink.joinRoom({
            audio: true,
            video: true,
            userData: {
              name: appState.users[0].name,
              screensharing: false
            }
          });
        }
      });
    },

    /**
     * State to show controls
     */
    handleShowControls: function(e) {
      Dispatcher.toggleControls();
    },

    /**
     * State to render App
     */
    render: function() {
      var className = '',
          isScreensharingSupported = false;

      if(this.state.controls) {
        className = className + 'controls';
      }

      if(this.state.chat) {
        className = className + ' chat';
      }

      console.info(window.webrtcDetectedBrowser, window.webrtcDetectedVersion);

      // Chrome screensharing supports
      if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) {
        isScreensharingSupported = true;

      // Firefox screensharing supports
      } else if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 33) {
        isScreensharingSupported = true;

      // Plugin screensharing supports
      } else if (AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.plugin &&
        AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
        isScreensharingSupported = true;
      }
      // Opera does not support screensharing

      // If screensharing is not supported
      if (isScreensharingSupported) {
        className = className + ' enableScreensharing';
      }

      return (
        <div className={className}>
          <div onClick={this.handleShowControls}>
            <UserAreas state={this.state} />
          </div>
          <Controls state={this.state} />
          <Chat state={this.state} />
        </div>
      )
    }
  });

  React.renderComponent(<App />, document.getElementById('app'));
});
