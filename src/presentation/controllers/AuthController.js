class AuthController {
    constructor(registerUseCase, loginUseCase, refreshTokenUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
    }

    async register(req, res) {
        try {
            const { email, password, fullName } = req.body;
            const result = await this.registerUseCase.execute({ email, password, fullName });
            res.status(200).json({
                status: "success",
                data: result
            });
        } catch (error) {
            console.error("Error registering user: ", error);
            res.status(400).json({
                status: "failed",
                error: error.message,
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.loginUseCase.execute({ email, password });
            res.status(200).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            console.error("Error logging in: ", error);
            res.status(401).json({
                status: "failed",
                error: error.message,
            });
        }
    }

    async refreshToken(req, res){
        try{
            const { refreshToken }  = req.body;
            const result = await this.refreshTokenUseCase.execute({refreshToken});

            res.status(200).json({
                status: "success",
                data: result,
            });
        }catch(error){
            console.error("Error refreshing token: ", error);
            res.status(401).json({
                status: "failed",
                error: error.message
            })
        }
    }
}

module.exports = AuthController;
