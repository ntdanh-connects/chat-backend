const express = require('express');
const multer = require('multer');
const authMiddleWare = require('../middleware/authMiddleware.js');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 20* 1024 * 1024},
});

function createUploadRouter(uploadController){
    const router = express.Router();
    router.use(authMiddleWare);

    router.post('/',upload.single('file'), (req,res)=> uploadController.handleUpload(req,res));

    return router;
}

module.exports = createUploadRouter;