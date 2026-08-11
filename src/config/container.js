

const pool = require('../infrastructure/database/postgres/connection.js');
const PostgreMessageRepository = require('../infrastructure/database/postgres/PostgresMessageRepository.js');
const SocketIOBroadcaster = require('../infrastructure/socket/SocketIOBroadcaster.js');
const SendMessageUseCase = require('../application/usecases/SendMessageUseCase.js');
const GetMessagesUseCase = require('../application/usecases/GetMessagesUseCase.js');
const SupabaseAuthRepository = require('../infrastructure/auth/supabaseAuthRepository.js');
const RegisterUseCase = require('../application/usecases/RegisterUseCase.js');
const LoginUseCase = require('../application/usecases/LoginUseCase.js');
const { auth } = require('../infrastructure/auth/supabaseAdminClient.js');
const PostgresRoomRepository = require('../infrastructure/database/postgres/PostgresRoomRepository.js');
const GetOrCreateDirectRoomUseCase = require('../application/usecases/GetOrCreateDirectRoomUseCase.js');
const PostgreUserRepository = require('../infrastructure/database/postgres/PostgreUserRepository.js');
const GetSearchableUserUseCase = require('../application/usecases/GetSearchableUserUseCase.js');
const GetUserRoomsUseCase = require('../application/usecases/GetUserRoomsUseCase.js');

function buildContainer(io) {
    //----Bước 1: Tạo các "implement thật" ----
    const messageRepository = new PostgreMessageRepository(pool);
    const socketBroadcaster = new SocketIOBroadcaster(io);
    const authRepository = new SupabaseAuthRepository(pool);
    const roomRepository = new PostgresRoomRepository(pool);
    const userRepository = new PostgreUserRepository(pool);

    //Bước 2: Tạo Use Case, NHÉT các implemention vào constructor vàp qua constructor
    const sendMessageUseCase = new SendMessageUseCase(messageRepository, socketBroadcaster);
    const getMessagesUseCase = new GetMessagesUseCase(messageRepository);
    const registerUseCase = new RegisterUseCase(authRepository);
    const loginUseCase = new LoginUseCase(authRepository);
    const getOrCreateDirectRoom = new GetOrCreateDirectRoomUseCase(roomRepository, authRepository);
    const getSearchableUserUseCase = new GetSearchableUserUseCase(userRepository);
    const getUserRoomsUseCase = new GetUserRoomsUseCase(roomRepository);

    //Bước 3: trả về "hộp chứa" tất cả instance đã tạo, để nơi khác lấy dùng
    return {
        messageRepository,
        socketBroadcaster,
        roomRepository,
        authRepository,
        userRepository,
        sendMessageUseCase,
        getMessagesUseCase,
        registerUseCase,
        loginUseCase,
        getOrCreateDirectRoom,
        getSearchableUserUseCase,
        getUserRoomsUseCase,
    }
}

module.exports = buildContainer;
