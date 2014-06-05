var connect = require('connect');
connect.createServer(connect.static(__dirname + '/source')).listen(8080);

