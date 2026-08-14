class JoinRoomUseCase{
    constructor(roomRepository){
        this.roomRepository
    }

    async execute({ roomId, userId }){
        if(!roomId || !userId){
            throw new Error("RoomId & UserId required ");
        }

        const isMember = await this.roomRepository.isMemberOfRoom(roomId,userId);

        if(!isMember){
            throw new Error("You do not have permission to join this chat room")
        }
    }
}