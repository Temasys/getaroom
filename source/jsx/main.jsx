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
          preventScreenshare: false
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
        var roomState = Constants.RoomState.IDLE,
            roomError = '';

        // Room has not loaded anything yet
        if (state === Skylink.READY_STATE_CHANGE.INIT) {
          roomState = Constants.RoomState.IDLE;

        // Room is retrieving the session information
        } else if (state === Skylink.READY_STATE_CHANGE.LOADING) {
          roomState = Constants.RoomState.LOADING;

        // Room has loaded the session information and at this point,
        //   the Room is ready to join
        } else if (state === Skylink.READY_STATE_CHANGE.COMPLETED) {
          roomState = Constants.RoomState.CONNECTING;

          //Skylink._signalingServer = '//test.com';

        // Room has failed loading - ERROR
        } else if (state === Skylink.READY_STATE_CHANGE.ERROR) {
          roomState = Constants.RoomState.LOAD_ERROR;

          // Fallback when error object received is empty
          if (!error) {
            error = {};
          }

          // Loop out for key
          if (!error.content) {
            error.content = new Error('Application error');
          }

          roomError = error.content.message || error.content;
        }

        app.setState({
          room: Utils.extend(app.state.room, {
            status: roomState,
            error: roomError
          })
        });
      });

      /**
       * Handles the Skylink "systemAction" event
       * This triggers when Server is warning User or rejected User from Room
       */
      Skylink.on('systemAction', function(action, serverMessage, reason) {
        // If User is rejected from Room
        if(action === Skylink.SYSTEM_ACTION.REJECT) {
          app.setState({
            room: Utils.extend(app.state.room, {
              status: Constants.RoomState.CONNECTION_ERROR,
              error: serverMessage,
              isLocked: true
            }),
            controls: true
          });
        }
      });

      /**
       * Handles the Skylink "socketError" event
       * This triggers when failed to establish connection with Server
       */
      Skylink.on('socketError', function (state) {
        var roomState = Constants.RoomState.CONNECTION_ERROR;

        // When all attempts have failed connecting
        if (state === Skylink.SOCKET_ERROR.RECONNECTION_ABORTED ||
          state === Skylink.SOCKET_ERROR.CONNECTION_ABORTED) {
          roomState = Constants.RoomState.CONNECTION_ERROR;

        // When connection is attempting
        } else if (state === Skylink.SOCKET_ERROR.RECONNECTION_ATTEMPT) {
          roomState = Constants.RoomState.RECONNECTING_ATTEMPT;
        }

        app.setState({
          room: Utils.extend(app.state.room, {
            status: roomState
          })
        });
      });

      /**
       * Handles the Skylink "channelRetry" event
       * This triggers when attempting to establish connection with Server
       */
      Skylink.on('channelRetry', function () {
        app.setState({
          room: Utils.extend(app.state.room, {
            status: Constants.RoomState.RECONNECTING
          })
        });
      });

      /**
       * Handles the Skylink "channelError" event
       * This triggers when exception is caught during connection, mostly Application error
       */
      Skylink.on('channelError', function (error) {
        var messages = app.state.room.messages;

        messages.push({
          user: 0,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: error.message || error,
          date: (new Date()).toISOString()
        });

        app.setState({
          room: Utils.extend(app.state.room, {
            status: Constants.RoomState.DISCONNECTED,
            screensharing: false,
            messages: messages
          }),
          state: Constants.AppState.FOYER,
          controls: true
        });
      });

      /**
       * Handles the Skylink "peerJoined" event
       * This triggers when a Peer or when User has joined the Room
       */
      Skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
        // Fallback incase peerInfo.userData is not defined
        peerInfo.userData = peerInfo.userData || {};

        var state = {},
            userData = {},
            initialUsername = peerInfo.userData.name;

        // Polyfill fallback if username is not defined
        if (!initialUsername) {
          initialUsername = 'User ' + peerId;
        }

        // User has joined the room
        if (isSelf) {
          state = {
            room: Utils.extend(app.state.room, {
              status: Constants.RoomState.CONNECTED,
              preventInitialScreenshare: true
            }),
            users: app.state.users.map(function (user) {
              if(user.id === 0) {
                // Set the current user state
                user.name = initialUsername;
                // Set the user data to inform Skylink
                Skylink.setUserData({
                    screensharing: user.screensharing,
                    name: initialUsername
                });
              }
              return user;
            })
          };

        // Peer has joined the room (new one)
        } else {
          state = {
            users: app.state.users.concat({
              id: peerId,
              name: initialUsername,
              stream: null,
              screensharing: peerInfo.userData.screensharing,
              videoMute: peerInfo.mediaStatus.videoMuted,
              audioMute: peerInfo.mediaStatus.audioMuted
            })
          };

          // Get the status of the Peer's screensharing to
          //   prevent other users from screensharing
          if(peerInfo.userData.screensharing) {
            state.room = Utils.extend(app.state.room, {
              screensharing: true,
              preventScreenshare: true
            });
          }
        }

        app.setState(state);
      });

      /**
       * Handles the Skylink "peerUpdated" event
       * This triggers when a Peer or when User data is updated
       */
      Skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
        // Fallback incase peerInfo.userData is not defined
        peerInfo.userData = peerInfo.userData || {};

        var state = {
          users: app.state.users.map(function (user) {
            // If it is User or Peer based on id
            if((isSelf && user.id === 0) || user.id === peerId) {
              user.audioMute = peerInfo.mediaStatus.audioMuted;
              user.videoMute = peerInfo.mediaStatus.videoMuted;
              user.screensharing = peerInfo.userData.screensharing;
              user.name = peerInfo.userData.name;
            }
            return user;
          })
        };

        var isRoomScreensharing = peerInfo.userData.screensharing;

        if (!isSelf) {
          state.room = Utils.extend(app.state.room, {
            preventScreenshare: isRoomScreensharing,
            screensharing: isRoomScreensharing
          });
        }

        // Set Room status of screensharing if User screensharing is false
        /*if(app.state.users[0].screensharing === false) {
          state.room = Utils.extend(app.state.room, {
            screensharing:
          });
        }*/

        app.setState(state);
      });

      /**
       * Handles the Skylink "peerLeft" event
       * This triggers when a Peer or when User has left the Room
       */
      Skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
        peerInfo.userData = peerInfo.userData || {};

        var state = {
          users: app.state.users.filter(function(user) {
            return user.id !== peerId || (isSelf && user.id !== 0);
          })
        };

        // For User
        if (isSelf) {
          state.state = Constants.AppState.FOYER;
          state.controls = true;

          // If User does not have screensharing
          /*if(!app.state.users[0].screensharing) {
            roomState.screensharing = false;
            state.room = Utils.extend(app.state.room, {
              screensharing: false
            });
          }*/
        } else {
          // If the Peer is meant to be cleared and screensharing mode is from Peer
          //  turn off screensharing mode and prevent screenshare mode
          if (peerInfo.userData.screensharing) {
            state.room = Utils.extend(app.state.room, {
              screensharing: false,
              preventScreenshare: false
            });
          }
        }

        app.setState(state);
      });

      /**
       * Handles the Skylink "mediaAccessError" event
       * This triggers when a User failed to retrieve Stream
       */
      Skylink.on('mediaAccessError', function (error, isScreensharing) {
        var messages = app.state.room.messages;

        // When screensharing failed
        if (isScreensharing) {
          messages.push({
            user: 0,
            name: 'GAR.io',
            type: Constants.MessageType.MESSAGE,
            content: (isScreensharing ? 'Screen' : 'Media') + ': ' + (error.message || error),
            date: (new Date()).toISOString()
          });

          app.setState({
            room: Utils.extend(app.state.room, {
              messages: messages,
              preventScreenshare: false
            })
          });

          // Ping all Peers to let them know screensharing has failed
          Dispatcher.sharescreen(false);

        // When inital stream failed for joinRoom()
        } else {
          app.setState({
            room: Utils.extend(app.state.room, {
              status: Constants.RoomState.CONNECTION_ERROR,
              error: error.message || error
            })
          });
        }
      });

      /**
       * Handles the Skylink "mediaAccessError" event
       * This triggers when a User failed to retrieve Stream
       */
      Skylink.on('mediaAccessSuccess', function (stream, isScreensharing) {
        var messages = app.state.room.messages;

        messages.push({
          user: 0,
          name: 'GAR.io',
          type: Constants.MessageType.MESSAGE,
          content: (isScreensharing ? 'Screen' : 'Media') + ': Access has been granted',
          date: (new Date()).toISOString()
        });

        app.setState({
          room: Utils.extend(app.state.room, {
            messages: messages,
            preventScreenshare: false
          })
        });
      });

      /**
       * Handles the Skylink "incomingStream" event
       * This triggers when a new Stream is retrieved from User or Peer
       */
      Skylink.on('incomingStream', function(peerId, stream, isSelf) {
        var state = {
          users: app.state.users.map(function (user) {
            if((isSelf && user.id === 0) || user.id === peerId) {
              user.stream = stream;
            }
            return user;
          })
        };

        if(app.state.users.length >= 2) {
          state.controls = false;
        }

        app.setState(state);
      });

      /**
       * Handles the Skylink "incomingMessage" event
       * This triggers when a new Message is received from User or Peer
       */
      Skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
        if(message.content.type !== 'chat') {
          return;
        }

        var messages = app.state.room.messages;

        console.info(app.state.room);

        messages.push({
          user: isSelf ? 0 : peerId,
          name: peerInfo.userData.name,
          type: Constants.MessageType.MESSAGE,
          content: message.content.content,
          date: message.content.date
        });

        app.setState({
          room: Utils.extend(app.state.room, {
            messages: messages
          })
        });
      });

      /**
       * Handles the Skylink "roomLock" event
       * This triggers when the Room is locked / unlocked
       */
      Skylink.on("roomLock", function(isLocked) {
        app.setState({
          room: Utils.extend(app.state.room, {
            isLocked: isLocked
          })
        });
      });

      /**
       * Dispatcher of events
       */
      Dispatcher = {

        /**
         * Dispatch to ping the screensharing state
         */
        sharescreen: function (enable) {
          app.setState({
            users: app.state.users.map(function (user) {
              if(user.id === 0) {
                user.screensharing = enable;
              }
              return user;
            }),
            room: Utils.extend(app.state.room, {
              screensharing: enable
            })
          });

          // Ping the other Peers
          Skylink.setUserData({
            name: app.state.users[0].name,
            screensharing: enable
          });
        },

        /**
         * Dispatch to ping the MCU state
         */
        setMCU: function(state) {
          app.setState({
            room: Utils.extend(app.state.room, {
              useMCU: !!state
            })
          });
        },

        /**
         * Dispatch to ping the current User username
         */
        setName: function(name) {
          app.setState({
            users: app.state.users.map(function (user) {
              if(user.id === 0) {
                user.name = name;
              }
              return user;
            })
          });

          Skylink.setUserData({
            name: name,
            screensharing: app.state.users[0].screensharing
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
          app.setState({
            chat: state !== undefined ? state : !app.state.chat
          });
        },

        /**
         * Dispatch to toggle controls
         */
        toggleControls: function(state) {
          if(app.state.room.status === Constants.RoomState.CONNECTED) {
            app.setState({
              controls: state !== undefined ? state : !app.state.controls
            });
          }
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

      room = room.toString();

      // Using MCU by queryString instead of "m" in Room names
      //var useMCU = room.substr(0,1) === 'm';
      var useMCU = getQuery('mcu') === '1';

      this.setState({
        state: Constants.AppState.IN_ROOM,
        room: Utils.extend(this.state.room, {
          id: room,
          status: Constants.RoomState.IDLE,
          screensharing: false,
          useMCU: useMCU
        }),
        controls: true
      });

      Skylink.init({
        roomServer: Configs.Skylink.roomServer || null,
        apiKey: useMCU ? Configs.Skylink.apiMCUKey : Configs.Skylink.apiNoMCUKey,
        defaultRoom: room

      }, function(error, success) {
        // Only when it's successful, then join the Room
        if (success) {
          Skylink.joinRoom({
            audio: true,
            video: true,
            userData: {}
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
