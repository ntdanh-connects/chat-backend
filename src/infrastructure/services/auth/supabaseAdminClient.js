const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseKey || !supabaseUrl){
    console.warn('Thiếu supabase url hoặc supabase key');
}

const supabaseAdmin = createClient(supabaseUrl,supabaseKey,{
    auth: {
        autoRefreshToken: false,
        persistSession:false
    }
})

module.exports = supabaseAdmin;