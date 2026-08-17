class RefreshTokenUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute({refreshToken}){
        if(!refreshToken){
            throw new Error("Required refreshToken key");
        }

        const authData = await this.authRepository.refreshToken(refreshToken);

        return {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in,
        }
    }
}

module.exports = RefreshTokenUseCase;