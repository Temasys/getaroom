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
            clearInterval(this._sampleInterval);
            cancelAnimationFrame(this._animFrame);

            if(this.props.user.stream !== null) {
                var us = document.getElementById('us' + this.props.user.id);

                if(this.props.user.videoMute) {
                    if(!this.props.user.audioMute) {
                        this.analyseAudio(us);
                    }

                    this._canvasElement = document.getElementById('uc' + this.props.user.id);
                    this._context = this._canvasElement.getContext('2d');

                    this.drawViz();
                }

                window.attachMediaStream(us, this.props.user.stream);
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
                if(this.props.user.videoMute) {
                    res.push(
                        <canvas id={'uc' + this.props.user.id} width='256' height='256'></canvas>
                        );
                }

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
        },
        analyseAudio: function(player) {
            var self = this;
            if(!this._source) {
                this._audioCtx = new window.AudioContext; // this is because it's not been standardised accross browsers yet.
                this._analyser = this._audioCtx.createAnalyser();
                this._analyser.fftSize = 256;
            }

            try {
                this._source = this._audioCtx.createMediaElementSource(player); // this is where we hook up the <audio> element
                this._source.connect(this._analyser);
                this._analyser.connect(this._audioCtx.destination);
            } catch (e) {}

            var sampleAudioStream = function() {
                // This closure is where the magic happens. Because it gets called with setInterval below, it continuously samples the audio data
                // and updates the streamData and volume properties. This the SoundCouldAudioSource function can be passed to a visualization routine and
                // continue to give real-time data on the audio stream.
                self._analyser.getByteFrequencyData(self._streamData);
                // calculate an overall volume value
                var total = 0;
                for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
                    total += self._streamData[i];
                }
                self._volume = total;
            };

            this._sampleInterval = window.setInterval(sampleAudioStream, 20);
            this._volume = 0;
            this._streamData = new Uint8Array(128);
        },
        drawViz: function() {
            // you can then access all the frequency and volume data
            // and use it to draw whatever you like on your canvas
            for(var bin = 0; bin < 128; bin++) {
                // do something with each value. Here's a simple example
                var val = this._streamData[bin];
                var red = val;
                var green = 255 - val;
                var blue = val / 2;
                this._context.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
                this._context.fillRect(bin * 2, 0, 2, 256);
                // use lines and shapes to draw to the canvas is various ways. Use your imagination!
            }
            this._animFrame = window.requestAnimationFrame(this.drawViz);
        }
    });

    return UserAreas;
});
