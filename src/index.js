import express from "express";
import cors from "cors"
import { createServer } from "http";
import { Server } from "socket.io";

// We are configuring our Express application 
const app = express();

let onlineUsers = []

app.use(cors())
app.get("/online-users", (req, res) => {
    res.send({ onlineUsers })
})

let privateChat = []

// app.get("/chat/:id",(req, res) => {
// if(privateChat.length > 1){
//     res
// }
// })

// We are creating an instance of a standard HTTP server based on our express config
const httpServer = createServer(app);

// We are creating a io server based on our HTTP server
const io = new Server(httpServer, { /* options */ });

// We are defining all of our event handlers
io.on("connection", (socket) => {
    // console.log(socket.id)
    // socket.emit("messege",{mes:"newUser"})
   

    // We are setting the username for the user
    // This doubles as a "login" event since we dont have an auth system
    socket.on("setUsername", ({ username, room }) => {
        console.log("newUser", username, room)

       

        onlineUsers.push({ username: username, socketId: socket.id, room: room })

        socket.join(room)
        console.log(socket.rooms)
        

        socket.emit("loggedin")
        socket.to(room).emit("newConnection")
    })

    // When we get a message from the frontend we broadcast it to all users in the room
    socket.on("sendmessage", ({ message, room }) => {
        console.log(socket)
        socket.emit("s", "works")
        // socket.broadcast.emit("message", message) // this is sending to all users except the sender
        socket.to(room).emit("message", message) // this is sending to all users in the room except the sender
    })


    socket.on("privateChat", ({ message, room }) => {
        console.log(socket)

        socket.join(room)
        socket.to(room).emit("dm", message) // this is sending to all users in the room except the sender
    })

    // socket.on("setChat",({message, chat}) =>{
    //     let privateChat = []
    //     console.log(privateChat)
    //     if(privateChat.length > 1){
    //         socket.join(chat)
    //         privateChat.push(socket.id)
    //         socket.emit("privateChat", message)
            
    //     }else{
    //         console.log("room full")
    //     }
        
    //     socket.emit("chat",{message})


    // } )
    // When we disconnect we remove the user from the online users list
    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`)
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    })
});

// We are starting our HTTP server and NOT our Express app
// Starting app.listen here would initialize and start another instance of a HTTP Server,
// which would be not including our io configuration
httpServer.listen(3030, () => {
    console.log("Listening on port 3030");
});