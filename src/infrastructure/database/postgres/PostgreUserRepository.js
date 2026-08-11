const UserRepository = require('../../../domain/repositories/UserRepository.js');
const User = require('../../../domain/entities/User.js');

class PostgreUserRepository extends UserRepository{
    constructor(pool){
        super();
        this.pool = pool
    }

    async getSearchableUser({ userId, keyword = null, limit = 50}){
        const query = `
            SELECT u.id, u.organization_id, u.department_id, u.email, u.full_name,
                   u.avatar_url, u.role_name, u.role_level, u.must_change_password,
                   u.is_active, u.created_at, d.name AS department_name
            FROM public.users u
            JOIN public.organizations o ON u.organization_id = o.id
            LEFT JOIN public.departments d ON u.department_id = d.id
            WHERE u.organization_id = (SELECT organization_id FROM public.users WHERE id = $1)
              AND u.id != $1
              AND (
                (SELECT role_level FROM public.users WHERE id = $1) >= 90
                OR o.type = 'company'
                OR u.department_id = (SELECT department_id FROM public.users WHERE id = $1)
              )
              AND ($2::text IS NULL OR u.full_name ILIKE '%' || $2 || '%' OR u.email ILIKE '%' || $2 || '%')
            ORDER BY u.full_name ASC
            LIMIT $3;
        `;

        const values = [userId, keyword, limit];
        const result = await this.pool.query(query, values);

        return result.rows.map((row)=> this._toEntity(row));
    }

    _toEntity(row){
        if(!row) return null;
        return new User({
            id: row.id,
            organizationId: row.organization_id,
            departmentId: row.department_id,
            departmentName: row.department_name,
            email: row.email,
            fullName: row.full_name,
            avatarUrl: row.avatar_url,
            roleName: row.role_name,
            roleLevel: row.role_level,
            mustChangePassword: row.must_change_password,
            isActive: row.is_active,
            createdAt: row.created_at,
        });
    }
}

module.exports = PostgreUserRepository;