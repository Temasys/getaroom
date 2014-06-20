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
                this.props.state.room.status !== Constants.RoomState.IDLE ?
                 UserAreaList( {users:this.props.state.users} ) :
                 React.DOM.div( {id:"noUser"})

            return (
                React.DOM.section( {id:"userareas", className:'split' + this.props.state.users.length}, 
                    showList
                )
                )
        }
    });

    var UserAreaList = React.createClass({displayName: 'UserAreaList',
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return (
                        React.DOM.div( {className:"userarea"}, 
                            UserArea( {user:user} )
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
        attachStream: function() {
            if(this.props.user.stream !== null) {
                window.attachMediaStream(
                    document.getElementById('uv' + this.props.user.id),
                        this.props.user.stream);
            }
        },
        componentDidMount: function() {
            this.attachStream();
        },
        componentDidUpdate: function() {
            this.attachStream();
        },
        render: function() {
            var props = {
                id: 'uv' + this.props.user.id,
                autoPlay: true,
                muted: this.props.user.isMuted || this.props.user.id === 0
            };

            var res = this.props.user.stream === null &&
                this.props.user.id === 0 ? (
                React.DOM.span( {className:"userInfo"}, 
                    "Share your camera and microphone to participate in the call"
                )
                ) : React.DOM.video(props);

            return (
                React.DOM.div(null, 
                    res
                )
                );
        }
    });

    return UserAreas;
});
