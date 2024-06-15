const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // .env 파일 로드

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/', async (req, res) => {
    const { title, name, email, picture, cor, lr_Y, rf_Y, explain } = req.body;

    try {
        // 사용자 정보를 users 테이블에 삽입 또는 업데이트
        const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert({ email, name, picture }, { onConflict: 'email' })
            .select('id');

        if (userError) throw userError;

        const userId = userData[0].id;

        // post 테이블에 데이터 삽입
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert({ title, author_id: userId, cor, lr_Y, rf_Y, description: explain });

        if (postError) throw postError;

        res.status(200).json({ message: 'Post created successfully!', post: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
