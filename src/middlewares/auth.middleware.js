//로그인에 발급되는 토큰
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.util.js';

export default async function (req, res, next) {
  try {
    //클라이언트로 부터 쿠키 전달받기
    const authorization = req.headers['authorization'];
    if (!authorization) throw new Error('토큰이 존재하지 않습니다.');
    //쿠키가 bearer토큰 형식인지 확인
    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY); //env넣기
    console.log(decodedToken);
    const user_id = decodedToken.user_id;
    //jwt의 user_id 이용해서 사용자 조회
    const user = await prisma.user.findFirst({
      //where에서 id를 찍어야 하는 이유 : 스키마에서 id로 지정했기때문
      where: { id: +user_id },
    });
    console.log(user_id);
    if (!user) {
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }
    //req.user에 조회된 사용자 정보를 할당
    req.user = user;
    //다음 미들웨어 실행
    next();
  } catch (error) {
    switch (error.name) {
      //토큰 만료되었을 때 발생하는 에러
      case 'TokenExpriedError':
        return res.status(401).json({ message: '토큰이 만료되었습니다' });
      //토큰검증이 실패했을 때 발생하는 에러
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰 인증에 실패하였습니다' });

      default:
        return res
          .status(401)
          .json({ message: error.message ?? '비정상적인 요청입니다.' });
    }
  }
}
