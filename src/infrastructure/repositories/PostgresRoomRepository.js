const RoomRepository = require("../../domain/interfaces/IRoomRepository.js");
const Room = require("../../domain/entities/Room.js");

class PostgresRoomRepository extends RoomRepository{
    constructor(pool){
        super();
        this.pool = pool;
    }

    async findDirectRoom(userAId, userBId){
        const query = `
            SELECT r.id, r.organization_id, r.is_group, r.created_at
            FROM public.rooms r
            JOIN public.room_members rm1 ON r.id = rm1.room_id AND rm1.user_id = $1
            JOIN public.room_members rm2 ON r.id = rm2.room_id AND rm2.user_id = $2
            WHERE is_group = false
            LIMIT 1
        `;
        const result = await this.pool.query(query, [userAId, userBId]);
        return this._toEntity(result.rows[0]);
    }

    async createDirectRoom(userAId, userBId, organizationId){
        const client = await this.pool.connect();

        try{
            await client.query('BEGIN');

            const createRoomQuery = `
                INSERT INTO public.rooms (organization_id, name, is_group, created_by)
                VALUES ($1, NULL, false, $2)
                RETURNING *;
            `;
            
            const roomResult = await client.query(createRoomQuery, [organizationId, userAId]);
            const newRoomRow = roomResult.rows[0];

            const addMembersQuery = `
                INSERT INTO public.room_members (room_id, user_id, role_in_room)
                VALUES ($1, $2, 'member'), ($1, $3, 'member');
            `;

            await client.query(addMembersQuery, [newRoomRow.id, userAId, userBId]);

            await client.query('COMMIT');
            return this._toEntity(newRoomRow);
        }catch(error){
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    } 

    async isMemberOfRoom(roomId, userId){
          const query = `
            SELECT 1 FROM public.room_members 
            WHERE room_id = $1 AND user_id = $2
            LIMIT 1
        `;
        const result = await this.pool.query(query, [roomId,userId]);
        return result.rows.length > 0;
    }

    async getUserRooms(userId){
        const query = `
            SELECT r.id, r.organization_id, r.is_group, r.created_at,
                   u.id AS partner_id, u.full_name AS partner_name, u.email AS partner_email, u.avatar_url AS partner_avatar,
                   lm.id AS last_msg_id, lm.content AS last_msg_content, lm.sender_id AS last_msg_sender_id, lm.created_at AS last_msg_created_at
            FROM public.rooms r
            JOIN public.room_members rm ON r.id = rm.room_id AND rm.user_id = $1
            LEFT JOIN public.room_members rm_partner ON r.id = rm_partner.room_id AND rm_partner.user_id != $1
            LEFT JOIN public.users u ON rm_partner.user_id = u.id
            
            -- 🟢 KÉO TIN NHẮN MỚI NHẤT CỦA PHÒNG BẰNG LATERAL JOIN
            LEFT JOIN LATERAL (
                SELECT m.id, m.content, m.sender_id, m.created_at
                FROM public.messages m
                WHERE m.room_id = r.id
                ORDER BY m.created_at DESC
                LIMIT 1
            ) lm ON true
            
            ORDER BY COALESCE(lm.created_at, r.created_at) DESC;
        `;
        const result = await this.pool.query(query, [userId]);
        return result.rows.map(row => ({
            id: row.id,
            organizationId: row.organization_id,
            isGroup: row.is_group,
            createdAt: row.created_at,
            members: row.partner_id ? [{
                id: row.partner_id,
                fullName: row.partner_name,
                email: row.partner_email,
                avatarUrl: row.partner_avatar,
                isActive: true
            }] : [],
            // 🟢 TRẢ VỀ ĐỐI TƯỢNG lastMessage NẾU PHÒNG ĐÓ ĐÃ CÓ TIN NHẮN
            lastMessage: row.last_msg_id ? {
                id: row.last_msg_id,
                clientMessageId: row.last_msg_id,
                roomId: row.id,
                senderId: row.last_msg_sender_id,
                content: row.last_msg_content,
                createdAt: row.last_msg_created_at
            } : null
        }));

    }

    _toEntity(row){
        if(!row) return null;

        return new Room({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            isGroup: row.is_group,
            createdBy: row.created_by,
            createdAt: row.created_at
        })
    }
}

module.exports = PostgresRoomRepository;