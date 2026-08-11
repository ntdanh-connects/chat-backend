const express = require("express");
const authMiddleware = require('../middleware/authMiddleware.js');

function createMessageRouter(messageController) {
    const router = express.Router();

    router.use(authMiddleware);

    router.get('/:roomId/messages', (req, res) => messageController.getMessages(req, res));
    router.post('/:roomId/messages', (req, res) => messageController.sendMessage(req, res));

    return router;
}

module.exports = createMessageRouter;