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

    var App = React.createClass({displayName: 'App',
        getInitialState: function() {
            return {
                users: [
                    {
                        id: 0,
                        name: 'Thomas',
                        stream: null,
                        audioMute: false,
                        videoMute: false
                    }
                ],
                state: Constants.AppState.FOYER,
                controls: true,
                room: {
                    id: '',
                    status: Constants.RoomState.IDLE
                }
            };
        },
        componentWillMount: function() {
           var self = this;

            Skyway.on('mediaAccessSuccess', function(stream) {
                self.setState({
                    users: self.state.users.map(function (user) {
                        if(user.id === 0) {
                            user.stream = stream;
                        }
                        return user;
                    })
                });
            });

            Skyway.on('peerVideoMute', function(peerId, isMute, isSelf) {
                self.setState({
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.videoMute = isMute;
                        }
                        return user;
                    })
                });
            });

            Skyway.on('peerAudioMute', function(peerId, isMute, isSelf) {
                self.setState({
                    users: self.state.users.map(function (user) {
                        if((isSelf && user.id === 0) || user.id === peerId) {
                            user.audioMute = isMute;
                        }
                        return user;
                    })
                });
            });

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

            Skyway.on('addPeerStream', function(peerId, stream) {
                if(self.state.users.length === 3) {
                    return;
                }

                var state = {
                    users: self.state.users.concat({
                            id: peerId,
                            name: 'Guest ' + peerId,
                            stream: stream
                        })
                };

                if(state.users.length === 2) {
                    state.controls = false;
                }

                self.setState(state);
            });

            Skyway.on('peerLeft', function(peerId) {
                var state = {
                    users: self.state.users.filter(function(user) {
                            return user.id !== peerId
                        })
                };

                if(state.users.length === 1) {
                    state.controls = true;
                }

                self.setState(state);
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
                appKey: Configs.Skyway.apiKey,
                room: room
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
                React.DOM.div(null, 
                    React.DOM.div( {onClick:this.handleShowControls}, 
                        UserAreas( {state:this.state} )
                    ),
                    Controls( {state:this.state} )
                )
                )
        }
    });

    React.renderComponent(App(null ),
        document.getElementById('app'));
});
