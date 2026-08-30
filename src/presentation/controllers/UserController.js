class UserController {
    constructor(getSearchableUserUseCase,registerFcmTokenUseCase, unregisterFcmTokenUseCase) {
        this.getSearchableUserUseCase = getSearchableUserUseCase;
        this.registerFcmTokenUseCase = registerFcmTokenUseCase;
        this.unregisterFcmTokenUseCase = unregisterFcmTokenUseCase;
    }

    async getSearchableUsers(req, res) {
        try {
            const userId = req.userId;
            const keyword = req.query.q || null;

            const users = await this.getSearchableUserUseCase.execute({ userId, keyword });

            res.status(200).json({
                status: "success",
                data: users,
            });
        } catch (error) {
            console.log("Error fetching searchable users: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
    }

    async registerFcmToken(req, res){
        try {
            const userId = req.userId;
            const { fcmToken, platform = 'android' } = req.body;
            await this.registerFcmTokenUseCase.execute({ userId, fcmToken, platform });
            res.status(200).json({ status: "success", message: "Đăng ký FCM Token thành công" });
        } catch (e) {
            res.status(400).json({ status: "failed", error: e.message });
        }
    }

    async unregisterFcmToken(req, res) {
        try {
            const userId = req.userId;
            const { fcmToken } = req.body;
            await this.unregisterFcmTokenUseCase.execute({ userId, fcmToken });
            res.status(200).json({ status: "success", message: "Hủy FCM Token thành công" });
        } catch (e) {
            res.status(400).json({ status: "failed", error: e.message });
        }
    }
}

module.exports = UserController;
