class UploadController {
    constructor(uploadAttachmentUseCase) {
        this.uploadAttachmentUseCase = uploadAttachmentUseCase;
    }

    async handleUpload(req, res) {
        try {
            const result = await this.uploadAttachmentUseCase.execute({ file: req.file });
            res.status(200).json({
                status: "success",
                data: result
            });
        } catch (e) {
            console.log("[Upload Controller Error]", e);
            res.status(400).json({
                status: "failed",
                error: e.message
            });
        }
    }
}

module.exports = UploadController;