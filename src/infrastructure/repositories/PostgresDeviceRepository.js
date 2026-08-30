const IDeviceRepository = require("../../domain/interfaces/IDeviceRepository");

class PostgresDeviceRepository extends IDeviceRepository{
    constructor(pool){
        super();
        this.pool = pool;
    }

    async registerDevice({ userId, fcmToken, platform }){
        const countRes = await this.pool.query(
            `SELECT COUNT(*) FROM user_devices WHERE user_id = $1`,[userId]
        );

        if(Number(countRes.rows[0].count) >= 5){
            await this.pool.query(`
                DELETE FROM user_devices WHERE id = (
                    SELECT id FROM user_devices WHERE user_id = $1 ORDER BY updated_at ASC LIMIT 1
                )    
            `, [userId]);
        }
        const query = `
            INSERT INTO user_devices (user_id, fcm_token, platform, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (fcm_token) DO UPDATE
            SET user_id = EXCLUDED.user_id,
                platform = EXCLUDED.platform,
                updated_at = NOW();
        `;
        await this.pool.query(query, [userId, fcmToken, platform]);
    }

    async unregisterDevice({ userId, fcmToken }) {
        await this.pool.query(
            `DELETE FROM user_devices WHERE user_id = $1 AND fcm_token = $2`,
            [userId, fcmToken]
        );
    }
    async getTokensByUserIds(userIds) {
        if (!userIds || userIds.length === 0) return [];
        const res = await this.pool.query(
            `SELECT fcm_token FROM user_devices WHERE user_id = ANY($1::uuid[])`,
            [userIds]
        );
        return res.rows.map(r => r.fcm_token).filter(Boolean);
    }
    async deleteTokens(tokens) {
        if (!tokens || tokens.length === 0) return;
        await this.pool.query(
            `DELETE FROM user_devices WHERE fcm_token = ANY($1::text[])`,
            [tokens]
        );
    }
}

module.exports = PostgresDeviceRepository;