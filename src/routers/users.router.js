import express, { json } from 'express';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';
// import authRouter from '../routers/auth.router.js';

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
  try {
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

    //로그인성공 jwt 토큰발급. url 찾아볼것//

    const { id } = req.body;
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: '12h',
      },
    );
    // const token = jwt.sign(
    //   {
    //     user_id: user.user_id,
    //   },
    //   'customized_secret_key', //비밀키 나중에 dotenv에 넣을 것
    // );
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log(data);
    //
    // res.cookie('authorization', `Bearer ${token}`);
    res.cookie('accessToken', accessToken);
    // res.cookie('refreshToken', refreshToken);
    // return res.status(200).json({
    //   data,
    //   message: '로그인 성공했습니다',
    // });
    return res
      .status(200)
      .json({ message: 'Token이 정상적으로 발급되었습니다.' });

    //비즈니스 로직처리 : 엑세스토큰 ; 사용자 아이디 포함, 유효기간 12시간생성
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: '서버오류가 발생했습니다' });
  }
});
router.get('/tokens', async (req, res) => {
  const { user_id } = req.body;
  const accessToken = jwt.sign({ user_id }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: '12h',
  });
  res.json({ accessToken });
});
//사용자 조회 api 2-2 58분 : 이력서 목록조회로 바꿀것
//auth미들웨어에서 가져올 것; get메서드와 user메서드를 쓸 때 콜백함수 실행
//=> auth미들웨어 입력=>api수행되기 위해서 미들웨어가 정상작동해야지 뒤에 콜백함수 실행가능

router.post('/users', authMiddleware, async (req, res, next) => {
  //클라이언트가 로그인된 사용자인지 검증
  try {
    const { user_id } = req.user;
    //사용자 조회시 1:1 관계 맺고 있는 user와 userinfos 테이블 조회
    const user = await prisma.user.findFirst({
      where: { id: +user_id },
      //특정컬럼만 조회하는 파라미터
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
        role: true,
        createdAt: true,
        updatedAt: true,

        // Resume: {
        //   id:   //id맞나?
        // }
      },
    });
    //조회사나 사용자의 상세한 정보를 클라이언트에게 반환
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: '서버오류가 발생했습니다' });
  }
});

export default router;
