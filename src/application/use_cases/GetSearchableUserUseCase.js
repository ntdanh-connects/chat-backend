class GetSearchableUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ userId, keyword}){
        if(!userId){
            throw new Error("User is not null")
        }

        const users = await this.userRepository.getSearchableUser({ userId, keyword });

        return users;
    }
}

module.exports = GetSearchableUserUseCase;