/** @jsx React.DOM */

define([
    'react',
    'utils',
    'constants',
    'skyway',
    'router'
], function (
    React,
    Utils,
    Constants,
    Skyway,
    Router
) {

    var Controls = React.createClass({displayName: 'Controls',
        handleStartRoom: function(e) {
            var room = Utils.uuid(6);
            Router.setRoute('/' + room);
        },
        handleLeaveRoom: function(e) {
            Skyway.leaveRoom();
            Router.setRoute('/');
        },
        render: function() {
            var res = [];

            if(this.props.state.state === Constants.AppState.FOYER) {
                res.push(
                    React.DOM.button( {className:"joinRoom", onClick:this.handleStartRoom}, 
                        "Start Call"
                    )
                    );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    React.DOM.button( {className:"leaveRoom", onClick:this.handleLeaveRoom}, 
                        "Leave Call"
                    )
                    );

                res.push(
                    React.DOM.div( {className:"status"}, "Status: ", this.props.state.room.status)
                    );
            }

            return (
                React.DOM.section( {id:"controls", className:this.props.state.controls ? 'visible' : ''}, 
                    React.DOM.div(null, 
                        res
                    )
                )
                )
        }
    });

    return Controls;
});
