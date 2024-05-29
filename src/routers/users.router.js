import express, { json } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import errorHandler from '../middlewares/error-handler.middleware.js';

const router = express.Router();

//**사용자 회원가입 api**// 2-2 참고
router.post('/sign_up', async (req, res, next) => {
  //     1. **요청 정보**
  //     - **이메일, 비밀번호, 비밀번호 확인, 이름**을 **Request Body**(`**req.body**`)로 전달 받습니다.
  const { email, password, password_confirm, name } = req.body;
  // 2. **유효성 검증 및 에러 처리**
  //     - **회원 정보 중 하나라도 빠진 경우** - “OOO을 입력해 주세요.”
  if (!email || !password || !password_confirm || !name) {
    return res.status(400).json({
      message: '회원정보를 모두 입력해주세요',
    });
  }
  //     - **이메일 형식에 맞지 않는 경우** - “이메일 형식이 올바르지 않습니다.”; 정규표현식 찾아볼 것
  const regex = /[a-zA-Z\d._+-]+@[a-zA-Z\d-]+\.[a-zA-Z\d.]+/;
  if (!regex.test(email)) {
    return res.status(400).json({
      message: '이메일 형식이 올바르지 않습니다.',
    });
  }
  //     - **이메일이 중복되는 경우** - “이미 가입 된 사용자입니다.”
  const is_exist_user = await prisma.user.findFirst({
    where: { email },
  });
  if (is_exist_user) {
    return res.status(400).json({
      message: '이미 가입된 사용자 입니다.',
    });
  }
  //     - **비밀번호가 6자리 미만인 경우** - “비밀번호는 6자리 이상이어야 합니다.”
  if (password.length < 6) {
    return res.status(400).json({
      message: '비밀번호는 6자리 이상이여야 합니다.',
    });
  }
  //     - **비밀번호와 비밀번호 확인이 일치하지 않는 경우** - “입력 한 두 비밀번호가 일치하지 않습니다.”
  if (password !== password_confirm) {
    return res.status(400).json({
      message: '입력한 두 비밀번호가 일치하지 않습니다',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  //user테이블에 이메일, 패스워드를 이용해 사용자 생성 ; 필요한 구문인지 확인
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log(user);

  // 4. **반환 정보**
  //     - **사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시**를 반환합니다.

  return res.status(201).json({
    message: '회원가입에 성공했습니다',
    data: user,
  });
});

//로그인 api
router.post('/sign_in', async (req, res, next) => {
  //이메일, 패스워드 전달받기
  const { email, password } = req.body;
  //이메일 형식 맞는지 확인, 사용자가 있는지 확인, 비밀번호 일치하는지 확인
  const regex = /[a-zA-Z\d._+-]+@[a-zA-Z\d-]+\.[a-zA-Z\d.]+/;
  if (!regex.test(email)) {
    return res.status(400).json({
      message: '이메일 형식이 올바르지 않습니다.',
    });
  }

  // if (!email) {
  //   //!user?
  //   return res.status(400).json({
  //     message: '이메일 인증정보가 유효하지 않습니다',
  //   });
  // }
  const user = await prisma.user.findFirst({ where: { email } });
  console.log(user);
  if (!user) {
    return res.status(400).json({
      message: '사용자없음',
    });
  }

  //bycrypt 이용해 비밀번호가 일치하는지 확인
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({
      message: '패스워드 인증정보가 유효하지 않습니다',
    });
  }
  //로그인성공 jwt 토큰발급
  const accessToken = jwt.sign(
    {
      user_id: user.id,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: '12h' },
    // 'customized_secret_key', //비밀키 나중에 dotenv에 넣을 것
  );
  return res.status(200).json({
    message: '로그인 성공했습니다',
    data: {
      accessToken,
    },
  });
});

//사용자 인증; 미들웨어를 통해 들어간 토큰을 여기서 인증하나?
// router.get('/auth', authMiddleware, async (req, res, next) => {
//   const authToken = await req.headers.authorization;
//   if (authToken) {
//     return res.status(200).json({ user: req.user });
//   }

// const is_exist_user = await prisma.user.findFirst({
//   where: { email },
// });
// if (is_exist_user) {
//   return res.status(400).json({
//     message: '이미 가입된 사용자 입니다.',
//   });

// try {
//   const authToken = req.headers.authorization;
//   if (!authToken) {
//     return res.status(400).json({
//       message: '인증정보가 없습니다.',
//     });
//   }
//   //jwt 표준인증형태
//   const [tokenType, token] = authorization.split(' ');

//   if (tokenType !== 'Bearer')
//     throw new Error('토큰 타입이 일치하지 않습니다.');
//   //access 유효기간

//   //payload 담긴 사용자 아이디와 일치하지 않은 경우

//   //일치해서 사용자id이용해 정보 조회

//   //조회된 정보를 res에 담아 정보조회
// } catch (error) {
//   //그 밖에 검증 실패시..
//   console.error(error);
// }
// });
//사용자 조회 api : 뭘로 조회하나? authorization 가능한가
router.get('/users/me', authMiddleware, async (req, res, next) => {
  //auth미들웨어에서 할당된 사용자정보 => 로그인한 아이디의 정보가 들어있음
  const user = req.user;
  const { password, ...userWithoutPassword } = user;
  return res.status(200).json({
    data: {
      user: userWithoutPassword,
    },
  });
});

export default router;
