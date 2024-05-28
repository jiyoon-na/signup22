// src/app.js

import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import UsersRouter from './routers/users.router.js';
// import authRouter from './routers/auth.router.js';

// import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = process.env.SERVER_PORT;

// 비밀 키는 외부에 노출되면 안되겠죠? 그렇기 때문에, .env 파일을 이용해 비밀 키를 관리해야합니다.
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY; // Access Token의 비밀 키를 정의합니다.
// const REFRESH_TOKEN_SECRET_KEY = `Sparta`; // Refresh Token의 비밀 키를 정의합니다.

app.get('/', (req, res, next) => {
  res.send('NajiWorld!');
});

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter]);
// app.use('/tokens', [authRouter]);
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});

//
