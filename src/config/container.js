

const pool = require('../infrastructure/database/postgres/connection.js');
const PostgreMessageRepository = require('../infrastructure/database/postgres/PostgresMessageRepository.js');
const SocketIOBroadcaster = require('../infrastructure/socket/SocketIOBroadcaster.js');
const SendMessageUseCase = require('../application/usecases/SendMessageUseCase.js');
const GetMessagesUseCase = require('../application/usecases/GetMessagesUseCase.js');

function buildContainer(io){
    //----Bước 1: Tạo các "implement thật" ----
    const messageRepository = new PostgreMessageRepository(pool);
    const socketBroadcaster = new SocketIOBroadcaster(io);

    //Bước 2: Tạo Use Case, NHÉT các implemention vào constructor vàp qua constructor
    const sendMessageUseCase = new SendMessageUseCase(messageRepository, socketBroadcaster);
    const getMessagesUseCase = new GetMessagesUseCase(messageRepository);

    //Bước 3: trả về "hộp chứa" tất cả instance đã tạo, để nơi khác lấy dùng
    return {
        messageRepository,
        socketBroadcaster,
        sendMessageUseCase,
        getMessagesUseCase,
    }
}

module.exports = buildContainer;
