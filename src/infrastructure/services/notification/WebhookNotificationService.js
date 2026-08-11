const INotificationService = require("../../../domain/interfaces/INotificationService");

class WebhookNotificationService extends INotificationService{
    constructor(webhookUrl) {
        super();
        this.webhookUrl = webhookUrl;
    }

    async sendNotification({ userIds, title, body, data}){
        if(!this.webhookUrl)return;
        try{
            const response = await fetch(this.webhookUrl, {
                method: "POST",
                headers: {'Content-Type': "application/json"},
                body: JSON.stringify({
                    userIds,
                    title,
                    body,
                    data,
                    timestamp: new Date().toISOString()
                })
            });
            console.log(`[Webhook] Sent notification status: ${response.status}`);
        }catch(e){
            console.error("[Webhook] Lỗi khi gửi Webhook Notification:", e);
        }
    }
}

module.exports = WebhookNotificationService;