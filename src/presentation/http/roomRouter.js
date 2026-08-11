const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");

function createRoomRouter(roomController) {
    const router = express.Router();

    router.use(authMiddleware);

    router.get('/', (req, res) => roomController.getUserRooms(req, res));
    router.post('/direct', (req, res) => roomController.getOrCreateDirectRoomHandler(req, res));

    return router;
}

module.exports = createRoomRouter;