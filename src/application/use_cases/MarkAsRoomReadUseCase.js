class MarkAsRoomReadUseCase{
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute({ roomId, userId }){
        if(!roomId || !userId){
            throw new Error("required roomId and userId");
        }
        return await this.roomRepository.markAsRoomRead(roomId,userId);
    }
}

module.exports = MarkAsRoomReadUseCase;