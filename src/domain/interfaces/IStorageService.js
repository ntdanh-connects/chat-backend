class IStorageService{
    async uploadFile({ buffer, originalName, mimeType, folder}){
        throw new Error("uploadFile not yet implement");
    }
}
module.exports = IStorageService;