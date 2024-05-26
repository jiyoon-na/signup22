import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';

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
  const is_exist_user = await prisma.users.findFirst({
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

  const hashedPassword = await bcrypt.hash(password,10);
  //user테이블에 이메일, 패스워드를 이용해 사용자 생성 ; 필요한 구문인지 확인
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // 3. **비즈니스 로직(데이터 처리)**
  //     - **사용자 ID, 역할, 생성일시, 수정일시**는 ****자동 생성됩니다.
  //     - **역할**의 종류는 다음과 같으며, 기본 값은 **`APPLICANT`** 입니다.
  //         - 지원자 **`APPLICANT`**
  //         - 채용 담당자 `**RECRUITER**`
  //     - 보안을 위해 **비밀번호**는 평문(Plain Text)으로 저장하지 않고 **Hash 된 값**을 저장합니다.

  //이메일, 패스워드를 이용해 위의 사용자 생성으로 인해 기본키가 생성 , 그 기본키를 활용해서 만듬
  //user 테이블 생성해야함
  const user_info = await prisma.user_infos.creat({
    data: {
      user_id: user.user_id,
      email: email,
      name: name,
      role: { enum: ['APPLICANT', 'RECRUITER'] },
      // createdAt,
      // updatedAt,
    },
  });

  // 4. **반환 정보**
  //     - **사용자 ID, 이메일, 이름, 역할, 생성일시, 수정일시**를 반환합니다.
  return res.status(201).json({
    message: '회원가입에 성공했습니다',
  });
});

//로그인 api
router.post('/sign_in', async (req, res, next) => {
    //이메일, 패스워드 전달받기
  const { email, password } = req.body;
//이메일 형식 맞는지 확인, 사용자가 있는지 확인, 비밀번호 일치하는지 확인
    const user = await prisma.user.findFirst({where: {email}});
    const regex = /[a-zA-Z\d._+-]+@[a-zA-Z\d-]+\.[a-zA-Z\d.]+/;
    if (!regex.test(email)) {
      return res.status(400).json({
        message: '이메일 형식이 올바르지 않습니다.',
      });
    }
  if (!user) {
    return res.status(400).json({
      message: '인증정보가 유효하지 않습니다',
    });
  }
  //bycrypt 이용해 비밀번호가 일치하는지 확인 
  if(!await bcrypt.compare(password, user.password)){
    return res.status(400).json({
        message: '인증정보가 유효하지 않습니다',
    });
  }
  //로그인성공 jwt 토큰발급
  const token = jwt.sign(
    {
        user_id: user.user_id,
    },
  )
  res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({
        message: '로그인 성공했습니다'
    });
  //이메일로 조회되지 않거나 비밀번호가 일치하지 않는 경우
//   const is_exist_user = await prisma.users.findFirst({
//     where: { email },
//     where: { password },
//   });
//   if (!email || !password) {
//     return res.status(400).json({
//       message: '인증정보가 유효하지 않습니다.',
//     });
//   }
  //비즈니스 로직처리 : 엑세스토큰 ; 사용자 아이디 포함, 유효기간 12시간생성
});

export default router;
