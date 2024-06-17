//routs/post.js
const router = express.Router();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // 환경 변수 로드

const app = express();
app.use(express.json()); // JSON 요청을 처리

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// C: Create - 새로운 포스트 생성
app.post('/posts', async (req, res) => {
    const { title, name, email, picture, cor, lr_Y, rf_Y, explain } = req.body;

    try {
        // 사용자 정보 저장 (upsert)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert({ email, name, picture }, { onConflict: 'email' })
            .select('id');

        if (userError) throw userError;

        const userId = userData[0].id;

        // 새로운 포스트 저장
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert({ title, author_id: userId, cor, lr_Y, rf_Y, description: explain });

        if (postError) throw postError;

        res.status(201).json({ message: 'Post created successfully!', post: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// R: Read - 특정 포스트 조회
app.get('/posts/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('*, users(name, email, picture)')
            .eq('id', postId)
            .single(); // 단일 결과

        if (postError) throw postError;

        res.status(200).json({ post: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// R: Read - 모든 포스트 조회 (페이지네이션 추가 가능)
app.get('/posts', async (req, res) => {
    try {
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('*, users(name, email, picture)');

        if (postError) throw postError;

        res.status(200).json({ posts: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// U: Update - 포스트 수정
app.put('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    const { title, cor, lr_Y, rf_Y, explain } = req.body;

    try {
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .update({ title, cor, lr_Y, rf_Y, description: explain })
            .eq('id', postId);

        if (postError) throw postError;

        res.status(200).json({ message: 'Post updated successfully!', post: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// D: Delete - 포스트 삭제
app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (postError) throw postError;

        res.status(200).json({ message: 'Post deleted successfully!', post: postData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = router;
