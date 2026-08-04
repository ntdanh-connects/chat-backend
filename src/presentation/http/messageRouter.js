const express = require("express");

function createMessageRouter(getMessagesUseCase, sendMessageUseCase){
    const router = express.Router();

    router.get('/:roomId/messages', async (req, res)=>{
        try{
            const {roomId} = req.params;
            const since = req.query.since || null;
            const result = await getMessagesUseCase.execute({roomId,since});
            res.status(200).json({ 
                status: successed,
                data: result,
            });
        }catch(error){
            console.error("Error fetching messages: ", error);
            res.status(500).json({ 
                status: failed,
                error: "Internal Server Error"
            });
        }
    });

    router.post('/:roomId/messages', async (req,res)=>{
        try{
            const {roomId} = req.params;
            const {senderId, content, clientMessagesId } = req.body;
            const message = await sendMessageUseCase.execute({
                clientMessagesId,
                roomId,
                senderId,
                content,
            });
            res.status(201).json({
                status: successed,
                data: message
            });
        }catch(error){
            console.error("Error sending  message via GET:", error);
            res.status(500).json({status:failed, error: "Interval Server Error"});
        }
    });
}

module.exports = createMessageRouter;