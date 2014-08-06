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
                        stream: null
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

                    setTimeout(function() {
                        self.setState({
                            controls: false
                        });
                    }, 4000);
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
                self.setState({
                    users: self.state.users.concat({
                            id: peerId,
                            name: 'Guest ' + peerId,
                            stream: stream
                        })
                });
            });

            Skyway.on('peerLeft', function(peerId) {
                self.setState({
                    users: self.state.users.filter(function(user) {
                            return user.id !== peerId
                        })
                });
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
