/** @jsx React.DOM */

define([
    'react',
    'utils',
    'constants',
    'configs',
    'skylink',
    'router'
], function (
    React,
    Utils,
    Constants,
    Configs,
    Skylink,
    Router
) {

    var Controls = React.createClass({
        handleStartRoom: function() {
            var room = Utils.uuid(6);
            Router.setRoute('/' + room);
        },
        handleLeaveRoom: function() {
            Skylink.leaveRoom();
            Router.setRoute('/');
        },
        handleVideoMute: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];
	        Skylink[user.videoMute ? 'enableVideo' : 'disableVideo']();
        },
        handleAudioMute: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];
	        Skylink[user.audioMute ? 'enableAudio' : 'disableAudio']();
        },
        handleRoomLock: function() {
            if(this.props.state.users.length < Configs.maxUsers) {
                Skylink[this.props.state.room.isLocked ? 'unlockRoom' : 'lockRoom']();
            }
        },
        handleScreenshare: function() {
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];

            if(!this.props.state.room.screensharing) {

                Skylink.getUserMedia({
                    audio: true,
                    video: true,
                }, null, true);

                Dispatcher.sharescreen(true);
            }
            else if(user.screensharing) {
                Dispatcher.sharescreen(false);
            }
        },
        handleLinkClick: function (e) {
            e.target.setSelectionRange(0, e.target.value.length);
        },
        handleClose: function(e) {
            e.target.parentElement.parentElement.parentElement.children[0].click();
        },
        render: function() {
            var res = [];
            var user = this.props.state.users.filter(function (user) {
                return user.id === 0;
            })[0];

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
                            Start a FREE call<br />with up to {Configs.maxUsers} people
                        </p>
                        <p>
                            Just hit the &quot;Start a new call&quot; button below and share the link.<br /><br />
                            This app is a <a href="https://temasys.github.io" target="_blank">SkylinkJS</a> tech demo and you can fork the <a href="https://github.com/serrynaimo/getaroom" target="_blank">code on github</a>.
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
                        Share this link to invite others into this call<br />
                        <input type="text" value={location.toString()} onClick={this.handleLinkClick} readOnly />
                    </div>
                    );

                res.push(
                    <div className="status">Status: {this.props.state.room.status}</div>
                    );

                if(this.props.state.room.status === Constants.RoomState.CONNECTED && user.stream != null) {
                    res.push(
                        <button id="roomLock" onClick={this.handleRoomLock} className={this.props.state.room.isLocked ? '' : 'on'} title="Lock/Unlock Room"></button>
                        );

                    res.push(
                        <button id="videoMute" onClick={this.handleVideoMute} className={user.videoMute ? '' : 'on'} title="Mute/Unmute Video"></button>
                        );

                    res.push(
                        <button id="audioMute" onClick={this.handleAudioMute} className={user.audioMute ? '' : 'on'} title="Mute/Unmute Audio"></button>
                        );

                    res.push(
                        <button id="screenshare" onClick={this.handleScreenshare} className={user.screensharing ? 'on' : (this.props.state.room.screensharing ? 'muted' : '')} title="Share your screen"></button>
                        );
                }
            }

            return (
                <section id="controls" className={this.props.state.controls ? 'visible' : ''}>
                    <nav>
                        <button onClick={this.handleClose} className={this.props.state.state === Constants.AppState.IN_ROOM ? 'close' : ''}></button>
                        <button></button>
                        <button></button>
                    </nav>
                    <div>
                        {res}
                    </div>
                </section>
                )
        }
    });

    return Controls;
});
