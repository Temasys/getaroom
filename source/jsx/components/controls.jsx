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

      // Commenting this out. This may result in not so good UX but it works cross-browsers
      window.location.href = '/' + room + '?mcu=' + (this.props.state.room.useMCU ? '1' : '0');
      //Router.setRoute('/' + room);
    },

    /**
     * Handle leave room button
     */
    handleLeaveRoom: function() {
      Skylink.leaveRoom();
      Router.setRoute('/');
    },

    /**
     * Handle the toggle mute video button
     */
    handleVideoMute: function() {
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      Skylink[user.videoMute ? 'enableVideo' : 'disableVideo']();
    },

    /**
     * Handle the toggle mute audio button
     */
    handleAudioMute: function() {
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

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
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      if(!this.props.state.room.screensharing) {
        // Dispatch to all element
        Dispatcher.sharescreen(true);
        // Start sharing screen
        Skylink.shareScreen();

      } else if(user.screensharing) {
        // Dispatch to all element
        Dispatcher.sharescreen(false);
        // Stop sharing screen
        Skylink.stopScreen();
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

      res.push(<div className="logo">getaroom.io</div>);

      // Controls state when in foyer
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
                  This app is a <a href="https://temasys.github.io" target="_blank">SkylinkJS</a> tech demo and you can fork the <a href="https://github.com/Temasys/getaroom" target="_blank">code on github</a>.
              </p>
          </div>
        );

        res.push(
          <div className="link">
              <input type="checkbox" id="mcu" name="mcu" onClick={this.handleMCUClick} /> <label for="mcu">Use Skylink Media Relay</label>
          </div>
        );

      // Controls state when in Room
      } else if(this.props.state.state === Constants.AppState.IN_ROOM) {
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
          <div className="status">
            <span>Status: {this.props.state.room.status}</span>
            <p className="statusMessage">{this.props.state.room.error}</p>
          </div>
        );

        if(this.props.state.room.status === Constants.RoomState.CONNECTED && user.stream != null) {
          res.push(
            <button id="videoMute" onClick={this.handleVideoMute} className={user.videoMute ? '' : 'on'} title="Mute/Unmute Video"></button>
          );

          res.push(
            <button id="audioMute" onClick={this.handleAudioMute} className={user.audioMute ? '' : 'on'} title="Mute/Unmute Audio"></button>
          );

          res.push(
            <button id="screenshare" onClick={this.handleScreenshare} className={user.screensharing ? 'on' : ''} title="Share your screen"></button>
          );

          res.push(
            <button id="roomLock" onClick={this.handleRoomLock} className={this.props.state.room.isLocked ? '' : 'on'} title="Lock/Unlock Room"></button>
          );

          res.push(
            <div className="displayName">
                <span>Display Name</span>
                <input id="displayName" type="text" value={user.name} placeholder="Display Name"
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
