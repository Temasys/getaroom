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

    var Controls = React.createClass({
        handleStartRoom: function(e) {
            var room = Utils.uuid();
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
                    <button className="joinRoom" onClick={this.handleStartRoom}>
                        Start
                    </button>
                    );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    <button className="leaveRoom" onClick={this.handleLeaveRoom}>
                        Leave
                    </button>
                    );

                res.push(
                    <div className="status">Status: {this.props.state.room.status}</div>
                    );
            }

            return (
                <section id="controls">
                    <div>
                        {res}
                    </div>
                </section>
                )
        }
    });

    return Controls;
});
