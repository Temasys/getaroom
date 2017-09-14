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

  /**
   * The entire user areas component that wraps the `UserAreaList`.
   * @class UserAreas
   */
  var UserAreas = React.createClass({

    render: function() {
      var app = this;
      var userAreaList = app.props.state.room.status === Constants.RoomState.CONNECTED ?
        <UserAreaList users={app.props.state.users} /> : <div id='noUser'></div>;

      return (
        <section id="userareas" className={app.props.state.room.states.screensharing ? 'screensharing' : 'split' + Utils.keys(app.props.state.users).length}>
          {userAreaList}
        </section>
      );
    }

  });

  /**
   * The wrapper for `UserArea` component.
   * @class UserAreaList
   */
  var UserAreaList = React.createClass({

    render: function() {
      var scope = this;
      var outputHTML = [];

      Utils.forEach(scope.props.users, function (user, userId) {
        outputHTML.push(
          <div key={userId} className={'userarea' + (user.video && user.video.screensharing ? ' screensharing' : '')}>
            <UserArea user={user} userId={userId} />
          </div>
        )
      });

      return (<div>{outputHTML}</div>);
    }

  });

  /**
   * The user component.
   * @class UserArea
   */
  var UserArea = React.createClass({

    /**
     * Attaches the MediaStream to the <video> (or <object> for Temasys WebRTC Plugin) element.
     * @method handleMCUClick
     * @for Controls
     */
    attachStream: function() {
      var scope = this;
      var video = document.getElementById('stream-' + scope.props.userId);
      var renderedStreamId = document.getElementById('stream-id-' + scope.props.userId);

      if (video && renderedStreamId && scope.props.user.stream && scope.props.user.streamId !== renderedStreamId.value) {
        window.attachMediaStream(video, scope.props.user.stream);
        renderedStreamId.value = scope.props.user.streamId;
      }
    },

    componentDidMount: function() {
      this.attachStream();
    },

    componentDidUpdate: function() {
      this.attachStream();
    },

    render: function() {
      var scope = this;
      var outputHTML = [];

      // Self has not shared any stream.
      if (!scope.props.user.stream && scope.props.userId === 'self') {
        outputHTML.push(
          <span className="userInfo">
            Share your camera and microphone to participate in the call
          </span>
        );
      
      // If is not self and has not been connected
      } else if (!scope.props.user.connected && scope.props.userId !== 'self') {
        outputHTML.push(
          <span className="userInfo">
            Joining...
          </span>
        );

      // Peer is connected.
      } else {
        // Push the <video> element.
        outputHTML.push(React.DOM.video({
          id: 'stream-' + scope.props.userId,
          autoPlay: true,
          muted: scope.props.userId === 'self'
        }));

        outputHTML.push(React.DOM.input({
          id: 'stream-id-' + scope.props.userId,
          type: 'hidden',
          value: null
        }));

        var mediaMuted = [];
        var mediaDisabled = [];

        if (!scope.props.user.audio) {
          mediaDisabled.push('Audio');
        } else if(this.props.user.audio.muted) {
          mediaMuted.push('Audio');
        }

        if (!scope.props.user.video) {
          mediaDisabled.push('Video');
        } else if(this.props.user.video.muted) {
          mediaMuted.push('Video');
        }

        outputHTML.push(
          <span className="userInfo">
            {typeof scope.props.user.mcuConnected === 'boolean' && !scope.props.user.mcuConnected ? 'Connecting to MCU ...' : ''}<br/>
            {mediaDisabled.length > 0 ? mediaDisabled.join('/') + ' disabled' : ''} <br/>
            {mediaMuted.length > 0 ? mediaMuted.join('/') + ' muted' : ''}
          </span>
        );
      }

      return (<div>{outputHTML}</div>);
    }

  });

  return UserAreas;
});
