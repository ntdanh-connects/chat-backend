class UnRegisterFcmTokenUseCase{
    constructor(deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    async execute({ userId, fcmToken }){
        if(!userId || !fcmToken)return;
        return await this.deviceRepository.unregisterDevice({ userId, fcmToken });
    }
}

module.exports = UnRegisterFcmTokenUseCase;