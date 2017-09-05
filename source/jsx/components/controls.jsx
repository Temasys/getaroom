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
    /**
     * Handle when controls are updated
     */
    componentDidUpdate: function() {
      var $mcu = document.getElementById('mcu');
      var $forceturn = document.getElementById('forceturn');

      if($mcu) {
        $mcu.checked = this.props.state.room.flags.mcu;
      }

      if($forceturn) {
        $forceturn.checked = this.props.state.room.flags.forceturn;
      }
    },

    /**
     * Handle MCU toggle button
     */
    handleMCUClick: function(e) {
      Dispatcher.flags('mcu', e.target.checked);
    },

    /**
     * Handle force TURN toggle button
     */
    handleforceTURNClick: function(e) {
      Dispatcher.flags('forceturn', e.target.checked);
    },

    /**
     * Handle start a call button
     */
    handleStartRoom: function() {
      var room = Utils.uuid(9);
      var url = '/' + room;

      if (this.props.state.room.flags.mcu) {
        url += '?mcu=1';
      }

      if (this.props.state.room.flags.forceturn) {
        url += '?forceturn=1';
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
      if (!this.props.state.users[0].video) {
        return;
      }

      Skylink[this.props.state.users[0].video.muted ? 'enableVideo' : 'disableVideo']();
    },

    /**
     * Handle the toggle mute audio button
     */
    handleAudioMute: function() {
      if (!this.props.state.users[0].audio) {
        return;
      }

      Skylink[this.props.state.users[0].audio.muted ? 'enableAudio' : 'disableAudio']();
    },

    /**
     * Handles the room lock button
     */
    handleRoomLock: function() {
      Skylink[this.props.state.room.states.locked ? 'unlockRoom' : 'lockRoom']();
    },

    /**
     * Handles the screensharing button
     */
    handleScreenshare: function() {
      // Disable user from pressing multiple times invokes until screensharing screen has processed
      if (this.props.state.room.preventScreenshare) {
        return;
      }

      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      if (!user.screensharing) {
        // Prevent multiple clicks
        this.props.state.room.preventScreenshare = true;
        Skylink.shareScreen(true);
      } else {
        Skylink.stopScreen();
      }
    },

    /**
     * Handles the recording option
     */
    handleRecording: function () {
      if (this.props.state.room.preventRecording) {
        return;
      }

      if(!this.props.state.room.isRecording) {
        // Prevent multiple clicks
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

      // Render the logo first
      res.push(<div className={'logo' + (this.props.state.room.status === Constants.RoomState.CONNECTED ? ' joinRoom' : '') +
        (this.props.state.room.states.recording ? ' recording' : '')}>getaroom.io</div>);

      switch (this.props.state.state) {
        //// Controls state when in foyer
        case Constants.AppState.FOYER:
          // Render "Start call" button
          res.push(
            <button className="joinRoom mainControl" onClick={this.handleStartRoom}>
                Start a new call
            </button>
          );

          // Render the text
          res.push(
            <div className="description">
                <p>
                    Start a FREE call<br/>with up to 4 people
                </p>
                <p>
                    Just hit the &quot;Start a new call&quot; button below and share the link.<br /><br />
                    This app is a <a href="https://skylink.io" target="_blank">SkylinkJS</a> tech demo and you can fork the <a href="https://github.com/Temasys/getaroom" target="_blank">code on github</a>.
                </p>
            </div>
          );
  
          // Render the checkbox to allow MCU
          res.push(
            <div className="link">
                <input type="checkbox" id="mcu" name="mcu" onClick={this.handleMCUClick} /> <label for="mcu">Use Skylink Media Relay</label>
            </div>
          );

          // Render the checkbox to force TURN connections
          res.push(
            <div className="link">
                <input type="checkbox" id="forceturn" name="forceturn" onClick={this.handleForceTURNClick} /> <label for="forceturn">Force Skylink TURN Connections</label>
            </div>
          );
          break;

        //// Controls state when in Room
        case Constants.AppState.IN_ROOM:
          res.push(
            <button className="leaveRoom mainControl" onClick={this.handleLeaveRoom}>
                Leave this call
            </button>
          );

          res.push(
            <div className="link">
                Invite others to join this call at this link:<br />
                <input type="text" value={location.toString()} onClick={this.handleLinkClick} readOnly />
            </div>
          );
  
          res.push(
            <div className="status">
              <span>Status: {this.props.state.room.status}</span>
              <p className="statusMessage">{this.props.state.room.error}</p>
            </div>
          );
  
          if(this.props.state.room.status === Constants.RoomState.CONNECTED && this.props.state.users[0].stream.current != null) {
            if (this.props.state.users[0].video) {
              res.push(
                <button id="videoMute" onClick={this.handleVideoMute} className={this.props.state.users[0].stream.video.muted ? 'off' : 'on'} title="Mute/Unmute Video"></button>
              );
            }

            if (this.props.state.users[0].audio) {
              res.push(
                <button id="audioMute" onClick={this.handleAudioMute} className={this.props.state.users[0].stream.audio.muted ? 'off' : 'on'} title="Mute/Unmute Audio"></button>
              );
            }

            res.push(
              <button id="screenshare" onClick={this.handleScreenshare} className={(this.props.state.users[0].screensharing ? 'on' : '') + ' ' + (this.props.state.room.prevent.screenshare ? 'muted' : '')} title="Share your screen"></button>
            );
  
            res.push(
              <button id="roomLock" onClick={this.handleRoomLock} className={this.props.state.room.states.locked ? '' : 'on'} title="Lock/Unlock Room"></button>
            );
  
            if (this.props.state.room.states.mcu) {
              res.push(
                <button id="recording" onClick={this.handleRecording} className={(this.props.state.room.states.recording ? 'on' : '') + ' ' + (this.props.state.room.prevent.recording ? 'muted' : '')} title="Start/Stop Recording"></button>
              );
            }
  
            res.push(
              <div className="displayName">
                  <span>Display Name</span>
                  <input id="displayName" type="text" value={this.props.state.users[0].name} placeholder="Display Name"
                      title="Your Display Name in Chat" onChange={this.handleDisplayName} />
              </div>
            );
  
          }
      }

      return (
        <section id="controls">
            <nav>
                <button onClick={this.handleClose} className={this.props.state.state === Constants.AppState.IN_ROOM ? 'close' : ''}></button>
                <button></button>
                <button></button>
            </nav>
            <div>
                {res}
            </div>
        </section>
      );
    }
  });

  return Controls;
});
