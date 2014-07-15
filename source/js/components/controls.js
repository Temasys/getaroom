/** @jsx React.DOM */

define([
    'react',
    'utils',
    'constants',
    'skyway',
    'router'
], function (
    React,
    Utils,
    Constants,
    Skyway,
    Router
) {

    var Controls = React.createClass({displayName: 'Controls',
        handleStartRoom: function(e) {
            var room = Utils.uuid(6);
            Router.setRoute('/' + room);
        },
        handleLeaveRoom: function(e) {
            Skyway.leaveRoom();
            Router.setRoute('/');
        },
        handleLinkClick: function (e) {
            e.target.setSelectionRange(0, e.target.value.length);
        },
        render: function() {
            var res = [];

           res.push(
                React.DOM.div( {className:"logo"}, "getaroom.io")
                );

            if(this.props.state.state === Constants.AppState.FOYER) {
                res.push(
                    React.DOM.button( {className:"joinRoom", onClick:this.handleStartRoom}, 
                        "Start a new call"
                    )
                    );

                res.push(
                    React.DOM.div( {className:"description"}, 
                        React.DOM.p(null, 
                            "Start a FREE call",React.DOM.br(null ),"with up to 3 others"
                        ),
                        React.DOM.p(null, 
                            "Just hit the \"Start a new call\" button below and share the link.",React.DOM.br(null ),React.DOM.br(null ),
                            "This app is a ", React.DOM.a( {href:"https://temasys.github.io", target:"_blank"}, "SkywayJS"), " tech demo and you can fork the ", React.DOM.a( {href:"https://github.com/serrynaimo/getaroom", target:"_blank"}, "code on github"),"."
                        )
                    )
                    );
            }
            else if(this.props.state.state === Constants.AppState.IN_ROOM) {
                res.push(
                    React.DOM.button( {className:"leaveRoom", onClick:this.handleLeaveRoom}, 
                        "Leave this call"
                    )
                    );

                res.push(
                    React.DOM.div( {className:"link"}, 
                        "Share this link to invite others",React.DOM.br(null ),
                        React.DOM.input( {type:"text", value:location.toString(), onClick:this.handleLinkClick, readOnly:true} )
                    )
                    );

                res.push(
                    React.DOM.div( {className:"status"}, "Status: ", this.props.state.room.status)
                    )
            }

            return (
                React.DOM.section( {id:"controls", className:this.props.state.controls ? 'visible' : ''}, 
                    React.DOM.div(null, 
                        res
                    )
                )
                )
        }
    });

    return Controls;
});
