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

    var UserAreas = React.createClass({
        render: function() {
            var showList =
                this.props.state.room.status !== Constants.RoomState.IDLE ?
                 <UserAreaList users={this.props.state.users} /> :
                 <div id='noUser'></div>

            return (
                <section id="userareas">
                    {showList}
                </section>
                )
        }
    });

    var UserAreaList = React.createClass({
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return <UserArea user={user} />;
                });

            return (
                <div>
                    {userareas}
                </div>
                )
        }
    });

    var UserArea = React.createClass({
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
                this.props.user.id === 0 ?
                <div>Not sharing your audio/video</div> :
                React.DOM.video(props);

            return (
                <div>
                    {res}
                </div>
                );
        }
    });

    return UserAreas;
});
