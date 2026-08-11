const express = require("express");
const authMiddleware = require('../middlewares/authMiddleware.js');

function createUserRouter(getSearchableUserUseCase){
    const router = express.Router();
    router.use(authMiddleware);

    router.get('/searchable', async (req, res)=>{
        try{
            const userId = req.userId;
            const keyword = req.query.q || null;

            const users = await getSearchableUserUseCase.execute({ userId, keyword });

            res.status(200).json({
                status: "success",
                data: users,
            });

        }catch(error){
            console.log("Error fetching searchable users: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
    });

    return router;
}

module.exports = createUserRouter;