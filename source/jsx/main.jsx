/** @jsx React.DOM */

define([
    'react',
    'router',
    'skyway',
    'constants',
    'configs',
    'utils',
    'components/userareas',
    'components/controls'
], function (
    React,
    Router,
    Skyway,
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
                        videoMute: false
                    }
                ],
                state: Constants.AppState.FOYER,
                controls: true,
                room: {
                    id: '',
                    isLocked: false,
                    status: Constants.RoomState.IDLE
                }
            };
        },
        componentWillMount: function() {
           var self = this;

            Skyway.on('readyStateChange', function(state) {
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

                    Skyway.joinRoom({
                        audio: true,
                        video: true
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

            Skyway.on("channelError", function(error) {
                self.setState({
                    room: Utils.extend(self.state.room, {
                        status: Constants.RoomState.IDLE
                    }),
                    state: Constants.AppState.FOYER,
                    controls: true
                });

                alert("ERROR: " + error.toString());
            });

            Skyway.on('peerJoined', function(peerId, peerInfo, isSelf) {
                if(self.state.users.length === 3) {
                    Skyway.lockRoom();
                    return;
                }
                else if(isSelf) {
                    return;
                }

                self.setState({
                    users: self.state.users.concat({
                        id: peerId,
                        name: 'Guest ' + peerId,
                        stream: null,
                        videoMute: peerInfo.mediaStatus.videoMuted,
                        audioMute: peerInfo.mediaStatus.audioMuted
                    })
                });
            });

            Skyway.on('addPeerStream', function(peerId, stream, isSelf) {
                var state = {
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.stream = stream;
                        }
                        return user;
                    })
                };

                if(state.users.length === 2) {
                    state.controls = false;
                }

                self.setState(state);
            });

            Skyway.on('peerUpdated', function(peerId, peerInfo, isSelf) {
                self.setState({
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.audioMute = peerInfo.mediaStatus.audioMuted;
                            user.videoMute = peerInfo.mediaStatus.videoMuted;
                        }
                        return user;
                    })
                });
            });

            Skyway.on('peerLeft', function(peerId) {
                var state = {
                    users: self.state.users.filter(function(user) {
                            return user.id !== peerId
                        })
                };

                if(state.users.length === 1) {
                    Skyway.unlockRoom();
                    state.controls = true;
                }

                self.setState(state);
            });

            Skyway.on("roomLock", function(success, isLocked) {
                if(success) {
                    self.setState({
                        room: Utils.extend(self.state.room, {
                            isLocked: isLocked
                        })
                    });
                }
            });

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
                    status: Constants.RoomState.IDLE
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
                    status: Constants.RoomState.IDLE
                }),
                controls: true
            });

            Skyway.init({
                apiKey: Configs.Skyway.apiKey,
                defaultRoom: room
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
