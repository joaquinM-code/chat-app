//const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage , encodeHTML} = require('./utils/messages');
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
            username: encodeHTML(username),
            room
        })

        if(error){
            return callback(error);
        }
    
        socket.join(user.room);
        //socket emmits the event only to the user that generates it
        socket.emit('message' , generateMessage(`Welcome ${user.username}!` , user.room));
        //socket.broadcast emmits the event to every user but the one that generates it to every room
        //socket.broadcast.to(destination).emit emits the message to everybody in the room but the one that generates it
        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined!` , user.room))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback();
    })
    
    socket.on('chatMessage' , (message , callback)=>{
        message = encodeHTML(message);
        const user = getUser(socket.id);

        //Testing profanity filter
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');        }

        // io emits the event to every connected user
        io.to(user.room).emit('message' , generateMessage(message , user.username));
        callback();
    })

    socket.on('sendLocation' , (coords , callback)=>{
        const user = getUser(socket.id);
        console.log(user.username)
        io.to(user.room).emit('message' , generateMessage(`<a target="_blank" href="https://google.com/maps?q=${coords.lat},${coords.long}"> Here is my location </a>`, user.username));
        callback();
    })

    //for other events as diconection we use the next
    socket.on('disconnect' , ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message' , generateMessage(`${user.username} has left!` , user.room));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })
})

server.listen(port , ()=>{
    console.log('Listening on port ' + port)
})

