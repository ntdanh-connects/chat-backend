const supabaseAdmin = require('../../infrastructure/services/auth/supabaseAdminClient.js');

async function authMiddleware(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                status: "failed",
                error: "Thiếu Authorization Token",
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if(error || !data.user){
            return res.status(401).json({
                status: "failed",
                error: "Token không hợp lệ hoặc đã hết hạn, vui lòng thử lại!",
            });
        }

        req.userId = data.user.id;
        req.user = data.user;
        next();
    }catch (error){
        return res.status(401).json({
            status: "failed",
            error: "Xác thực không thành công!",
        });
    }
}

module.exports = authMiddleware;