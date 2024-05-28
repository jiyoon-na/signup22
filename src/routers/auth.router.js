// //refresh 토큰 관리객체
// // const tokenStorages = {}
// import express, { json } from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { prisma } from '../utils/prisma.util.js';
// import router from '../routers/users.router.js';

// const authRouter = express.Router();

// //엑세스 , 리프레시 토큰 발급 api
// authRouter.post('/tokens', async (req, res) => {
//   //id 전달
//   const { id } = req.body;
//   //엑세스 토큰, 리프레스 토큰 발급
//   const accessToken = jwt.sign({ id: id }, ACCESS_TOKEN_SECRET_KEY, {
//     expiresIn: '12h',
//   });
//   // const refreshToken= jwt.sign({ id: id }, REFRESH_TOKEN_SECRET_KEY , {expiresIn: '7d'});

//   // tokenStorages[refreshToken] = {
//   //   id: id,
//   //   ip: req.ip,
//   //   //어떤 방식으로 요청한 건지
//   //   userAgent: req.headers['user-agent'],
//   // }
//   //클라이언트에게 쿠키(토큰)할당
//   res.cookie('accessToken', accessToken);
//   // res.cookie('refreshToken', refreshToken);
//   return res
//     .status(200)
//     .json({ message: 'Token이 정상적으로 발급되었습니다.' });
// });

// export default authRouter;
// //user.router에 옮김
