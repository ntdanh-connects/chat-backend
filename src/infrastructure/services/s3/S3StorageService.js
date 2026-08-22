const IStorageService = require("../../../domain/interfaces/IStorageService");
const { v4: uuidv4}  = require('uuid');
const { S3Client, PutObjectCommand }= require('@aws-sdk/client-s3');

class S3StorageService extends IStorageService{
    constructor() {
        super();
        this.bucketName = process.env.S3_BUCKET_NAME || 'chat-media';
        this.endpoint = process.env.S3_ENDPOINT;

        this.s3Client = new S3Client({
            region: process.env.S3_REGION || 'ap-southeast-1',
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            },
            forcePathStyle: true
        })
    }

    async uploadFile({ buffer, originalName, mimeType, folder = 'images'}){
        const safeName = originalName || 'image.jpg';
        const fileExt = safeName.split('.').pop() || 'jpg';
        const uniqueFileName = `${folder}/${uuidv4()}.${fileExt}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: mimeType,
        });

        await this.s3Client.send(command);

        const supabaseUrl = process.env.SUPABASE_URL || 'https://krlxpymdeaseerbakfvn.supabase.co';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${uniqueFileName}`;

        return publicUrl;
    }
}

module.exports = S3StorageService;