const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const argon2 = require('argon2');
require('dotenv').config(); // 환경 변수 로드

const router = express.Router();
const app = express();
app.use(express.json()); // JSON 요청을 처리

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 회원가입 (Registration)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 이메일 중복 확인
        const { data: existingUser, error: emailCheckError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 비밀번호 암호화 (Argon2 사용)
        const hashedPassword = await argon2.hash(password);

        // 사용자 정보 저장
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ name, email, password: hashedPassword })
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 로그인 (Login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 이메일 존재 여부 확인
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name, email, password')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (userError) throw userError;

        // 비밀번호 검증 (Argon2 사용)
        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 비밀번호 검증 성공
        res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
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
