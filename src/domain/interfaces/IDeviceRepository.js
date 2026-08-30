class IDeviceRepository {
    async registerDevice({ userId, fcmToken, platform }) {
        throw new Error("registerDevice() not yet implemented");
    }
    async unregisterDevice({ userId, fcmToken }) {
        throw new Error("unregisterDevice() not yet implemented");
    }
    async getTokensByUserIds(userIds) {
        throw new Error("getTokensByUserIds() not yet implemented");
    }
    async deleteTokens(tokens) {
        throw new Error("deleteTokens() not yet implemented");
    }
}

module.exports = IDeviceRepository;