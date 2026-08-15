//Lớp này thực thi các hàm tương tác với Supabase Auth (createUser, signInWithPassword) và truy vấn bảng public.users

const supabaseAdmin = require('./supabaseAdminClient.js');

class SupabaseAuthRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async register({ email, password, fullName }) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            user_metadata: { full_name: fullName },
            email,
            password,
            email_confirm: true,
        });

        if (error) throw new Error(error.message);
        return data.user;
    }

    async login({ email, password }) {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);
        return data;
    }

    async getUserProfile(userId) {
        const query = `
            SELECT u.id, u.organization_id as "organizationId", u.department_id, u.email, u.full_name,
                    u.avatar_url, u.role_name, u.role_level, u.must_change_password,
                    o.name AS organization_name, o.domain AS organization_domain, d.name as depart_name
            FROM public.users u JOIN public.organizations o ON u.organization_id = o.id
                LEFT JOIN public.departments d on u.department_id = d.id
            WHERE u.id = $1    
        `;
        const result = await this.pool.query(query, [userId]);
        return result.rows[0] || null;
    }
}

module.exports = SupabaseAuthRepository;