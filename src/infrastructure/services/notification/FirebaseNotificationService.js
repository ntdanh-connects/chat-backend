const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging'); // 🔥 Thêm getMessaging
const path = require('path');
const fs = require('fs');
const INotificationService = require('../../../domain/interfaces/INotificationService');

class FirebaseNotificationService extends INotificationService {
    constructor(deviceRepository) {
        super();
        this.deviceRepository = deviceRepository;

        try {
            // 🔥 Dùng admin.getApps() thay vì admin.apps
            if (admin.getApps().length === 0) {
                let credential;
                if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
                    credential = admin.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
                } else {
                    const localPath = path.join(__dirname, '../../config/serviceAccountKey.json');
                    if (fs.existsSync(localPath)) {
                        credential = admin.cert(require(localPath));
                    }
                }

                if (credential) {
                    admin.initializeApp({ credential });
                    console.log("🔥 [Firebase Admin] Đã khởi tạo thành công an toàn!");
                } else {
                    console.warn("⚠️ [Firebase Admin] Không tìm thấy file serviceAccountKey.json!");
                }
            }
        } catch (error) {
            console.error("❌ [Firebase Admin Init Error]:", error.message);
        }
    }

    async sendNotification({ userIds, data }) {
        // 🔥 Kiểm tra admin.getApps().length
        if (!userIds || userIds.length === 0 || admin.getApps().length === 0) return;

        try {
            const tokens = await this.deviceRepository.getTokensByUserIds(userIds);
            if (tokens.length === 0) {
                console.log(`ℹ️ [Push] User ${userIds.join(',')} chưa có thiết bị nào trong user_devices.`);
                return;
            }

            const stringData = {};
            for (const [key, value] of Object.entries(data)) {
                stringData[key] = String(value);
            }

            const payload = {
                data: stringData,
                android: { priority: 'high' },
                apns: {
                    headers: {
                        'apns-priority': '10',
                        'apns-push-type': 'background',
                    },
                    payload: { aps: { 'content-available': 1 } },
                },
            };

            const BATCH_SIZE = 500;
            const failedTokens = [];
            const messaging = getMessaging(); // 🔥 Lấy instance messaging

            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batch = tokens.slice(i, i + BATCH_SIZE);
                const response = await messaging.sendEachForMulticast({
                    tokens: batch,
                    ...payload,
                });

                console.log(`🚀 [Push Notification] Đã bắn tới ${batch.length} máy (Thành công: ${response.successCount}, Thất bại: ${response.failureCount})`);

                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
                            failedTokens.push(batch[idx]);
                        }
                    }
                });
            }

            if (failedTokens.length > 0) {
                await this.deviceRepository.deleteTokens(failedTokens);
                console.log(`🧹 [Push] Đã tự động dọn ${failedTokens.length} token hết hạn.`);
            }
        } catch (e) {
            console.error("❌ [Push Notification Error]:", e.message);
        }
    }
}

module.exports = FirebaseNotificationService;
