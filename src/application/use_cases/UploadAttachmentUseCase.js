class UploadAttachmentUseCase{
    constructor(storageService) {
        this.storageService = storageService;
    }

    async execute({ file }){
        if(!file){
            throw new Error("No file provided");
        }

        const publicUrl = await this.storageService.uploadFile({
            buffer: file.buffer,
            originalName: file.originalname || file.originalName || 'image.jpg',
            mimeType: file.mimetype || file.mimeType || 'image/jpeg',
            folder: 'attachments',
        });

        return { url: publicUrl };
    }
}