/* 
nosc broker server client lib

Eventually this will be rolled into nosc-server and served up (similar to how socket.io works)
*/
define(['/socket.io/socket.io.js'], function(io) {
// nosc-client

  var socket = io();

  var onNosc = function(handlerFunction) {
    socket.on('nosc-message', function(message, sender) {
      console.log('nosc-message <= ', message, sender);
      handlerFunction(message);
    });
  };
  
  var sendNosc = function(message) {
    console.log('nosc-message => ', message);
    socket.emit('nosc-message', message);
  };

  return {
    on: onNosc,
    send: sendNosc
  };
});