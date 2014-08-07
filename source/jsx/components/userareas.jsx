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
                this.props.state.room.status === Constants.RoomState.CONNECTED ?
                 <UserAreaList users={this.props.state.users} /> :
                 <div id='noUser'></div>

            return (
                <section id="userareas" className={'split' + this.props.state.users.length}>
                    {showList}
                </section>
                )
        }
    });

    var UserAreaList = React.createClass({
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return (
                        <div className="userarea">
                            <UserArea user={user} />
                        </div>
                        );
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
            var res = [];

            if(this.props.user.stream === null && this.props.user.id === 0) {
                res.push(
                    <span className="userInfo">
                        Share your camera and microphone to participate in the call
                    </span>
                );
            }
            else if(this.props.user.stream === null) {
                res.push(
                    <span className="userInfo">
                        Joining...
                    </span>
                );
            }
            else {
                res.push(React.DOM.video({
                    id: 'uv' + this.props.user.id,
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
                        <span className="userInfo">
                            {muted.join('/')} muted
                        </span>
                    );
                }
            }

            return (
                <div>
                    {res}
                </div>
                );
        }
    });

    return UserAreas;
});
