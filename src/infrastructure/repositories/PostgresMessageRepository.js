//Imple extend Interface in Repositoy
const MessageReposity = require('../../domain/interfaces/IMessageRepository.js');
const Message = require('../../domain/entities/Message.js');


class PostgreMessageRepository extends MessageReposity {
    constructor(pool) {
        super();
        this.pool = pool; // Nhận pool kết nối qua constructor - đây chính là Dependency Injection
    }

    async insert(message) {
        const query = `
            INSERT INTO messages(id,client_message_id,room_id,sender_id,content,attachment_url, created_at)
            VALUES(gen_random_uuid(), $1, $2, $3, $4, $5, now())
            RETURNING *
        `;
        const values = [message.clientMessageId, message.roomId, message.senderId, message.content, message.attachmentUrl];
        const result = await this.pool.query(query, values);

        return this._toEntity(result.rows[0]);
    }

    async findByRoom({roomId, before = null, since = null, limit = 30, userId}) {
        let query = `SELECT m.*
        FROM messages m 
        JOIN room_members rm ON m.room_id = rm.room_id
        WHERE m.room_id = $1 AND rm.user_id = $2`;
        const values = [roomId, userId];
        let paramsIndex = 3;
        if(before){
            query += ` AND m.created_at < $${paramsIndex}`;
            values.push(before);
            paramsIndex++;
        }
        if (since) {
            query += ` AND m.created_at > $${paramsIndex}`;
            values.push(since);
            paramsIndex++;
        }
        query += ` ORDER BY m.created_at ASC LIMIT ${limit}`;

        const result = await this.pool.query(query, values);

        return result.rows.map((row) => this._toEntity(row));
    }

    _toEntity(row) {
        return new Message({
            id: row.id,
            organizationId: row.organization_id,
            clientMessageId: row.client_message_id,
            roomId: row.room_id,
            senderId: row.sender_id,
            content: row.content,
            attachmentUrl: row.attachment_url,
            createdAt: row.created_at
        });
    }
}

module.exports = PostgreMessageRepository;