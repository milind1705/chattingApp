const express = require('express');
const http = require('http');
const path = require('path');
const port = process.env.PORT || 3000 
const socketio = require('socket.io');
const formatMessage = require('./utils/massages')
const botname = "chat-cord-bot";
const {userJoin, userLeave, getRoomUsers, getCurrentUser} = require('./utils/user')

const app = express();
const server = http.createServer(app)
const io = socketio(server)
app.use(express.static(path.join(__dirname, 'public')))

//run when client connect
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit('message', formatMessage(botname,  "welcme to chatcord!"));

        //Brodcast when user connects
        socket.broadcast.to(user.room).emit("message",  formatMessage(botname,`${user.username} has joined the chat`));
    });

    // listen to the chat message
    const user = getCurrentUser(socket.id);
    socket.on('chatMessage', (msg) => {
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
      //runs when client disconnect
      socket.on('disconnect', () => {
          const user = userLeave(socket.id);

          if(user){

              io.to(user.room).emit('message',  formatMessage(botname, `${user.username} has left the chat`))
          }
    });
})

server.listen(port, () => {
    console.log(`server is running on port ${port}`)
})