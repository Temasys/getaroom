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
   * Contains the UserAreas class element
   * The output list of Users
   */
  var UserAreas = React.createClass({
    render: function() {
      var showList = this.props.state.room.status === Constants.RoomState.CONNECTED ?
        <UserAreaList users={this.props.state.users} /> : <div id='noUser'></div>;

      return (
        <section id="userareas" className={this.props.state.room.screensharing ? 'screensharing' : 'split' + this.props.state.users.length}>
          {showList}
        </section>
      );
    }
  });

  /**
   * Contains the UserAreaList class element
   * The wrapper for UserArea
   */
  var UserAreaList = React.createClass({
    render: function() {
      var userareas = this.props.users.map(function(user) {
        return (
          <div key={user.id} className={'userarea' + (user.screensharing ? ' screensharing' : '')}>
            <UserArea user={user} />
          </div>
        );
      });

      return (
        <div>
          {userareas}
        </div>
      );
    }
  });

  /**
   * Contains the UserArea class element
   * The wrapper for a User information
   */
  var UserArea = React.createClass({
    /**
     * Handles the attaching of Stream
     */
    attachStream: function() {
      var video = document.getElementById('us' + this.props.user.id);

      if (video && this.props.user.stream) {
        // Re-render only when necessary
        if (this.props.user.renderStreamId !== this.props.user.stream.id) {
          window.attachMediaStream(video, this.props.user.stream);
          this.props.user.renderStreamId = this.props.user.stream.id;
        }
      }
    },

    /**
     * Handles when Stream is started
     */
    componentDidMount: function() {
      this.attachStream();
    },

    /**
     * Handles when Stream is updated
     */
    componentDidUpdate: function() {
      this.attachStream();
    },

    /**
     * Handles the rendering of the UserArea
     */
    render: function() {
      var res = [];

      // If User and no Stream available yet
      if(this.props.user.stream === null && this.props.user.id === 0) {
        res.push(
          <span className="userInfo">
            Share your camera and microphone to participate in the call
          </span>
        );

      // If User has error accessing Stream
      } else if(this.props.user.error && this.props.user.id) {
        res.push(
          <span className="userInfo">
            Stream could not be established
          </span>
        );

      // If Peer has joined the Room but Stream is initializing
      } else if(this.props.user.stream === null) {
        res.push(
          <span className="userInfo">
            Joining...
          </span>
        );

      // Initialize Peer or User DOM
      } else {
        // <video> element
        res.push(React.DOM.video({
          id: 'us' + this.props.user.id,
          autoPlay: true,
          muted: this.props.user.id === 0
        }));

        var muted = [];
        var disabled = [];

        // Status of audio in Stream
        if (!this.props.user.hasAudio) {
          disabled.push('Audio');
        } else if(this.props.user.audioMute) {
          muted.push('Audio');
        }

        // Status of video in Stream
        if (!this.props.user.hasVideo) {
          disabled.push('Video');
        } else if(this.props.user.videoMute) {
          muted.push('Video');
        }

        // If any has disabled
        // If any has muted
        res.push(
          <span className="userInfo">
            {disabled.length > 0 ? disabled.join('/') + ' disabled' : ''} <br/>
            {muted.length > 0 ? muted.join('/') + ' muted' : ''}
          </span>
        );
      }

      return (
        <div>
          {res}
        </div>
      );
    }
  });

  return UserAreas;
});
