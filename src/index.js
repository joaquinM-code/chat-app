//const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages');
const {addUser , removeUser , getUser , getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000;
//const publicDirectoryPath = path.join(__dirname , '../public');


app.use(express.static('public'));

//io.on is only used for new connections
io.on('connection' , (socket)=>{

    //configuring room joining
    socket.on('join', ({username , room},  callback)=>{
        const {error , user} = addUser({
            id: socket.id,//every conection carries an unique id that can be used
            username,
            room
        })

        if(error){
            return callback(error);
        }
    
        socket.join(user.room);
        //socket emmits the event only to the user that generates it
        socket.emit('message' , generateMessage(`Welcome ${user.username}!`));
        //socket.broadcast emmits the event to every user but the one that generates it to every room
        //socket.broadcast.to(destination).emit emits the message to everybody in the room but the one that generates it
        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined!`))
        callback();
    })
    
    socket.on('chatMessage' , (message , callback)=>{
        //Testing profanity filter
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');        }

        // io emits the event to every connected user
        io.emit('message' , generateMessage(message));
        callback();
    })

    socket.on('sendLocation' , (coords , callback)=>{
        io.emit('message' , generateMessage(`<a target="_blank" href="https://google.com/maps?q=${coords.lat},${coords.long}"> Here is my location </a>`));
        callback();
    })

    //for other events as diconection we use the next
    socket.on('disconnect' , ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message' , generateMessage(`${user.username} has left!`))
        }

        
    })
})

server.listen(port , ()=>{
    console.log('Listening on port ' + port)
})

