// src/app.js

import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import UsersRouter from './routers/users.router.js';
import errorHandler from './middlewares/error-handler.middleware.js';
import resumeRouter from './routers/resumes.router.js';

// import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = process.env.SERVER_PORT;

app.get('/', (req, res, next) => {
  res.send('NajiWorld!');
});

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter]);
app.use('/api', [resumeRouter]);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
