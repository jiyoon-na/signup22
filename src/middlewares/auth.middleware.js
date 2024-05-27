//로그인에 발급되는 토큰
import jwt from 'jsonwebtoken';
import prisma, { Prisma } from '../utils/prisma.util.js';

export default async function (req, res, next) {
  try {
    //클라이언트로 부터 쿠키 전달받기
    const { authorization } = req.cookies;
    //쿠키가 bearer토큰 형식인지 확인
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw new Error('토큰타입이 일치하지 않습니다');

    const decodedToken = jwt.verify(token, 'customized_secret_key');
    const user_id = decodedToken.user_id;
    //jwt의 user_id 이용해서 사용자 조회
    const user = await prisma.user.findFirst({
      where: { user_id: +user_id },
    });
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }
    //req.user에 조회된 사용자 정보를 할당
    req.user = user;
    //다음 미들웨어 실행
    next();
  } catch (error) {
    res.clearCookie('authorization'); // 특정쿠키 삭제

    switch (error.name) {
      case 'TokenExpriedError': //토큰 만료되었을 때 발생하는 에러
        return res.status(401).json({ message: '토큰이 만료되었습니다' });

      case 'JsonWebTokenError': //토큰검증이 실패했을 때 발생하는 에러
        return res.status(401).json({ message: '토큰 인증에 실패하였습니다' });

      default:
        return res
          .status(401)
          .json({ message: error.message ?? '비정상적인 요청입니다.' });
    }
  }
}
