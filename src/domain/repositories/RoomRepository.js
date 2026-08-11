class RoomRepository{
    async findDirectRoom(userAId, userBId){
        throw new Error("findDirectRoom() not yet implement");
    }

    async createDirectRoom(userAId, userBId, organizationId){
        throw new Error("createDirectRoom() not yet Implment")
    }

    async isMemberOfRoom(roomId, userId){
        throw new Error("isMemberOfRoom() not yet Implement");
    }

    async getUserRooms(userId){
        throw new Error("getUserRooms() not yet Implement");
    }
}

module.exports = RoomRepository;