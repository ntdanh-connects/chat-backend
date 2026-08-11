class User{
    constructor({
        id,
        organizationId,
        departmentId = null,
        departmentName = null,
        email,
        fullName,
        avatarUrl = null,
        roleName = 'member',
        roleLevel = 0,
        mustChangePassword = false,
        isActive = true,
        createdAt,
        lastSeen,
        isOnline,
    }){
        this.id = id,
        this.organizationId = organizationId,
        this.departmentId = departmentId,
        this.departmentName = departmentName,
        this.email = email,
        this.fullName = fullName,
        this.avatarUrl = avatarUrl,
        this.roleName = roleName,
        this.roleLevel = roleLevel,
        this.mustChangePassword = mustChangePassword,
        this.isActive = isActive,
        this.createdAt = createdAt,
        this.lastSeen = lastSeen,
        this.isOnline = isOnline
    }
}

module.exports = User;