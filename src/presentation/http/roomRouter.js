const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware.js");

function createRoomRouter(getOrCreateDirectRoom, getUserRoomsUseCase){
    const router = express.Router();

    router.use(authMiddleware);

    router.get('/', async (req, res) => {
        try {
            const userId = req.userId;
            const rooms = await getUserRoomsUseCase.execute({ userId });
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
    });

    router.post('/direct', async (req,res) => {
        try{
            const currentUserId = req.userId;
            const { targetUserId } = req.body;

            const result = await getOrCreateDirectRoom.execute({
                currentUserId,
                targetUserId
            });

            res.status(200).json({
                status: "success",
                data: result
            });
        }catch(error){
            console.error("Error createting/getting direct room: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message
            });
        }
    });

    return router;
}

module.exports = createRoomRouter;