class RegisterUseCase{
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute({ email, password, fullName }){
        if(!email || !password || !fullName){
            throw new Error('Email, tên người dùng và mật khẩu không được để trống !');
        }

        const user = await this.authRepository.register({ email, password, fullName });

        const profile = await this.authRepository.getUserProfile(user.id);

        return { user, profile };
    }
}

module.exports = RegisterUseCase;