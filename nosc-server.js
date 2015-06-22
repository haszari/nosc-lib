/*
nosc broker server

Connects to an OSC client (using node-osc module) 
and a websocket client (using socket-io). 

Forwards osc messages in both directions. 

The websocket client messages are marked 'nosc-message'.

Why?
This allows you to bridge an OSC-communicating app, for example 
SuperCollider, with a web browser client, for control and/or visualisation.

Parameters:
- expressApp: an express app instance (used for serving client lib script)
- httpServer: a node http instance
- oscInPort: port number to use for the broker OSC server (send osc)
- oscOutPort: port number of the OSC server (recieve osc)

Example: 
var express = require('express')
var app = express();
var http = require('http').Server(app);

var noscServer = require('./nosc-server');
noscServer.listen(app, http, 5000, 5001);

TODO: 
- params for osc server/client details, i.e. don't assume localhost
- rename oscIn/Out oscServer/oscClient
*/

var osc = require('node-osc');
var socketIo = require('socket.io');

var noscSetup = function(expressApp, httpServer, oscInPort, oscOutPort) {
  var io = socketIo(httpServer);
  var oscServer = new osc.Server(oscInPort, 'localhost');
  var oscClient = new osc.Client('localhost', oscOutPort);

  // serve up client script
  expressApp.get('/nosc/nosc-client.js',function(req,res){
    res.sendfile(__dirname + '/nosc-client.js');
  });

  // set up osc server to recieve messages from whereever (e.g. SuperCollider)
  oscServer.on("message", function (msg, rinfo) {
    console.log("rx", msg);
    // forward the message on to nosc web client via socket
    io.emit("nosc-message", msg, rinfo);
  })

  // set up socket for receiving info from web client
  io.on('connection', function (socket) {
    // when we get a message, send it on to oscClient
    socket.on('nosc-message', function (data) {
      console.log(data);
      // [0] is the desired endpoint, i.e. the command
      // [1-2].. are the optional params
      if (data[2] != null)
        oscClient.send(data[0], data[1], data[2]);
      else if (data[1] != null)
        oscClient.send(data[0], data[1]);
      else
        oscClient.send(data[0]);
    });
  });
};

module.exports = {
  listen: noscSetup
};
