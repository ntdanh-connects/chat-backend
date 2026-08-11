class GetUserRoomsUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute({ userId }) {
        if (!userId) {
            throw new Error("UserId is required");
        }

        const rooms = await this.roomRepository.getUserRooms(userId);
        return rooms;
    }
}

module.exports = GetUserRoomsUseCase;
