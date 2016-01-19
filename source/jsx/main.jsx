/** @jsx React.DOM */

define([
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

    var App = React.createClass({
        getInitialState: function() {
            return {
                users: [
                    {
                        id: 0,
                        name: '',
                        stream: null,
                        audioMute: false,
                        videoMute: false,
                        screensharing: false,
                        updatedStreamRender: 0
                    }
                ],
                state: Constants.AppState.FOYER,
                controls: true,
                chat: true,
                room: {
                    id: '',
                    messages: [],
                    isLocked: false,
                    status: Constants.RoomState.IDLE,
                    useMCU: false
                }
            };
        },
        componentWillMount: function() {
            var self = this;

            //Skylink.setDebugMode(true);
            Skylink.setLogLevel(Skylink.LOG_LEVEL.DEBUG);

            Skylink.on('readyStateChange', function(state) {
                if(state === 0) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            status: Constants.RoomState.IDLE
                        })
                    });
                }
                else if(state === 1) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            status: Constants.RoomState.CONNECTING
                        })
                    });
                }
                else if(state === 2) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            status: Constants.RoomState.CONNECTED
                        })
                    });
                }
                else if(state === -1) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            status: Constants.RoomState.LOCKED
                        })
                    });
                }
            });

            Skylink.on("channelError", function(error) {
                self.setState({
                    room: Utils.extend(self.state.room, {
                        status: Constants.RoomState.IDLE,
                        screensharing: false
                    }),
                    state: Constants.AppState.FOYER,
                    controls: true
                });

                alert("ERROR: " + error.toString());
            });

            Skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
                if(self.state.users.length === Configs.maxUsers || isSelf) {
                    return;
                }

                var state = {
                    users: self.state.users.concat({
                        id: peerId,
                        name: 'Guest ' + peerId,
                        stream: null,
                        error: null,
                        screensharing: peerInfo.userData.screensharing,
                        videoMute: peerInfo.mediaStatus.videoMuted,
                        audioMute: peerInfo.mediaStatus.audioMuted,
                        updatedStreamRender: 0
                    })
                };

                if(peerInfo.userData.screensharing) {
                    state.room = Utils.extend(self.state.room, {
                        screensharing: peerInfo.userData.screensharing
                    });
                }

                self.setState(state);
            });

            Skylink.on('incomingStream', function(peerId, stream, isSelf) {
                var state = {
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.stream = stream;
                            user.updatedStreamRender += 1;
                        }
                        return user;
                    })
                };

                if(self.state.users.length === Configs.maxUsers) {
                    Skylink.lockRoom();
                }
                else if(self.state.users.length >= 2) {
                    state.controls = false;
                }

                self.setState(state);
            });

            Skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
                var state = {
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.audioMute = peerInfo.mediaStatus.audioMuted;
                            user.videoMute = peerInfo.mediaStatus.videoMuted;
                            user.screensharing = peerInfo.userData.screensharing;
                            user.name = peerInfo.userData.name;
                        }
                        return user;
                    })
                };

                if(self.state.users[0].screensharing === false) {
                    state.room = Utils.extend(self.state.room, {
                        screensharing: peerInfo.userData.screensharing
                    });
                }

                self.setState(state);
            });

           Skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
                if(message.content.type !== 'chat') {
                    return;
                }

                var newMessage = {
                    user: isSelf ? 0 : peerId,
                    name: peerInfo.userData.name,
                    type: Constants.MessageType.MESSAGE,
                    content: message.content.content,
                    date: message.content.date
                };

                var messages = self.state.room.messages;
                messages.push(newMessage);

                self.setState({
                    room: Utils.extend(self.state.room, {
                        messages: messages
                    })
                });
            });

            Skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
                var state = {
                    users: self.state.users.filter(function(user) {
                            return user.id !== peerId;
                        })
                };

                if(state.users.length === Configs.maxUsers - 1) {
                    Skylink.unlockRoom();
                }
                else if(state.users.length === 1) {
                    state.controls = true;

                    if(!self.state.users[0].screensharing) {
                        state.room = Utils.extend(self.state.room, {
                            screensharing: false
                        });
                    }
                }

                self.setState(state);
            });

            Skylink.on("roomLock", function(isLocked) {
                self.setState({
                    room: Utils.extend(self.state.room, {
                        isLocked: isLocked
                    })
                });
            });

            Skylink.on("systemAction", function(action, message, reason) {
                if(reason === Skylink.SYSTEM_ACTION_REASON.ROOM_LOCKED) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            status: Constants.RoomState.LOCKED,
                            isLocked: true
                        }),
                        controls: true
                    });
                }
            });

            Dispatcher = {
                sharescreen: function (enable) {
                    self.setState({
                        users: self.state.users.map(function (user) {
                            if(user.id === 0) {
                                user.screensharing = enable;
                            }
                            return user;
                        }),
                        room: Utils.extend(self.state.room, {
                            screensharing: enable
                        })
                    });
                    Skylink.setUserData({
                        name: self.state.users[0].name,
                        screensharing: enable
                    });
                },
                setMCU: function(state) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            useMCU: !!state
                        })
                    });
                },
                setName: function(name) {
                    self.setState({
                        users: self.state.users.map(function (user) {
                            if(user.id === 0) {
                                user.name = name;
                            }
                            return user;
                        })
                    });
                    Skylink.setUserData({
                        name: name,
                        screensharing: self.state.users[0].screensharing
                    });
                },
                sendMessage: function(content, type) {
                    Skylink.sendP2PMessage({
                        content: content,
                        type: type || 'chat',
                        date: (new Date()).toISOString()
                    });
                },
                toggleChat: function(state) {
                    self.setState({
                        chat: state !== undefined ? state : !self.state.chat
                    });
                },
                toggleControls: function(state) {
                    if(self.state.room.status === Constants.RoomState.CONNECTED) {
                        self.setState({
                            controls: state !== undefined ? state : !self.state.controls
                        });
                    }
                }
            }
        },
        componentDidMount: function() {
            Router.configure({
                html5history: true
            }).mount({
                '/:room': this.joinRoom.bind(this),
                '/': this.enterFoyer.bind(this)
            });

            Router.init();
        },
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
        joinRoom: function(room) {
            if(room === undefined) {
                return;
            }

            room = room.toString();
            var useMCU = room.substr(0,1) === 'm';

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
                roomServer: Configs.Skylink.roomServer,
                apiKey: useMCU ?
                    Configs.Skylink.apiMCUKey : Configs.Skylink.apiNoMCUKey,
                defaultRoom: room
            }, function() {
                Skylink.joinRoom({
                    audio: true,
                    video: true
                });
            });
        },
        handleShowControls: function(e) {
            Dispatcher.toggleControls();
        },
        render: function() {

            var className = '';

            if(this.state.controls) {
                className = className + 'controls';
            }
            if(this.state.chat) {
                className = className + ' chat';
            }
            if((webrtcDetectedBrowser === 'chrome' && webrtcDetectedVersion > 34) ||
                (webrtcDetectedBrowser === 'firefox' && webrtcDetectedVersion > 33) ||
                (AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.plugin &&
                    AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable)) {
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

    React.renderComponent(<App />,
        document.getElementById('app'));
});
