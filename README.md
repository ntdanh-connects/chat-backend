# Chat Backend (demo cho dự án Flutter training)

Backend tối giản dùng **Express** (REST cho Dio) + **Socket.IO** (realtime) +
**SQLite** (`better-sqlite3`) để lưu dữ liệu thật vào 1 file `chat.db`.

Tin nhắn được lưu vào file `chat.db` (tự động tạo trong thư mục project khi
chạy lần đầu). Tắt server, xóa app, restart máy... miễn file `chat.db` còn thì
dữ liệu còn. Muốn xóa sạch dữ liệu để test lại từ đầu, chỉ cần xóa 3 file:
`chat.db`, `chat.db-wal`, `chat.db-shm`.

## Cài đặt & chạy

```bash
cd chat-backend
npm install
npm start
```

Server chạy tại: `http://localhost:3000`

Nếu chạy Flutter trên **Android Emulator**, dùng `http://10.0.2.2:3000` thay vì
`localhost`. Nếu chạy trên **thiết bị thật**, dùng IP LAN của máy tính (ví dụ
`http://192.168.1.5:3000`), đảm bảo điện thoại và máy tính cùng mạng Wi-Fi.

## REST API (dùng với Dio)

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/health` | Kiểm tra server sống |
| GET | `/api/rooms/:roomId/messages?since=<ISO date>` | Lấy tin nhắn (đồng bộ khi app resume, `since` optional) |
| POST | `/api/rooms/:roomId/messages` | Gửi tin nhắn qua REST (fallback) |

Body của POST:
```json
{
  "senderId": "user-1",
  "content": "Xin chào",
  "clientMessageId": "local-uuid-abc" 
}
```
`clientMessageId` dùng để Flutter map tin nhắn optimistic (đã hiện lên UI ngay)
với tin nhắn thật trả về từ server.

## Socket.IO events

**Client emit (gửi lên server):**
| Event | Payload | Mục đích |
|---|---|---|
| `room:join` | `{ roomId, userId }` | Vào 1 room chat |
| `message:send` | `{ roomId, senderId, content, clientMessageId }` | Gửi tin nhắn realtime |
| `typing:start` | `{ roomId, userId }` | Báo đang gõ |
| `typing:stop` | `{ roomId, userId }` | Báo ngừng gõ |

**Server emit (client lắng nghe):**
| Event | Payload | Mục đích |
|---|---|---|
| `message:new` | message object | Có tin nhắn mới (bao gồm cả tin mình vừa gửi) |
| `user:online` | `{ userId }` | User khác vừa join room |
| `user:offline` | `{ userId }` | User vừa disconnect |
| `typing:start` / `typing:stop` | `{ userId }` | Trạng thái gõ của người khác |

## Test nhanh (không cần Flutter)

Dùng `curl` để test REST trước khi code Flutter:

```bash
# Lấy tin nhắn
curl http://localhost:3000/api/rooms/room1/messages

# Gửi tin nhắn
curl -X POST http://localhost:3000/api/rooms/room1/messages \
  -H "Content-Type: application/json" \
  -d '{"senderId":"user-1","content":"hello"}'
```
