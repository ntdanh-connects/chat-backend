const express = require("express");

function createAuthRouter(registerUseCase, loginUseCase){
    const router = express.Router();

    router.post('/register', async (req, res) => {
        try{
            const { email, password, fullName } = req.body;
            const result = await registerUseCase.execute({ email, password, fullName });

            res.status(200).json({
                status: "success",
                data: result
            });
        }catch(error){
            console.error("Error registering user: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
    });

    router.post('/login', async (req, res) =>{
        try{
            const { email, password } = req.body;
            const result = await loginUseCase.execute({ email,password });
            res.status(200).json({
                status: "success",
                data: result,
            })
        }catch(error){
            console.error("Error loggin in: ", error);
            res.status(401).json({
                status: "failed",
                error: error.message,
            });
        }
    });

    return router;
}

module.exports = createAuthRouter;