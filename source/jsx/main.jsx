/** @jsx React.DOM */

define([
    'react',
    'skyway'
], function (
    React,
    Skyway
) {

var sky = new Skyway();

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.renderComponent(<HelloMessage name="Visitor" />,
    document.getElementById('notifications'));

});
