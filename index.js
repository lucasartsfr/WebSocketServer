const express = require('express');
const app = express();
const http = require("https");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

// Socket IO
const io = new Server(server, {
    path: '/websocket/chat/socket.io',
    cors: {
        origin: "*",
      },
});


io.on('connection', (socket) => {
    // On Connect
    //console.log("Connected to", socket.id);
    //console.log(io.sockets.adapter.rooms);
    var currentRoomId;

    // Send Message
    socket.on('send_message', (data) => {
        socket.to(data.room).emit("recieve_message", data); // Listen the Room .to(data.room) and send Event with Emit
    })


    // Join a Room
    socket.on('join_room', (data) =>{
        socket.join(data.room); // When Join Room
        currentRoomId = data.room;
        
        const usersInRoom = io.sockets.adapter.rooms.get(data.room);    
        // Emit Users in Room
        io.to(data.room).emit("user_inroom", {
            room: data.room,
            users: Array.from(usersInRoom),
            username : data.username
        });
    });

    // On Disconnect
    socket.on('disconnect', () => {
        console.log('Disconnected from', socket.id);
        const usersInRoom =  io?.sockets?.adapter?.rooms?.get(currentRoomId) || [];    
        const Loop = Array.from(usersInRoom);    
        // Get Rooms of Disconnected User
        socket.to(currentRoomId).emit("user_disconnected", {
            d_user : socket.id,
            d_room : currentRoomId,
            d_array : Loop
        });
        
    });
})


server.listen(3054, () => {
    console.log('Server Run')
})
