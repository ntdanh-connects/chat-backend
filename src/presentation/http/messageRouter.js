const express = require("express");
const authMiddleware = require('../middlewares/authMiddleware.js');

function createMessageRouter(getMessagesUseCase, sendMessageUseCase) {
    const router = express.Router();

    router.use(authMiddleware);

    router.get('/:roomId/messages', async (req, res) => {
        try {
            const userId = req.userId;
            const { roomId } = req.params;
            const since = req.query.since || null;
            const result = await getMessagesUseCase.execute({ roomId, since, userId });
            res.status(200).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            console.error("Error fetching messages: ", error);
            res.status(500).json({
                status: "failed",
                error: "Internal Server Error"
            });
        }
    });

    router.post('/:roomId/messages', async (req, res) => {
        try {
            const { roomId } = req.params;
            const senderId = req.userId;
            const { content, clientMessageId } = req.body;
            const message = await sendMessageUseCase.execute({
                clientMessageId,
                roomId,
                senderId,
                content,
            });
            res.status(201).json({
                status: "success",
                data: message
            });
        } catch (error) {
            console.error("Error sending message via REST:", error);
            res.status(500).json({ status: "failed", error: "Internal Server Error" });
        }
    });

    return router;
}

module.exports = createMessageRouter;