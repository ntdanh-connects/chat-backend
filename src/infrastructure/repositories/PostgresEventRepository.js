const IEventRepository = require("../../domain/interfaces/IEventRepository");

class PostgresEventRepository extends IEventRepository{
    constructor(pool) {
        this.pool = pool;
    }

    async createEventForRecipients({ recipientIds, eventType, roomId, messageId, payload }){
        if(!recipientIds || recipientIds.length == 0)return;

        const client = await this.pool.connect();

        try{

            await client.query('BEGIN');
            for (const recipientId of recipientIds) {
                const seqRes = await client.query(`
                    INSERT INTO user_seq_counters (user_id, current_seq)
                    VALUES ($1, 1)
                    ON CONFLICT (user_id) DO UPDATE
                    SET current_seq = user_seq_counters.current_seq + 1
                    RETURNING current_seq;
                `, [recipientId]);
                const nextSeqId = Number(seqRes.rows[0].current_seq);
                await client.query(`
                    INSERT INTO user_events (user_id, seq_id, event_type, room_id, message_id, payload)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `, [recipientId, nextSeqId, eventType, roomId, messageId, JSON.stringify(payload)]);
            }
            await client.query('COMMIT');
        }catch(err){
            await client.query('ROLLBACK');
            console.error('❌ [PostgresEventRepository] Lỗi Transaction Fan-out:', err);
            throw err;
        }finally{
            client.release();
        }
    }

    async getMissedEvents(userId, lastSeqId = 0, limit = 200){
        const query = `
            SELECT seq_id, event_type, room_id, message_id, payload, created_at
            FROM user_events
            WHERE user_id = $1 AND seq_id > $2
            ORDER BY seq_id ASC
            LIMIT $3;
        `;
        const result = await this.pool.query(query, [userId, lastSeqId, limit]);

        return result.rows.map(row =>({
            seqId: Number(row.seq_id),
            eventType: row.event_type,
            ...row.payload
        }));
    }
}

module.exports = PostgresEventRepository;