/* 
nosc broker server client lib

Eventually this will be rolled into nosc-server and served up (similar to how socket.io works)
*/
define(['/socket.io/socket.io.js'], function(io) {
// nosc-client

  var socket = io();

  var onNosc = function(handlerFunction) {
    var handleIndividualMessage = function(message, sender) {
      console.log('nosc-message <= ', message, sender);
      handlerFunction(message);
    };

    socket.on('nosc-message', function(message, sender) {
      if (message[0] == '#bundle' && message.length > 2) {
        var subMessages = message.slice(2);
        subMessages.forEach(function(subMessage) {
          handleIndividualMessage(subMessage, sender);
        });
      }
      else 
        handleIndividualMessage(message, sender);
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