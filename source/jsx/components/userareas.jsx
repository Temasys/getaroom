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
            // clearInterval(this._sampleInterval);
            // cancelAnimationFrame(this._animFrame);

            if(this.props.user.stream !== null) {

                /*if(this.props.user.videoMute) {
                    this._canvasElement = document.getElementById('uc' + this.props.user.id);
                    this._context = this._canvasElement.getContext('2d');

                    this.drawViz();
                }
                else {*/
                    window.attachMediaStream(
                        document.getElementById('us' + this.props.user.id),
                            this.props.user.stream);
                // }
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
                /*if(this.props.user.videoMute) {
                    res.push(
                        <canvas id={'uc' + this.props.user.id} width='256' height='256'></canvas>
                        );
                }
                else {*/
                    res.push(React.DOM.video({
                            id: 'us' + this.props.user.id,
                            autoPlay: true,
                            muted: this.props.user.id === 0
                        }));
                // }

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
        }/*,
        drawViz: function() {
            this._loop = (this._loop || 0) + 1;
            if(this._loop > 360) {
                this._loop = 0;
            }
            for(var bin = -127; bin < 128; bin++) {
                var val = this._streamData[Math.abs(bin)] / 10;
                var h = this._loop;
                var s = 100;
                var l = Math.min(Math.max(val, 0), Math.abs(bin)/128*100);
                this._context.fillStyle = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
                this._context.fillRect(bin + 128, 0, 1, 255);
            }
            this._animFrame = window.requestAnimationFrame(this.drawViz);
        }*/
    });

    return UserAreas;
});
