class GetUserRoomsUseCase {
    constructor(roomRepository,onlineUsers) {
        this.roomRepository = roomRepository;
        this.onlineUsers = onlineUsers
    }

    async execute({ userId }) {
        if (!userId) {
            throw new Error("UserId is required");
        }

        const rooms = await this.roomRepository.getUserRooms(userId);

        return rooms.map(room =>{
            if(room.members && room.members.length > 0){
                room.members = room.members.map(member => ({
                    ...member,
                    isOnline: this.onlineUsers?.has(member.id) ?? false
                }));
            }
            return room;
        })
    }
}

module.exports = GetUserRoomsUseCase;
