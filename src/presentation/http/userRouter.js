const express = require("express");
const authMiddleware = require('../middleware/authMiddleware.js');

function createUserRouter(userController) {
    const router = express.Router();
    router.use(authMiddleware);

    router.get('/searchable', (req, res) => userController.getSearchableUsers(req, res));
    router.post('/fcm-token', (req,res)=> userController.registerFcmToken(req,res));
    router.post('/fcm-token/unregister', (req,res)=> userController.unregsiterFcmToken(req,res));

    return router;
}

module.exports = createUserRouter;