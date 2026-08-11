//Đây là interface - giống chat Repositoy (abstract) của FLutter
// Định nghĩa các hàm cần có ko cần biết về logic

class MessageRepository {
    async insert(message){
        throw new Error('insert() chưa được implement')
    }

    async findByRoom({roomId, since = null, limit = 50, userId}){
        throw new Error('findByRoom() chưa được implement');
    }
}

module.exports = MessageRepository;