//이력서 생성
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//인증을 통해서 사용자 정보받기
router.post('/resumes', authMiddleware, async (req, res, next) => {});
//제목, 자기소개서 req로 전달받기
//유효성검증 및 에러처리

//자기소개, 제목 중 하나라도 빠진 경우
//자기소개 글자수가 150자 보다 짧은 경우

//작성자 id는 인증 미들웨어 에서 전달받은 정보 활용
//이력서 id, 지원상태, 생성일시, 수정일시는 자동생성
//지원상태의 종류(기본값 APPLY)

//반환 이력서 id, 작성자 id, 제목, 자기소개, 지원상태, 생성일시, 수정일시

export default router;
