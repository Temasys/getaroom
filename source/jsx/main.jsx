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

  // Allow expose reference for debugging
  window._Skylink = Skylink;

  /**
   * Configure React App
   */
  var App = React.createClass({

    /*
     * Sets the initial stage when User joins the Room
     */
    getInitialState: function() {
      return {
        state: Constants.AppState.FOYER,
        show: {
          // The flag if we should display the controls
          controls: true,
          // The flag if we should allow chat
          chat: true
        },
        // Contains the Room information
        room: {
          status: Constants.RoomState.IDLE,
          error: '',
          states: {
            locked: false,
            recording: false,
            mcu: false,
            screenshares: 0
          },
          prevent: {
            screenshare: false,
            recording: false,
            recordingStopTimeout: null
          },
          flags: {
            mcu: false,
            forceturn: false
          },
          messages: []
        },
        // Contains the list of User and Peers
        users: [{
          id: 'self',
          name: '',
          stream: {
            current: null,
            renderedId: null
          },
          audio: false,
          video: false
        }]
      };
    },

    /**
     * Keeps updating at different stages
     * Here is where all Skylink events are subscribed.
     */
    componentWillMount: function() {
      var app = this;

      /**
       * Dispatcher of events
       */
      Dispatcher = {
        /**
         * Dispatch user info settings.
         */
        setUserInfo: function (user, peerId, stream, peerInfo) {
          user = user || {};
          user.id = peerId;
          user.name = (peerInfo.userData || {}).name || 'User ' + peerId;
          user.stream = user.stream || {
            current: null,
            renderedId: null
          };

          if (stream) {
            user.stream.current = stream;
          }

          if (peerInfo.settings.audio) {
            user.audio = {
              muted: peerInfo.mediaStatus.audioMuted
            };
          }

          if (peerInfo.settings.video) {
            user.video = {
              muted: peerInfo.mediaStatus.videoMuted,
              screenshare: typeof peerInfo.settings.video === 'object' && peerInfo.settings.video && peerInfo.settings.video.screenshare
            };
          }
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
         * Dispatch to ping the recording state
         */
        recording: function (enable) {
          if (enable) {
            this.props.state.room.preventRecording = true;

          } else {
            Skylink.stopRecording();
          }
        },

        /**
         * Dispatch to set screensharing mode
         */
        setScreen: function () {
          var appState = {
            room: Utils.extend(app.state.room, {}),
            users: app.state.users
          };
          var hasScreensharing = false;

          for (var i = 0; i < appState.users.length; i++) {
            // If Peer is screensharing
            if (appState.users[i].screensharing) {
              hasScreensharing = true;

              if (appState.users[i].id !== 0) {
                // Check if User is screensharing and then compare
                if (appState.users[0].screensharing &&
                // Priority is higher then stop your screensharing
                  appState.users[i].screensharingPriority > appState.users[0].screensharingPriority) {

                  Skylink.stopScreen();
                }
              }
            }
          }

          if (hasScreensharing && appState.users.length > 4) {
            appState.room.messages.push({
              user: 0,
              name: 'GAR.io',
              type: Constants.MessageType.MESSAGE,
              content: 'Room: Current screensharing layout scales up to 4 users, and some of the peers ' +
                'might not be displayed due to the layout. Current users count is ' + appState.users.length,
              date: (new Date()).toISOString()
            });
          }

          appState.room.screensharing = hasScreensharing;
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

          Skylink.setUserData(Utils.extend(Skylink.getUserData(), {
            name: name
          }));
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
      };

      // Set log level: [DEBUG|LOG|INFO|WARN|ERROR|NONE]
      Skylink.setLogLevel(Skylink.LOG_LEVEL.DEBUG);

      /**
       * Handles the Skylink "readyStateChange" event
       * This triggers when the Room is fetching the session.
       */
      Skylink.on('readyStateChange', function (state, error) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        switch (state) {
          // Room has not loaded anything yet
          case Skylink.READY_STATE_CHANGE.INIT:
            appState.room.status = Constants.RoomState.IDLE;
            appState.room.error = '';
            break;

          // Room is retrieving the session information
          case Skylink.READY_STATE_CHANGE.LOADING:
            appState.room.status = Constants.RoomState.LOADING;
            appState.room.error = '';
            break;

          // Room has loaded the session information and at this point, the Room is ready to join
          case Skylink.READY_STATE_CHANGE.COMPLETED:
            appState.room.status = Constants.RoomState.CONNECTING;
            appState.room.error = '';
            break;

          // Room has failed loading - ERROR
          default:
            var renderError = {
              message: ((error || {}).content || {}).message || 'Unknown error',
              code: (error || {}).errorCode || -1,
              status: (error || {}).status || -1
            };

            appState.room.status = Constants.RoomState.LOAD_ERROR;
            appState.room.error = renderError.message + '<br>Code: ' + (renderError.code + 'x' + renderError.status);
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

        switch (action) {
          case Skylink.SYSTEM_ACTION.REJECT:
            appState.room.status = Constants.RoomState.CONNECTION_ERROR;
            appState.room.error = serverMessage;
            appState.room.states.locked = true;
            appState.show.controls = true;
            break;

          default:
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

        switch (state) {
          // When all attempts have failed connecting
          case Skylink.SOCKET_ERROR.RECONNECTION_ABORTED:
          case Skylink.SOCKET_ERROR.CONNECTION_ABORTED:
            appState.room.status = Constants.RoomState.CONNECTION_ERROR;
            break;
          
          // When connection is attempting
          case Skylink.SOCKET_ERROR.RECONNECTION_ATTEMPT:
            appState.room.status = Constants.RoomState.RECONNECTING_ATTEMPT;
            break;
          
          default:
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
       * This triggers when app UI exception is caught during connection.
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
       * Handles the Skylink "serverPeerJoined" event
       * This triggers when MCU joins the room
       */
      Skylink.on('serverPeerJoined', function (peerId, peerType) {
        if (peerType !== Skylink.SERVER_PEER_TYPE.MCU) {
          return;
        }

        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        appState.room.states = appState.room.states || {};
        appState.room.states.mcu = true;
        app.setState(appState);
      });

      /**
       * Handles the Skylink "serverPeerLeft" event
       * This triggers when MCU leaves the room
       */
      Skylink.on('serverPeerLeft', function (peerId, peerType) {
        if (peerType !== Skylink.SERVER_PEER_TYPE.MCU) {
          return;
        }

        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        appState.room.states = appState.room.states || {};
        appState.room.states.mcu = false;
        appState.room.states.recording = false;

        if (appState.room.states.recordingStopTimeout) {
          clearTimeout(appState.room.states.recordingStopTimeout);
          appState.room.states.recordingStopTimeout = null;
        }

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

        if (isSelf) {
          appState.state = Constants.AppState.IN_ROOM;
          appState.room.status = Constants.RoomState.CONNECTED;
          renderUserInfo(appState.users[0], peerId, null, peerInfo);
        } else {
          appState.users.push(renderUserInfo({}, peerId, null, peerInfo));
        }

        appState.room.messages.push({
          user: isSelf ? 0 : peerId,
          name: 'getaroom.io',
          type: Constants.MessageType.MESSAGE,
          content: 'Room: ' (isSelf ? 'You have' : 'Peer "' + username + '" has') + ' joined the room',
          date: (new Date()).toISOString()
        });

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
        var username = peerInfo.userData.name || '';

        for (var i = 0; i < appState.users.length; i++) {
          // If it is User's or the Peer's
          if ((isSelf && appState.users[i].id === 0) || (appState.users[i].id === peerId)) {
            appState.users[i].audioMute = peerInfo.mediaStatus.audioMuted;
            appState.users[i].videoMute = peerInfo.mediaStatus.videoMuted;
            appState.users[i].name = username;
            appState.users[i].hasAudio = !!peerInfo.settings.audio;
            appState.users[i].hasVideo = !!peerInfo.settings.video;
            break;
          }
        }

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

        if (isSelf) {
          appState.controls = true;
          appState.state = Constants.AppState.FOYER;
        } else {
          for (var i = 0; i < appState.users.length; i++) {
            if (appState.users[i].id === peerId) {
              appState.users.splice(i, 1);
            }
          }
        }

        appState.room.messages.push({
          user: isSelf ? 'self' : peerId,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: 'Room: ' + (isSelf ? 'You have' : 'Peer "' + username + '" has') + ' left the room',
          date: (new Date()).toISOString()
        });

        app.setState(appState);
        Dispatcher.renderScreenState();
      });

      /**
       * Handles the Skylink "serverPeerRestart" event
       * This triggers when MCU is restarted with User
       */
      Skylink.on('serverPeerRestart', function (peerId, peerType) {
        if (peerType === Skylink.SERVER_PEER_TYPE.MCU) {
          var appState = {
            room: Utils.extend(app.state.room, {})
          };

          appState.room.isMCURestart = true;

          app.setState(appState);
        }
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
      Skylink.on('incomingStream', function(peerId, stream, isSelf, peerInfo) {
        var appState = {
          users: app.state.users,
          room: Utils.extend(app.state.room, {})
        };
        // Screensharing settings
        var screensharing = peerInfo.settings && peerInfo.settings.video &&
          peerInfo.settings.video.screenshare;
        // Screensharing priority
        var screensharingPriority = peerInfo.userData.screensharingPriority || 0;

        for (var i = 0; i < appState.users.length; i++) {
          if((isSelf && appState.users[i].id === 0) || appState.users[i].id === peerId) {
            appState.users[i].stream = stream;
            appState.users[i].screensharing = screensharing;
            appState.users[i].screensharingPriority = screensharingPriority;
            appState.users[i].hasAudio = !!peerInfo.settings.audio;
            appState.users[i].hasVideo = !!peerInfo.settings.video;
            break;
          }
        }

        if(appState.users.length >= 2) {
          appState.controls = false;
        }

        app.setState(appState);
        Dispatcher.setScreen();
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

        appState.room.isLocked = isLocked;
        app.setState(appState);
      });

      /**
       * Handles the Skylink "recordingState" event
       * This triggers when recording status has changed
       */
      Skylink.on('recordingState', function (state, recordingId, link, error) {
        var appState = {
          room: Utils.extend(app.state.room, {})
        };

        if (state === Skylink.RECORDING_STATES.START) {
          appState.room.isRecording = true;
          appState.room.preventRecording = true;
          appState.room.messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: 'Recording: (ID: ' + recordingId +
              ')\nStarted for room. Waiting for minium of 10 seconds before enabling',
            date: (new Date()).toISOString()
          });

          // 5 seconds of timeout
          appState.room.recordingTimer = setTimeout(function () {
            var newAppState = {
              room: Utils.extend(app.state.room)
            };
            newAppState.room.preventRecording = false;
            newAppState.room.recordingTimer = null;
            app.setState(newAppState);
          }, 10000);

        } else {
          if (state === Skylink.RECORDING_STATES.STOP) {
            // Clear away the timer just incase
            if (appState.room.recordingTimer) {
              clearTimeout(appState.room.recordingTimer);
            }

            appState.room.isRecording = false;
            appState.room.preventRecording = false;
            appState.room.messages.push({
              user: 0,
              name: 'GAR.io',
              type: Constants.MessageType.MESSAGE,
              content: 'Recording: (ID: ' + recordingId +
                ')\nStopped for room. Video is mixing ....',
              date: (new Date()).toISOString()
            });

          } else if (state === Skylink.RECORDING_STATES.URL) {
            //appState.room.preventRecording = false;
            appState.room.messages.push({
              user: 0,
              name: 'GAR.io',
              type: Constants.MessageType.MESSAGE,
              content: 'Recording: (ID: ' + recordingId +
                ')\nMixing completed. [Download link](' + link + ')',
              date: (new Date()).toISOString()
            });

          } else {
            //appState.room.preventRecording = false;
            appState.room.messages.push({
              user: 0,
              name: 'GAR.io',
              type: Constants.MessageType.MESSAGE,
              content: 'Recording: (ID: ' + recordingId +
                ')\nError. ' + (error.message || error),
              date: (new Date()).toISOString()
            });
          }
        }

        app.setState(appState);
      });
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
      appState.room.status = Constants.RoomState.IDLE;
      appState.room.screensharing = false;
      appState.room.useMCU =  getQuery('mcu') === '1';
      appState.controls = true;
      appState.users[0].name = 'User ' + (new Date ()).getTime();

      this.setState(appState);

      Skylink.init({
        roomServer: Configs.Skylink.roomServer,
        appKey: appState.room.useMCU ? Configs.Skylink.apiMCUKey : Configs.Skylink.apiNoMCUKey,
        defaultRoom: room,
        audioFallback: true
      }, function() {
        var fnOnItems = function (sources) {
          var hasAudio = false;
          var hasVideo = false;
          var index = 0;

          while (index < sources.length) {
            if (['audio', 'audioinput'].indexOf(sources[index].kind) > -1) {
              hasAudio = true;
            } else if (['video', 'videoinput'].indexOf(sources[index].kind) > -1) {
              hasVideo = true;
            }
            index++;
          }

          Skylink.getUserMedia({
            audio: hasAudio ? { stereo: true, echoCancellation: true } : false,
            video: hasVideo
          }, function () {
            Skylink.joinRoom({
              userData: {
                name: appState.users[0].name,
                screensharing: false
              }
            });
          });
        };

        if (navigator.mediaDevices && typeof navigator.mediaDevices === 'object' &&
          typeof navigator.mediaDevices.enumerateDevices === 'function') {
          navigator.mediaDevices.enumerateDevices().then(fnOnItems);
        } else if (window.MediaStreamTrack && typeof window.MediaStreamTrack.getSources === 'function') {
          MediaStreamTrack.getSources(fnOnItems);
        } else {
          // Spoof to just retrieve audio and video tracks if possible
          fnOnItems([{ kind: 'videoinput' }, { kind: 'audioinput' }]);
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
      var className = '';

      if(this.state.show.controls) {
        className += 'controls';
      }

      if(this.state.show.chat) {
        className += ' chat';
      }

      if (
        // Chrome screensharing supports
        (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) ||
        // Firefox screensharing supports
        (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 33) ||
        // Plugin screensharing supports
        (AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable)
      ) {
        className +=  ' enableScreensharing';
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
