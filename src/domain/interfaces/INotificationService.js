class INotificationService {
    async sendNotification({ userIds, title, body, data }) {
        throw new Error("sendNotification() chưa được implement");
    }
}
module.exports = INotificationService;
