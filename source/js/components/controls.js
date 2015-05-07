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

    var Controls = React.createClass({displayName: 'Controls',
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
                    audio: false,
                    video: true,
                }, null, true);

                Dispatcher.sharescreen(true);
            }
            else if(user.screensharing) {

                Skylink.getUserMedia({
                    audio: true,
                    video: true,
                });

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
                React.DOM.div( {className:"logo"}, "getaroom.io")
                );

            if(this.props.state.state === Constants.AppState.FOYER) {
                res.push(
                    React.DOM.button( {className:"joinRoom mainControl", onClick:this.handleStartRoom}, 
                        "Start a new call"
                    )
                    );

                res.push(
                    React.DOM.div( {className:"description"}, 
                        React.DOM.p(null, 
                            "Start a FREE call",React.DOM.br(null ),"with up to ", Configs.maxUsers, " people"
                        ),
                        React.DOM.p(null, 
                            "Just hit the \"Start a new call\" button below and share the link.",React.DOM.br(null ),React.DOM.br(null ),
                            "This app is a ", React.DOM.a( {href:"https://temasys.github.io", target:"_blank"}, "SkylinkJS"), " tech demo and you can fork the ", React.DOM.a( {href:"https://github.com/serrynaimo/getaroom", target:"_blank"}, "code on github"),"."
                        )
                    )
                    );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    React.DOM.button( {className:"leaveRoom mainControl", onClick:this.handleLeaveRoom}, 
                        "Leave this call"
                    )
                    );

                res.push(
                    React.DOM.div( {className:"link"}, 
                        "Share this link to invite others into this call",React.DOM.br(null ),
                        React.DOM.input( {type:"text", value:location.toString(), onClick:this.handleLinkClick, readOnly:true} )
                    )
                    );

                res.push(
                    React.DOM.div( {className:"status"}, "Status: ", this.props.state.room.status)
                    );

                if(this.props.state.room.status === Constants.RoomState.CONNECTED && user.stream != null) {
                    res.push(
                        React.DOM.button( {id:"roomLock", onClick:this.handleRoomLock, className:this.props.state.room.isLocked ? '' : 'on', title:"Lock/Unlock Room"})
                        );

                    res.push(
                        React.DOM.button( {id:"videoMute", onClick:this.handleVideoMute, className:user.videoMute ? '' : 'on', title:"Mute/Unmute Video"})
                        );

                    res.push(
                        React.DOM.button( {id:"audioMute", onClick:this.handleAudioMute, className:user.audioMute ? '' : 'on', title:"Mute/Unmute Audio"})
                        );

                    res.push(
                        React.DOM.button( {id:"screenshare", onClick:this.handleScreenshare, className:user.screensharing ? 'on' : (this.props.state.room.screensharing ? 'muted' : ''), title:"Share your screen"})
                        );
                }
            }

            return (
                React.DOM.section( {id:"controls", className:this.props.state.controls ? 'visible' : ''}, 
                    React.DOM.nav(null, 
                        React.DOM.button( {onClick:this.handleClose, className:this.props.state.state === Constants.AppState.IN_ROOM ? 'close' : ''}),
                        React.DOM.button(null),
                        React.DOM.button(null)
                    ),
                    React.DOM.div(null, 
                        res
                    )
                )
                )
        }
    });

    return Controls;
});
