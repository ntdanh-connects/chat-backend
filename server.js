const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const buildContainer = require("./src/config/container.js");
const createMessageRouter = require('./src/presentation/http/messageRouter.js');
const registerMessageSocketHandlers = require("./src/presentation/socket/messageSocket.js");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server,{
  cors: {origin: "*"},
});

const container = buildContainer(io);

app.use("/api/rooms", createMessageRouter(container.getMessagesUseCase, container.sendMessageUseCase));

const onlineUsers = new Map();
io.on("connection", (socket)=>{
  registerMessageSocketHandlers(io,socket,container.sendMessageUseCase, onlineUsers);
  //Sau này có Call Socket, Noti socket chỉ:
  //Như bước trên 
});

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



