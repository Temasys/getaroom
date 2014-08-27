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
                this.props.state.room.status === Constants.RoomState.CONNECTED ?
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
            clearInterval(this._sampleInterval);
            cancelAnimationFrame(this._animFrame);

            if(this.props.user.stream !== null) {

                if(this.props.user.videoMute) {
                    if(!this.props.user.audioMute) {
                        this.analyseAudio(this.props.user.stream, this.props.user.id === 0);
                    }

                    this._canvasElement = document.getElementById('uc' + this.props.user.id);
                    this._context = this._canvasElement.getContext('2d');

                    this.drawViz();
                }
                else {
                    window.attachMediaStream(
                        document.getElementById('us' + this.props.user.id),
                            this.props.user.stream);
                }
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
                    React.DOM.span( {className:"userInfo"}, 
                        "Share your camera and microphone to participate in the call"
                    )
                );
            }
            else if(this.props.user.stream === null) {
                res.push(
                    React.DOM.span( {className:"userInfo"}, 
                        "Joining..."
                    )
                );
            }
            else {
                if(this.props.user.videoMute) {
                    res.push(
                        React.DOM.canvas( {id:'uc' + this.props.user.id, width:"256", height:"256"})
                        );
                }
                else {
                    res.push(React.DOM.video({
                            id: 'us' + this.props.user.id,
                            autoPlay: true,
                            muted: this.props.user.id === 0
                        }));
                }

                var muted = [];

                if(this.props.user.audioMute) {
                    muted.push('Audio');
                }
                if(this.props.user.videoMute) {
                    muted.push('Video');
                }

                if(muted.length > 0) {
                    res.push(
                        React.DOM.span( {className:"userInfo"}, 
                            muted.join('/'), " muted"
                        )
                    );
                }
            }

            return (
                React.DOM.div(null, 
                    res
                )
                );
        },
        analyseAudio: function(stream, muted) {
            var self = this;

            if(!this._source) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext); // this is because it's not been standardised accross browsers yet.
                this._analyser = this._audioCtx.createAnalyser();
                this._analyser.fftSize = 256;
                this._gain = this._audioCtx.createGain();
                this._gain.value = 0.8;

                this._source = this._audioCtx.createMediaStreamSource(stream); // this is where we hook up the <audio> element
                this._source.connect(this._analyser);
                this._source.connect(this._gain);

                if(!muted) {
                    this._analyser.connect(this._audioCtx.destination);
                }
            }

            var sampleAudioStream = function() {
                self._analyser.getByteFrequencyData(self._streamData);
            };

            this._volume = 0;
            this._streamData = new Uint8Array(128);

            this._sampleInterval = window.setInterval(sampleAudioStream, 100);

        },
        drawViz: function() {
            this._loop = (this._loop || 0) + 1;
            if(this._loop > 360) {
                this._loop = 0;
            }
            for(var bin = -127; bin < 128; bin++) {
                var val = this._streamData[Math.abs(bin)];
                var h = this._loop;
                var s = 100;
                var l = Math.min(val, Math.abs(bin)/128*100);
                this._context.fillStyle = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
                this._context.fillRect(bin + 128, 0, 1, 255);
            }
            this._animFrame = window.requestAnimationFrame(this.drawViz);
        }
    });

    return UserAreas;
});
