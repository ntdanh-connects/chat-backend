class GetOrCreateDirectRoomUseCase{
    constructor(
        roomRepository,
        authRepository,
    ){
        this.roomRepository = roomRepository;
        this.authRepository = authRepository;
    }

    async execute({ currentUserId, targetUserId }){
        if(!targetUserId){
            throw new Error("Not found target userId");
        }

        if(currentUserId === targetUserId){
            throw new Error("cannot be duplicated userId")
        }

        let room = await this.roomRepository.findDirectRoom(currentUserId, targetUserId);

        if(room){
            return {
                room,
                isNew: false
            }
        }

        const userProfile = await this.authRepository.getUserProfile(currentUserId);
        if(!userProfile){
            throw new Error("Not found information current user");
        }

        const organizationId = userProfile.organizationId || userProfile.organization_id;

        room = await this.roomRepository.createDirectRoom(
            currentUserId,
            targetUserId,
            organizationId,
        );

        return { room , isNew: true };
    }
}

module.exports = GetOrCreateDirectRoomUseCase;