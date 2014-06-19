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
                React.DOM.section( {id:"userareas"}, 
                    showList
                )
                )
        }
    });

    var UserAreaList = React.createClass({displayName: 'UserAreaList',
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return UserArea( {user:user} );
                });

            return (
                React.DOM.div(null, 
                    userareas
                )
                )
        }
    });

    var UserArea = React.createClass({displayName: 'UserArea',
        render: function() {
            var props = {
                id: 'uservideo' + this.props.user.id,
                autoPlay: true,
                muted: this.props.user.isMuted || this.props.user.id === 0
            };

            return (
                React.DOM.div(null, 
                    React.DOM.video(props)
                )
                );
        }
    });

    return UserAreas;
});
