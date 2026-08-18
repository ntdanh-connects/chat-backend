class RoomController {
    constructor(getOrCreateDirectRoom, getUserRoomsUseCase, markAsRoomReadUseCase) {
        this.getOrCreateDirectRoom = getOrCreateDirectRoom;
        this.getUserRoomsUseCase = getUserRoomsUseCase;
        this.markAsRoomReadUseCase = markAsRoomReadUseCase;
    }

    async getUserRooms(req, res) {
        try {
            const userId = req.userId;
            const rooms = await this.getUserRoomsUseCase.execute({ userId });
            res.status(200).json({
                status: "success",
                data: rooms,
            });
        } catch (error) {
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
    }

    async getOrCreateDirectRoomHandler(req, res) {
        try {
            const currentUserId = req.userId;
            const { targetUserId } = req.body;

            const result = await this.getOrCreateDirectRoom.execute({
                currentUserId,
                targetUserId
            });

            res.status(200).json({
                status: "success",
                data: result
            });
        } catch (error) {
            console.error("Error creating/getting direct room: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message
            });
        }
    }

    async markAsRoomRead(req, res){
        try{
            const currentUserId = req.userId;
        const { roomId } = req.body;
        await this.markAsRoomReadUseCase({roomId,currentUserId});
        res.status(200).json({ status: "success "});
        }catch(e){
            res.status(400).json({ status: "failed", error: e.message });
        }
    }
}

module.exports = RoomController;
