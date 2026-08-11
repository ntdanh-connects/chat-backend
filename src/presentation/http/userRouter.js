const express = require("express");
const authMiddleware = require('../middleware/authMiddleware.js');

function createUserRouter(userController) {
    const router = express.Router();
    router.use(authMiddleware);

    router.get('/searchable', (req, res) => userController.getSearchableUsers(req, res));

    return router;
}

module.exports = createUserRouter;