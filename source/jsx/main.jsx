/** @jsx React.DOM */

define([
    'react',
    'router',
    'skylink',
    'constants',
    'configs',
    'utils',
    'components/userareas',
    'components/controls'
], function (
    React,
    Router,
    Skylink,
    Constants,
    Configs,
    Utils,
    UserAreas,
    Controls
) {

    var App = React.createClass({
        getInitialState: function() {
            return {
                users: [
                    {
                        id: 0,
                        name: 'Yourself',
                        stream: null,
                        audioMute: false,
                        videoMute: false,
                        error: null,
                        screensharing: false,
                        currentStreamRender: 0,
                        updatedStreamRender: 0
                    }
                ],
                state: Constants.AppState.FOYER,
                controls: true,
                room: {
                    id: '',
                    isLocked: false,
                    screensharing: false,
                    status: Constants.RoomState.IDLE
                }
            };
        },
        componentWillMount: function() {
            var self = this;

            //Skylink.setDebugMode(true);
            Skylink.setLogLevel(Skylink.LOG_LEVEL.ERROR);

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
                        currentStreamRender: 0,
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

            Skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
                var state = {
                    users: self.state.users.filter(function(user) {
                            return user.id !== peerId;
                        })
                };

                if(state.users.length === 2) {
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
                        screensharing: enable
                    })
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
                    screensharing: false
                }),
                controls: true
            });
        },
        joinRoom: function(room) {
            if(room === undefined) {
                return;
            }

            room = room.toString();

            this.setState({
                state: Constants.AppState.IN_ROOM,
                room: Utils.extend(this.state.room, {
                    id: room,
                    status: Constants.RoomState.IDLE,
                    screensharing: false
                }),
                controls: true
            });

            Skylink.init({
                roomServer: Configs.Skylink.roomServer,
                apiKey: Configs.Skylink.apiKey,
                defaultRoom: room
            }, function() {
                Skylink.joinRoom({
                    audio: true,
                    video: true
                });
            });
        },
        handleShowControls: function(e) {
            if(this.state.room.status === Constants.RoomState.CONNECTED) {
                this.setState({
                    controls: !this.state.controls
                });
            }
        },
        render: function() {
            return (
                <div>
                    <div onClick={this.handleShowControls}>
                        <UserAreas state={this.state} />
                    </div>
                    <Controls state={this.state} />
                </div>
                )
        }
    });

    React.renderComponent(<App />,
        document.getElementById('app'));
});
