class RegisterFcmTokenUseCase {
    constructor(deviceRepositoty) {
        this.deviceRepositoty = deviceRepositoty;
    }

    async execute({ userId, fcmToken, platform }){
        if(!userId)throw new Error("userId is required");
        if(!fcmToken || typeof fcmToken !== 'string' || fcmToken.length < 50 || fcmToken.length > 500){
            throw new Error("fcmToken available");
        }
        if(!['android', 'ios'].includes(platform)){
            throw new Error("platform available");
        }
        return await this.deviceRepositoty.registerDevice({ userId, fcmToken, platform });
    }
}

module.exports = RegisterFcmTokenUseCase;