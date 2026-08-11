class Room{
    constructor({
        id,
        organizationId,
        name = null,
        isGroup,
        createdBy,
        createdAt,
    }){
        this.id = id,
        this.organizationId = organizationId,
        this.name = name,
        this.isGroup = isGroup,
        this.createdBy = createdBy,
        this.createdAt = createdAt
    }
}

module.exports = Room;