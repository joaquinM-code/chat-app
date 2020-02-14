const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , '../public');


app.use(express.static('public'));

//io.on is only used for new connections
io.on('connection' , (socket)=>{
    console.log('New connection');
    //socket emmits the event only to a single user
    socket.emit('message' , "Welcome to our chat room!" );
    //socket.broadcast emmits the event to every user but the one that generates it
    socket.broadcast.emit('message' , 'A new user has joined!')

    socket.on('chatMessage' , (message , callback)=>{
        //Testing profanity filter
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');        }

        // io emits the event to every connected user
        io.emit('message' , message);
        callback();
    })

    socket.on('sendLocation' , (coords , callback)=>{
        io.emit('message' , `https://google.com/maps?q=${coords.lat},${coords.long}`);
        callback();
    })

    //for other events as diconection we use the next
    socket.on('disconnect' , ()=>{
        io.emit('message' , 'A user has left!')
    })
})

server.listen(port , ()=>{
    console.log('Listening on port ' + port)
})

