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
                <section id="userareas" className={this.props.state.room.screensharing ? 'screensharing' : 'split' + this.props.state.users.length}>
                    {showList}
                </section>
                )
        }
    });

    var UserAreaList = React.createClass({
        render: function() {
            var userareas = this.props.users.map(function(user) {
                    return (
                        <div key={user.id} className={'userarea' + (user.screensharing ? ' screensharing' : '')}>
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
                    <span className="userInfo">
                        Share your camera and microphone to participate in the call
                    </span>
                );
            }
            else if(this.props.user.error) {
                res.push(
                    <span className="userInfo">
                        Stream could not be established
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
