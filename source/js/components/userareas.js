/** @jsx React.DOM */

define([
    'react',
    'constants',
    'utils'
], function (
    React,
    Constants,
    Utils
) {

    var UserAreas = React.createClass({displayName: 'UserAreas',
        render: function() {
            var showList =
                this.props.state.room.status === Constants.RoomState.CONNECTED ?
                 UserAreaList({users: this.props.state.users}) :
                 React.DOM.div({id: "noUser"})

            return (
                React.DOM.section({id: "userareas", className: this.props.state.room.screensharing ? 'screensharing' : 'split' + this.props.state.users.length}, 
                    showList
                )
                )
        }
    });

    var UserAreaList = React.createClass({displayName: 'UserAreaList',
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return (
                        React.DOM.div({key: user.id, className: 'userarea' + (user.screensharing ? ' screensharing' : '')}, 
                            UserArea({user: user})
                        )
                        );
                });

            return (
                React.DOM.div(null, 
                    userareas
                )
                )
        }
    });

    var UserArea = React.createClass({displayName: 'UserArea',
        currentStreamRender: 0,
        attachStream: function() {
            if(this.props.user.stream !== null &&
                this.props.user.updatedStreamRender > this.currentStreamRender) {
                var video = document.getElementById('us' + this.props.user.id);
                window.attachMediaStream(video,
                    this.props.user.stream);
                this.currentStreamRender += 1;
            }
        },
        componentDidMount: function() {
            this.attachStream();
        },
        componentDidUpdate: function() {
            this.attachStream();
        },
        render: function() {
            var res = [];

            if(this.props.user.stream === null && this.props.user.id === 0) {
                res.push(
                    React.DOM.span({className: "userInfo"}, 
                        "Share your camera and microphone to participate in the call"
                    )
                );
            }
            else if(this.props.user.error) {
                res.push(
                    React.DOM.span({className: "userInfo"}, 
                        "Stream could not be established"
                    )
                );
            }
            else if(this.props.user.stream === null) {
                res.push(
                    React.DOM.span({className: "userInfo"}, 
                        "Joining..."
                    )
                );
            }
            else {
                res.push(React.DOM.video({
                        id: 'us' + this.props.user.id,
                        autoPlay: true,
                        muted: this.props.user.id === 0
                    }));

                var muted = [];

                if(this.props.user.audioMute) {
                    muted.push('Audio');
                }
                if(this.props.user.videoMute) {
                    muted.push('Video');
                }

                if(muted.length > 0) {
                    res.push(
                        React.DOM.span({className: "userInfo"}, 
                            muted.join('/'), " muted"
                        )
                    );
                }
            }

            return (
                React.DOM.div(null, 
                    res
                )
                );
        }
    });

    return UserAreas;
});
