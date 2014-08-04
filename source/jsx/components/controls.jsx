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
        getInitialState: function() {
            return {
                audioMute: false,
                videoMute: false
            }
        },
        handleStartRoom: function(e) {
            var room = Utils.uuid(6);
            Router.setRoute('/' + room);
        },
        handleLeaveRoom: function(e) {
            Skyway.leaveRoom();
            Router.setRoute('/');
        },
        handleVideoMute: function(e) {
            this.setState({
                videoMute: !this.state.videoMute
            });
        },
        handleAudioMute: function(e) {
           this.setState({
                audioMute: !this.state.audioMute
            });
        },
        handleLinkClick: function (e) {
            e.target.setSelectionRange(0, e.target.value.length);
        },
        render: function() {
            var res = [];

           res.push(
                <div className="logo">getaroom.io</div>
                );

            if(this.props.state.state === Constants.AppState.FOYER) {
                res.push(
                    <button className="joinRoom mainControl" onClick={this.handleStartRoom}>
                        Start a new call
                    </button>
                    );

                res.push(
                    <div className="description">
                        <p>
                            Start a FREE call<br />with up to 3 others
                        </p>
                        <p>
                            Just hit the &quot;Start a new call&quot; button below and share the link.<br /><br />
                            This app is a <a href="https://temasys.github.io" target="_blank">SkywayJS</a> tech demo and you can fork the <a href="https://github.com/serrynaimo/getaroom" target="_blank">code on github</a>.
                        </p>
                    </div>
                    );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    <button className="leaveRoom mainControl" onClick={this.handleLeaveRoom}>
                        Leave this call
                    </button>
                    );

                res.push(
                    <div className="link">
                        Share this link to invite others<br />
                        <input type="text" value={location.toString()} onClick={this.handleLinkClick} readOnly />
                    </div>
                    );

                res.push(
                    <div className="status">Status: {this.props.state.room.status}</div>
                    );

                res.push(
                    <button id="videoMute" onClick={this.handleVideoMute} className={this.state.videoMute ? 'muted' : ''} title="Mute/Unmute Video"></button>
                    );

                res.push(
                    <button id="audioMute" onClick={this.handleAudioMute} className={this.state.audioMute ? 'muted' : ''} title="Mute/Unmute Audio"></button>
                    );
            }

            return (
                <section id="controls" className={this.props.state.controls ? 'visible' : ''}>
                    <div>
                        {res}
                    </div>
                </section>
                )
        }
    });

    return Controls;
});
