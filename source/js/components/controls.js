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
    /**
     * Handle MCU toggle button
     */
    handleMCUClick: function(e) {
      Dispatcher.setMCU(e.target.checked);
    },

    /**
     * Handle when controls are updated
     */
    componentDidUpdate: function() {
      var $mcu = document.getElementById('mcu');
      if($mcu) {
        $mcu.checked = this.props.state.room.useMCU;
      }
    },

    /**
     * Handle start a call button
     */
    handleStartRoom: function() {
      //var room = this.props.state.room.useMCU ? 'm' : '';
      var room = Utils.uuid(6);
      var url = '/' + room;

      if (this.props.state.room.useMCU) {
        url += '?mcu=1';
      }

      // Check if history is supported, or else just redirect immdediately
      if (window.historyNotSupported) {
        window.location.href = url;
      } else {
        Router.setRoute(url);
      }
    },

    /**
     * Handle leave room button
     */
    handleLeaveRoom: function() {
      Skylink.leaveRoom();

      var url = '/'

      // Check if User is in room. If connecting, just redirect instantly to clear all current session
      if (this.props.state.room.status !== Constants.RoomState.CONNECTED) {
        window.location.href = url;
      } else {
        // Check if history is supported, or else just redirect immdediately
        if (window.historyNotSupported) {
          window.location.href = url;
        } else {
          Router.setRoute(url);
        }
      }
    },

    /**
     * Handle the toggle mute video button
     */
    handleVideoMute: function() {
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      if (!user.hasVideo) {
        return;
      }

      Skylink[user.videoMute ? 'enableVideo' : 'disableVideo']();
    },

    /**
     * Handle the toggle mute audio button
     */
    handleAudioMute: function() {
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      if (!user.hasAudio) {
        return;
      }

      Skylink[user.audioMute ? 'enableAudio' : 'disableAudio']();
    },

    /**
     * Handles the room lock button
     */
    handleRoomLock: function() {
      if(this.props.state.users.length < Configs.maxUsers) {
        Skylink[this.props.state.room.isLocked ? 'unlockRoom' : 'lockRoom']();
      }
    },

    /**
     * Handles the screensharing button
     */
    handleScreenshare: function() {
      // Disable user from pressing multiple times invokes
      //  until screensharing screen has processed
      if (this.props.state.room.preventScreenshare) {
        return;
      }
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];
      var sharing = false;

      if(!user.screensharing) {
        this.props.state.room.preventScreenshare = true;
        sharing = true;
      } else {
        sharing = false;
      }

      if (sharing) {
        this.props.state.users[0].screensharingPriority = (new Date ()).getTime();

        Skylink.setUserData(Utils.extend(Skylink.getUserData(), {
          screensharingPriority: this.props.state.users[0].screensharingPriority
        }));

        Skylink.shareScreen();

      } else {
        // Dispatch to all element
        //Dispatcher.sharescreen(false);
        // Stop sharing screen
        Skylink.stopScreen();
      }
    },

    /**
     * Handles the recording option
     */
    handleRecording: function () {
      if (this.props.state.room.preventRecording || this.props.state.room.preventRecordingOneUser ||
        !this.props.state.room.hasMCU) {
        return;
      }

      if(!this.props.state.room.isRecording) {
        // Prevent multiple clicks for now
        this.props.state.room.preventRecording = true;
        Skylink.startRecording();

      } else {
        Skylink.stopRecording();
      }
    },

    /**
     * Handles the link share textbox
     */
    handleLinkClick: function (e) {
      e.target.setSelectionRange(0, e.target.value.length);
    },

    /**
     * Handles the close controls button
     */
    handleClose: function(e) {
      Dispatcher.toggleControls();
    },

    /**
     * Handles the display name textbox
     */
    handleDisplayName: function (e) {
      Dispatcher.setName(e.currentTarget.value);
    },

    /**
     * Handles rendering the controls
     */
    render: function() {
      var res = [];
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      res.push(React.DOM.div({className: 'logo ' + (this.props.state.room.status === Constants.RoomState.CONNECTED ? 'joinRoom' : '')}, "getaroom.io"));

      // Controls state when in foyer
      if(this.props.state.state === Constants.AppState.FOYER) {
        res.push(
          React.DOM.button({className: "joinRoom mainControl", onClick: this.handleStartRoom}, 
              "Start a new call"
          )
        );

        res.push(
          React.DOM.div({className: "description"}, 
              React.DOM.p(null, 
                  "Start a FREE call", React.DOM.br(null), "with up to ", Configs.maxUsers, " people"
              ), 
              React.DOM.p(null, 
                  "Just hit the \"Start a new call\" button below and share the link.", React.DOM.br(null), React.DOM.br(null), 
                  "This app is a ", React.DOM.a({href: "https://temasys.github.io", target: "_blank"}, "SkylinkJS"), " tech demo and you can fork the ", React.DOM.a({href: "https://github.com/Temasys/getaroom", target: "_blank"}, "code on github"), "."
              )
          )
        );

        res.push(
          React.DOM.div({className: "link"}, 
              React.DOM.input({type: "checkbox", id: "mcu", name: "mcu", onClick: this.handleMCUClick}), " ", React.DOM.label({for: "mcu"}, "Use Skylink Media Relay")
          )
        );

      // Controls state when in Room
      } else if(this.props.state.state === Constants.AppState.IN_ROOM) {
        res.push(
          React.DOM.button({className: "leaveRoom mainControl", onClick: this.handleLeaveRoom}, 
              "Leave this call"
          )
        );

        res.push(
          React.DOM.div({className: "link"}, 
              "Invite others to join this call at this link:", React.DOM.br(null), 
              React.DOM.input({type: "text", value: location.toString(), onClick: this.handleLinkClick, readOnly: true})
          )
        );

        res.push(
          React.DOM.div({className: "status"}, 
            React.DOM.span(null, "Status: ", this.props.state.room.status), 
            React.DOM.p({className: "statusMessage"}, this.props.state.room.error)
          )
        );

        if(this.props.state.room.status === Constants.RoomState.CONNECTED && user.stream != null) {
          res.push(
            React.DOM.button({id: "videoMute", onClick: this.handleVideoMute, className: this.props.state.users[0].hasVideo ? (user.videoMute ? '' : 'on') : 'off muted', title: "Mute/Unmute Video"})
          );

          res.push(
            React.DOM.button({id: "audioMute", onClick: this.handleAudioMute, className: this.props.state.users[0].hasAudio ? (user.audioMute ? '' : 'on') : 'off muted', title: "Mute/Unmute Audio"})
          );

          res.push(
            React.DOM.button({id: "screenshare", onClick: this.handleScreenshare, className: (user.screensharing ? 'on' : '') + ' ' + (this.props.state.room.preventScreenshare ? 'muted' : ''), title: "Share your screen"})
          );

          res.push(
            React.DOM.button({id: "roomLock", onClick: this.handleRoomLock, className: this.props.state.room.isLocked ? '' : 'on', title: "Lock/Unlock Room"})
          );

          if (this.props.state.room.hasMCU) {
            res.push(
              React.DOM.button({id: "recording", onClick: this.handleRecording, className: (this.props.state.room.isRecording ? 'on' : '') + ' ' + (this.props.state.room.preventRecording || this.props.state.room.preventRecordingOneUser ? 'muted' : ''), title: "Start/Stop Recording"})
            );
          }

          res.push(
            React.DOM.div({className: "displayName"}, 
                React.DOM.span(null, "Display Name"), 
                React.DOM.input({id: "displayName", type: "text", value: user.name, placeholder: "Display Name", 
                    title: "Your Display Name in Chat", onChange: this.handleDisplayName})
            )
          );

        }
      }

      return (
        React.DOM.section({id: "controls"}, 
            React.DOM.nav(null, 
                React.DOM.button({onClick: this.handleClose, className: this.props.state.state === Constants.AppState.IN_ROOM ? 'close' : ''}), 
                React.DOM.button(null), 
                React.DOM.button(null)
            ), 
            React.DOM.div(null, 
                res
            )
        )
      );
    }
  });

  return Controls;
});
