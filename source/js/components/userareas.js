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
            return (
                React.DOM.div(null, 
                    React.DOM.video( {id:'uservideo' + this.props.user.id})
                )
                );
        }
    });

    return UserAreas;
});
