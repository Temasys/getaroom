/** @jsx React.DOM */

define([
  'react',
  'utils',
  'constants',
  'configs',
  'skylink',
  'marked'

], function (

  React,
  Utils,
  Constants,
  Configs,
  Skylink,
  Marked
) {

  var Chat = React.createClass({displayName: 'Chat',
    marked: Marked,

    /**
     * Handles when the chatbox is in focus
     */
    handleFocus: function(e) {
      if(e.target.tagName === 'A') {
        return;
      }
      Dispatcher.toggleControls(false);
      Dispatcher.toggleChat();
    },

    /**
     * Handles sending chat message
     */
    handleSendMessage: function(e) {
      if(!e.keyCode || e.keyCode === 13) {
        var user = this.props.state.users.filter(function (user) {
          return user.id === 0;
        })[0];

        Dispatcher.sendMessage(e.currentTarget.value);
        //Dispatcher.setName(e.currentTarget.value);

        e.currentTarget.value = '';
        Dispatcher.toggleControls(false);
      }
    },

    /**
     * Handles when Chat updates
     */
    componentDidUpdate: function() {
      var cont = document.getElementById('messages');
      if(cont) {
        cont.scrollTop = cont.scrollHeight;
      }
    },

    /**
     * Handles rendering of the Chat
     */
    render: function() {
      if(this.props.state.state !== Constants.AppState.IN_ROOM) {
        return (React.DOM.section({id: "chat", className: "offline"}));
      }

      var res = [];
      var messages = this.props.state.room.messages || [];
      var user = this.props.state.users.filter(function (user) {
        return user.id === 0;
      })[0];

      for(var i = 0; i < messages.length; i++) {
        var message = messages[i];

        var className = 'message';

        if(message.user === 0) {
          className = className + ' you';
        }

        if(message.type === Constants.MessageType.ACTION) {
          className = className + ' action';
        }

        // If adding image
        if(message.img) {
          res.push(
            React.DOM.div({key: message.date, className: className}, 
                React.DOM.img({src: message.img}), 
                React.DOM.span({className: "name"}, message.name), 
                React.DOM.span({className: "body", dangerouslySetInnerHTML: {__html: this.marked(message.content)}})
            )
          );
        // Else
        } else {
          res.push(
            React.DOM.div({key: message.date, className: className}, 
                React.DOM.span({className: "name"}, message.name), 
                React.DOM.span({className: "body", dangerouslySetInnerHTML: {__html: this.marked(message.content)}})
            )
          );
        }
      }

      return (
        React.DOM.section({id: "chat"}, 
            React.DOM.div(null, 
                React.DOM.div({id: "messages", onClick: this.handleFocus}, 
                    React.DOM.div(null, 
                       res
                    )
                ), 
                React.DOM.div({id: "input", className: this.props.state.room.status !== Constants.RoomState.CONNECTED ? 'disabled' : ''}, 
                    React.DOM.input({id: "messageInput", type: "text", placeholder: "Chat message", autoComplete: "off", onKeyDown: this.handleSendMessage})
                )
            )
        )
      )
    }
  });

  return Chat;
});
