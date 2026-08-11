class UserRepository{
    async getSearchableUser({userId, keyword = null, limit = 50}){
        throw new Error("getSearchableUser() not yet implement");
    }

    async updateLastSeen(userId){
        throw new Error("updateLastSeen() not yet implement");
    }
}

module.exports = UserRepository;