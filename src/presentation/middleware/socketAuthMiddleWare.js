const supabaseAdmin = require("../../infrastructure/services/auth/supabaseAdminClient.js");

async function socketAuthMiddeware(socket, next) {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
        if (!token) {
            return next(new Error("Authorization error: Thiếu auth Token"));
        }

        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !data.user) {
            return next(new Error("Authorization error: Token không hợp lệ hoặc đã hết hạn!"));
        }
        socket.userId = data.user.id;
        socket.user = data.user;
        next();
    } catch (e) {
        return next(new Error("Authorization error: Xác thực Socket thất bại!"));
    }
}

module.exports = socketAuthMiddeware;