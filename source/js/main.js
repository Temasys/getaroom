/** @jsx React.DOM */

define([
    'socketio',
    'react',
    'router',
    'skyway',
    'constants',
    'configs',
    'utils',
    'components/userareas',
    'components/controls'
], function (
    SocketIO,
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
                        hasAV: false,
                        stream: null
                    }
                ],
                state: Constants.AppState.FOYER,
                room: {
                    id: '',
                    status: Constants.RoomState.IDLE,
                    feature: {
                        chat: false,
                        audio: false,
                        video: false,
                        data: false
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

            if(location.pathname.length > 1) {
                this.joinRoom(location.pathname.replace('/',''));
            }


            var self = this;

            Skyway.on('mediaAccessSuccess', function(stream) {
                window.attachMediaStream(
                    document.getElementById('uservideo0'), stream);

                self.setState({
                    users: self.state.users.map(function (user) {
                        if(user.id === 0) {
                            user.hasAV = true;
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

                    Skyway.joinRoom();
                    Skyway.getDefaultStream();
                }
            });
        },
        enterFoyer: function() {
            this.setState({
                state: Constants.AppState.FOYER,
                room: Utils.extend(this.state.room, {
                    status: Constants.RoomState.IDLE
                })
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
                })
            });

            Skyway.init(Configs.Skyway.server,
                Configs.Skyway.apiKey, room);
        },
        render: function() {
            return (
                React.DOM.div(null, 
                    UserAreas( {state:this.state} ),
                    Controls( {state:this.state} )
                )
                )
        }
    });

    React.renderComponent(App(null ),
        document.getElementById('app'));
});
