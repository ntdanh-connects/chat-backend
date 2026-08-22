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
            originalName: file.originalName,
            mimeType: file.mimeType,
            folder: 'attachments',
        });

        return { url: publicUrl };
    }
}