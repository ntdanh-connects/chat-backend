require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const buildContainer = require("./src/presentation/main/container.js");
const createMessageRouter = require('./src/presentation/http/messageRouter.js');
const registerMessageSocketHandlers = require("./src/presentation/socket/messageSocket.js");
const createAuthRouter = require("./src/presentation/http/authRouter.js");
const createRoomRouter = require("./src/presentation/http/roomRouter.js");
const createUserRouter = require("./src/presentation/http/userRouter.js");
const socketAuthMiddeware = require("./src/presentation/middleware/socketAuthMiddleWare.js");
const createUploadRouter = require("./src/presentation/http/uploadRouter.js");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  perMessageDeflate: {
    threshold: 1024,
  }
});

const container = buildContainer(io);

app.use("/api/auth", createAuthRouter(container.authController));
app.use("/api/rooms", createRoomRouter(container.roomController));
app.use("/api/users", createUserRouter(container.userController));
app.use("/api/rooms", createMessageRouter(container.messageController));
app.use("/api/upload", createUploadRouter(container.uploadController));

io.use(socketAuthMiddeware);
io.on("connection", (socket) => {
  registerMessageSocketHandlers(
    socket,
    container.messageSocketController
  );
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