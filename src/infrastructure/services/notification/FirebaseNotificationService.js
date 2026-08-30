const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const INotificationService = require('../../../domain/interfaces/INotificationService');

class FirebaseNotificationService extends INotificationService {
    constructor(deviceRepository) {
        super();
        this.deviceRepository = deviceRepository;

        try {
            if (!admin.apps.length) {
                let credential;
                if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
                    credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
                } else {
                    const localPath = path.json(__dirname, '../../config/serviceAccountKey.js');
                    if (fs.existsSync(localPath)) {
                        credential = admin.credential.cert(require(localPath));
                    }
                }
                if (credential) {
                    admin.initializeApp({ credential });
                    console.log("Firebase Admin Initial Success");
                }
            }
        } catch (error) {
            console.error("Firebase Admin Init Error", error.message);
        }
    }

    async sendNotification({ userIds, data }){
        if(!userIds || userIds.length === 0 || !admin.apps.length)return;

        try{
            const tokens = await this.deviceRepository.getTokenByUserIds(userIds);

            if(tokens.length === 0)return;

            const StringData ={};
            for(const [key, value] of Object.entries(data)){
                StringData[key] = String(value);
            }

            const payload = {
                data: StringData,
                android: { priority: hight },
                apns: {
                    headers: {
                        'apns-priority': '10',
                        'apns-push-type': 'background',
                    },
                    payload: { aps: {'content-available': 1}},
                },
            }

            const BATCH_SIZE = 500;
            const failedTokens = [];

            for(let i = 0; i < tokens.length; i+=BATCH_SIZE){
                const batch = tokens.slice(i, i + BATCH_SIZE);
                const response = await admin.messaging().sendEachForMulticast({
                    tokens: batch,
                    ...payload
                });

                response.response.forEach((resp, idx)=>{
                    if(!resp.success){
                        const code = resp.error?.code;
                        if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
                            failedTokens.push(batch[idx]);
                        }
                    }
                })
            }

            if(failedTokens.length > 0){
                await this.pool.query(`DELETE FROM user_devices WHERE fcm_token = ANY($1::text[])`,[failedTokens]);
                console.log(`"Push Đã tự động dọn ${failedTokens.length} token hết hạn."`)
            }
        }catch(e){
            console.error("Push Notification Error", e.message);
        }
    }
}

module.exports = FirebaseNotificationService;