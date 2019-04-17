/* 
    REFERENCE: https://socket.io/get-started/chat 
*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.use(express.static('.'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var connectedUsers = [];

io.on('connection', function(socket){

    // console.log('a user connected');

    socket.on('new player', function(data) {
        connectedUsers.push({
            username : data,
            id: socket.id,
            connected: new Date()
        });
        notifyPlayersChanged(connectedUsers);
    });

    socket.on('disconnect', function(){
        //remove the disconnected player from the players list.
        connectedUsers = connectedUsers.filter(function( obj ) {
            return obj.id !== socket.id;
        });
        notifyPlayersChanged(connectedUsers);
    });

    socket.on('chat message', function(msg){
        console.log("new message from id " + socket.id);
        console.log(getUsername(socket.id))
        io.emit('chat message', getUsername(socket.id) + ": " + msg);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//notify clients that the player pool has changed.
function notifyPlayersChanged(newPlayers) {
    io.sockets.emit('playerUpdate', newPlayers);
}

//utility function to get the username with a socket id.
function getUsername(id) {
    console.log(connectedUsers)
    let result = connectedUsers.find( user => user.id === id );
    if (result == undefined) {
        return '';
    }
    return result.username;
}