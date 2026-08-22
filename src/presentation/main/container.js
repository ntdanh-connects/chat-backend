const pool = require('../../infrastructure/persistence/postgres/connection.js');
const PostgresMessageRepository = require('../../infrastructure/repositories/PostgresMessageRepository.js');
const PostgresRoomRepository = require('../../infrastructure/repositories/PostgresRoomRepository.js');
const PostgreUserRepository = require('../../infrastructure/repositories/PostgreUserRepository.js');
const SupabaseAuthRepository = require('../../infrastructure/services/auth/supabaseAuthRepository.js');
const SocketIOBroadcaster = require('../../infrastructure/services/socket/SocketIOBroadcaster.js');
const WebhookNotificationService = require('../../infrastructure/services/notification/WebhookNotificationService.js');

const SendMessageUseCase = require('../../application/use_cases/SendMessageUseCase.js');
const GetMessagesUseCase = require('../../application/use_cases/GetMessagesUseCase.js');
const RegisterUseCase = require('../../application/use_cases/RegisterUseCase.js');
const LoginUseCase = require('../../application/use_cases/LoginUseCase.js');
const GetOrCreateDirectRoomUseCase = require('../../application/use_cases/GetOrCreateDirectRoomUseCase.js');
const GetSearchableUserUseCase = require('../../application/use_cases/GetSearchableUserUseCase.js');
const GetUserRoomsUseCase = require('../../application/use_cases/GetUserRoomsUseCase.js');
const UpdateLastSeenUseCase = require('../../application/use_cases/UpdateLastSeenUseCase.js');
const JoinRoomUseCase = require('../../application/use_cases/JoinRoomUseCase.js');

const AuthController = require('../controllers/AuthController.js');
const RoomController = require('../controllers/RoomController.js');
const MessageController = require('../controllers/MessageController.js');
const UserController = require('../controllers/UserController.js');
const MessageSocketController = require('../controllers/MessageSocketController.js');
const RefreshTokenUseCase = require('../../application/use_cases/RefreshTokenUseCase.js');
const MarkAsRoomReadUseCase = require('../../application/use_cases/MarkAsRoomReadUseCase.js');
const S3StorageService = require('../../infrastructure/services/s3/S3StorageService.js');
const UploadController = require('../controllers/UploadController.js');

function buildContainer(io) {
    // 0. Shared State & External Services
    const onlineUsers = new Map();
    const notificationService = new WebhookNotificationService(process.env.WEBHOOK_URL);

    // 1. Infrastructure Implementations
    const messageRepository = new PostgresMessageRepository(pool);
    const socketBroadcaster = new SocketIOBroadcaster(io);
    const authRepository = new SupabaseAuthRepository(pool);
    const roomRepository = new PostgresRoomRepository(pool);
    const userRepository = new PostgreUserRepository(pool);
    const storageService = new S3StorageService();

    // 2. Use Cases
    const sendMessageUseCase = new SendMessageUseCase(messageRepository, socketBroadcaster, notificationService, onlineUsers, roomRepository);
    const getMessagesUseCase = new GetMessagesUseCase(messageRepository);
    const registerUseCase = new RegisterUseCase(authRepository);
    const loginUseCase = new LoginUseCase(authRepository);
    const getOrCreateDirectRoom = new GetOrCreateDirectRoomUseCase(roomRepository, authRepository);
    const getSearchableUserUseCase = new GetSearchableUserUseCase(userRepository);
    const getUserRoomsUseCase = new GetUserRoomsUseCase(roomRepository, onlineUsers);
    const updateLastSeenUseCase = new UpdateLastSeenUseCase(userRepository);
    const joinRoomUseCase = new JoinRoomUseCase(roomRepository);
    const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);
    const markAsRoomReadUseCase = new MarkAsRoomReadUseCase(roomRepository);
    const uploadAttachmentUseCase = new UpdateLastSeenUseCase(storageService);

    // 3. Controllers
    const authController = new AuthController(registerUseCase, loginUseCase, refreshTokenUseCase);
    const roomController = new RoomController(getOrCreateDirectRoom, getUserRoomsUseCase, markAsRoomReadUseCase);
    const messageController = new MessageController(getMessagesUseCase, sendMessageUseCase);
    const userController = new UserController(getSearchableUserUseCase);
    const messageSocketController = new MessageSocketController(joinRoomUseCase, sendMessageUseCase, updateLastSeenUseCase, onlineUsers, io);
    const uploadController = new UploadController(uploadAttachmentUseCase);

    return {
        onlineUsers,
        notificationService,
        messageRepository,
        socketBroadcaster,
        roomRepository,
        authRepository,
        userRepository,
        storageService,
        sendMessageUseCase,
        getMessagesUseCase,
        registerUseCase,
        loginUseCase,
        markAsRoomReadUseCase,
        refreshTokenUseCase,
        getOrCreateDirectRoom,
        getSearchableUserUseCase,
        getUserRoomsUseCase,
        updateLastSeenUseCase,
        joinRoomUseCase,
        uploadAttachmentUseCase,
        authController,
        roomController,
        messageController,
        userController,
        messageSocketController,
        uploadController,
    };
}

module.exports = buildContainer;
