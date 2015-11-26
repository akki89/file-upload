/**
*	@description Heart of the fileupload
*	@module  Main
*	@requires module:hapi
*	@requires model:./config
*	@requires module:seaport
**/
'use strict';

var config = require("./config"),
    hapi = require('hapi'),
    seaport = require('seaport'),
    ports = seaport.connect('localhost', parseInt(process.env.SEAPORT || 9090));

var port = ports.register('gr:upload', { port: config.port, title: 'UPLOAD' }) ;
var server = hapi.createServer(config.address, port, config.hapiOptions);

/**
*	@desc By require('./routes') we inherit all the routed of the fileupload
**/
require('./routes')(server);

server.pack.register({
    plugin: require('good'),
    options: config.goodOptions
}, function (err) {
    server.start(function () {
        console.log('server started on: ' + config.address + ":" + config.port) ;
    }) ;
}) ;
