
var mumble = require('mumble');
var DelayedStream = require('delayed-stream');

var unique = Date.now() % 10;

mumble.connect( 'localhost:5432', function( error, connection ) {
    if( error ) { throw new Error( error ); }

    connection.authenticate('loopback-' + unique);
    connection.on( 'initialized', function() {
        connection.outputStream().on('data', function(d) {
            setTimeout(function() {
                connection.inputStream().write(d);
            }, 5000);
        });
    });
});