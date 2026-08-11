class LoginUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute({ email, password }) {
        if (!email || !password) {
            throw new Error('Email hoặc mật khẩu đang bỏ trống!');
        }

        const authData = await this.authRepository.login({ email, password });

        const profile = await this.authRepository.getUserProfile(authData.user.id);

        return {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in,
            user: profile,
        }
    }
}

module.exports = LoginUseCase;