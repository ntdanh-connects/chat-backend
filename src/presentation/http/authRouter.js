const express = require("express");

function createAuthRouter(authController) {
    const router = express.Router();

    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));

    return router;
}

module.exports = createAuthRouter;