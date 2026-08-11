class GetSearchableUserUseCase {
    constructor(userRepository, onlineUsers) {
        this.userRepository = userRepository;
        this.onlineUsers = onlineUsers;
    }

    async execute({ userId, keyword }) {
        if (!userId) {
            throw new Error("User is required");
        }

        const users = await this.userRepository.getSearchableUser({ userId, keyword });

        return users.map(user => {
            user.isOnline = this.onlineUsers?.has(user.id) ?? false;
            return user;
        });
    }
}

module.exports = GetSearchableUserUseCase;