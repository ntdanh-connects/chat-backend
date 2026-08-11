class UserController {
    constructor(getSearchableUserUseCase) {
        this.getSearchableUserUseCase = getSearchableUserUseCase;
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
}

module.exports = UserController;
