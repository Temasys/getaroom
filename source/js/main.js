define([
    'react',
    'libs/skyway'
], function (
    React,
    Skyway
) {

var Skyway = new Skyway.Skyway()

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.renderComponent(<HelloMessage name="Visitor" />, mountNode);

});
