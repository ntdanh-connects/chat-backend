class UpdateLastSeenUseCase {
    constructor(userRepository){
        this.userRepository = userRepository
    }

    async execute({ userId }){
        return await this.userRepository.updateLastSeen(userId);
    }
}

module.exports = UpdateLastSeenUseCase;