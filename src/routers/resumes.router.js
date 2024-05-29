//이력서 생성
import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//인증을 통해서 사용자 정보받기
router.post('/resumes', authMiddleware, async (req, res, next) => {
  const { id } = req.user;
  //제목, 자기소개서 req로 전달받기
  const { title, introduce } = req.body;
  //유효성검증 및 에러처리
  //자기소개, 제목 중 하나라도 빠진 경우
  if (!title || !introduce) {
    return res.status(400).json({
      message: '제목과 자기소개서 모두 입력해주세요',
    });
  }
  //자기소개 글자수가 150자 보다 짧은 경우
  if (introduce.length < 150) {
    return res.status(400).json({
      message: '자기소개서는 150자 이상 작성해주세요.',
    });
  }

  //작성자 id는 인증 미들웨어 에서 전달받은 정보 활용
  const data = await prisma.resume.create({
    data: {
      authorId: id,
      title,
      introduce,
    },
  });
  return res.status(201).json({
    message: '이력서를 생성하였습니다.',
    data,
  });
  //이력서 id, 지원상태, 생성일시, 수정일시는 자동생성
  //지원상태의 종류(기본값 APPLY)

  //반환 이력서 id, 작성자 id, 제목, 자기소개, 지원상태, 생성일시, 수정일시
});

router.get('/resumes/me', authMiddleware, async (req, res, next) => {
  //이력서 목록조회
  //사용자 정보=인증을 통해 전달받음
  //query parameter로 정렬조건 받음, 과거순, 최신순으로 정렬받는데 값이 없는 경우 최신순으로 정렬
  //대소문자 구분없이 동작
  //유효성검증 : 일치하는 값이 없는 경우 빈배열 반환; status 200
  //로그인한 사용자가 작성한 이력서 목록만 조회
  //db 에서 이력서 조회시 작성자 id일치
  //정렬조건에 따라 다른 결과값...
  //작성자 id가 아닌 작성자 이름을 반환 ; 스키마 정의 활용해 조회
  //반환정보 ; 이력서 id, 작성자 이름, 제목, 자기소개 지원상태, 생성일시, 수정일시
});

export default router;
