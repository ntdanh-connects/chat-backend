require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const buildContainer = require("./src/config/container.js");
const createMessageRouter = require('./src/presentation/http/messageRouter.js');
const registerMessageSocketHandlers = require("./src/presentation/socket/messageSocket.js");
const createAuthRouter = require("./src/presentation/http/authRouter.js");
const createRoomRouter = require("./src/presentation/http/roomRouter.js");
const createUserRouter = require("./src/presentation/http/userRouter.js");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  perMessageDeflate: {
    threshold: 1024,
  }
});

const container = buildContainer(io);

app.use("/api/auth", createAuthRouter(container.registerUseCase, container.loginUseCase));
app.use("/api/rooms", createRoomRouter(container.getOrCreateDirectRoom,container.getUserRoomsUseCase));
app.use("/api/users", createUserRouter(container.getSearchableUserUseCase));
app.use("/api/rooms", createMessageRouter(container.getMessagesUseCase, container.sendMessageUseCase));

const onlineUsers = new Map();
io.on("connection", (socket) => {
  registerMessageSocketHandlers(io, socket,container.roomRepository, container.sendMessageUseCase, onlineUsers);
  //Sau này có Call Socket, Noti socket chỉ:
  //Như bước trên 
});

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log('Sigterm received, closing HTTP & Socket.io server....');
  io.close(() => {
    server.close(() => {
      console.log('Server closed gracefully');
      process.exit(0);
    });
  });
});