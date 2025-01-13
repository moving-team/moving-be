# 🛻 MOVING - **FullStack 1기 3팀**

팀 노션 : [melodious-hair-848.notion.site](https://melodious-hair-848.notion.site/) 

---

### **팀 구성**

- 정준호
- 김민수
- 송영섭

### **프로젝트 기간**

- **2024.11.25 ~ 2025.01.14**

### **프로젝트 설명**

- **이사 업체와 사용자간의 매칭**
  - 사용자 : 이사 정보 등록과 견적 요청 & 업체 지정 견적 요청
  - 업체 : 사용자 이사 정보 확인 후 견적 발송

### **기술 스택**
- **Express, Prisma**
- **AWS EC2, S3, PostgreSQL**

### 개발 기능 요약

- **정준호**
  - Seeding 작업 관련 전반 및 DB 관리
    - Python 및 Selenium 활용하여 크롤링 스크립트 작성
    - 실제 유사 서비스 도메인에서 업체 정보 및 댓글 등 데이터 추출
    - 추출 데이터 기반 Dummy 데이터, Test 데이터 생성 스크립트와 Insert 스크립트 작성
  - DB 관련 기능 자동화 스크립트 작성
    - Console을 통해 DB 초기화 및 Seeding 자동화를 제어할 수 있도록 스크립트 작성
    - moving-be/prisma/seed/helper/helperDB.ts
  - 리뷰 관련 API 기능 구현
  - Google 로그인 기능 구현
 

- **김민수**
  - 유저 관리 및 jwt 토큰 관리
    - user
      - 회원가입
      - 로그인
      - 로그아웃
      - 유저조회
    - Oauth
      - 카카오 로그인
      - 네이버 로그인
    - CUSTOMER
      - 소비자 프로필 조회
      - 소비자 프로필 수정
      - 소비자 기본 정보 수정
    - MOVER
      - 기사님 프로필 조회
      - 기사님 프로필 수정
      - 기사님 기본 정보 수정
      - 기사님 리스트 조회
      - 기사님 프로필 상세 조회

- **송영섭**
    - 견적 요청 관련 API 구현
    - 견적 관련 API 두현
    - 지정 견적 관련 API 구현
    - S3, EC2 등 AWS 서버 배포
    - Nginx와 PM2를 사용하여 서버 무중단 배포
    - certbot을 사용하여 https로 배포
    - node-cron을 사용하여 스케줄링 구현
     
   
<hr>

#### 폴더 구조

<details>
<summary>폴더 구조 보기</summary>

<pre> 
📦moving-be
 ┣ 
 ┣ 📂prisma
 ┃ ┗ 📜schema.prisma
 ┣ 📂src
 ┃ ┣ 📂config
 ┃ ┃ ┣ 📜env.ts
 ┃ ┃ ┗ 📜prisma.ts
 ┃ ┣ 📂contents
 ┃ ┃ ┗ 📜region.ts
 ┃ ┣ 📂controllers
 ┃ ┃ ┣ 📜assignedEstimateRequestController.ts
 ┃ ┃ ┣ 📜controller.ts
 ┃ ┃ ┣ 📜customerController.ts
 ┃ ┃ ┣ 📜estimateController.ts
 ┃ ┃ ┣ 📜estimateRequestController.ts
 ┃ ┃ ┣ 📜favoriteController.ts
 ┃ ┃ ┣ 📜moverController.ts
 ┃ ┃ ┣ 📜notificationController.ts
 ┃ ┃ ┣ 📜reviewController.ts
 ┃ ┃ ┗ 📜userController.ts
 ┃ ┣ 📂middlewares
 ┃ ┃ ┣ 📜authMiddleware.ts
 ┃ ┃ ┣ 📜errHandler.ts
 ┃ ┃ ┣ 📜logger.ts
 ┃ ┃ ┣ 📜uploadMiddleware.ts
 ┃ ┃ ┗ 📜validateData.ts
 ┃ ┣ 📂repositories
 ┃ ┃ ┣ 📜assignedEstimateRequestRepository.ts
 ┃ ┃ ┣ 📜customerRepository.ts
 ┃ ┃ ┣ 📜estimateRepository.ts
 ┃ ┃ ┣ 📜estimateRequestRepository.ts
 ┃ ┃ ┣ 📜favoriteRepository.ts
 ┃ ┃ ┣ 📜moverRepository.ts
 ┃ ┃ ┣ 📜movingInfoRepository.ts
 ┃ ┃ ┣ 📜notificationRepository.ts
 ┃ ┃ ┣ 📜reviewRepository.ts
 ┃ ┃ ┗ 📜userRepository.ts
 ┃ ┣ 📂routes
 ┃ ┃ ┣ 📜assignedEstimateRequestRouter.ts
 ┃ ┃ ┣ 📜customerRouter.ts
 ┃ ┃ ┣ 📜estimateRequestRoute.ts
 ┃ ┃ ┣ 📜estimateRouter.ts
 ┃ ┃ ┣ 📜favoriteRouter.ts
 ┃ ┃ ┣ 📜moverRouter.ts
 ┃ ┃ ┣ 📜notificationRoutes.ts
 ┃ ┃ ┣ 📜reviewRouter.ts
 ┃ ┃ ┣ 📜route.ts
 ┃ ┃ ┗ 📜userRouter.ts
 ┃ ┣ 📂services
 ┃ ┃ ┣ 📂mappers
 ┃ ┃ ┃ ┣ 📜assignedEstimateRequestMapper.ts
 ┃ ┃ ┃ ┣ 📜estimateMapper.ts
 ┃ ┃ ┃ ┣ 📜estimateRequestMapper.ts
 ┃ ┃ ┃ ┗ 📜mapper.ts
 ┃ ┃ ┣ 📂selects
 ┃ ┃ ┃ ┣ 📜assignedEstimateRequestSelect.ts
 ┃ ┃ ┃ ┣ 📜customerSelect.ts
 ┃ ┃ ┃ ┣ 📜estimateRequsetSelect.ts
 ┃ ┃ ┃ ┣ 📜estimateSelect.ts
 ┃ ┃ ┃ ┣ 📜moverSelect.ts
 ┃ ┃ ┃ ┣ 📜movingInfoSelect.ts
 ┃ ┃ ┃ ┣ 📜reviewSelect.ts
 ┃ ┃ ┃ ┗ 📜userSelect.ts
 ┃ ┃ ┣ 📜assignedEstimateRequestService.ts
 ┃ ┃ ┣ 📜cronService.ts
 ┃ ┃ ┣ 📜customerService.ts
 ┃ ┃ ┣ 📜estimateRequestService.ts
 ┃ ┃ ┣ 📜estimateService.ts
 ┃ ┃ ┣ 📜favoriteService.ts
 ┃ ┃ ┣ 📜moverService.ts
 ┃ ┃ ┣ 📜notificationService.ts
 ┃ ┃ ┣ 📜reviewService.ts
 ┃ ┃ ┣ 📜service.ts
 ┃ ┃ ┗ 📜userService.ts
 ┃ ┣ 📂structs
 ┃ ┃ ┣ 📜estimate-struct.ts
 ┃ ┃ ┗ 📜estimateRequest-struct.ts
 ┃ ┣ 📂types
 ┃ ┃ ┣ 📜global.d.ts
 ┃ ┃ ┣ 📜repositoryType.ts
 ┃ ┃ ┗ 📜serviceType.ts
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜createNotificationContents.ts
 ┃ ┃ ┣ 📜dateUtil.ts
 ┃ ┃ ┣ 📜google.ts
 ┃ ┃ ┣ 📜kakao.ts
 ┃ ┃ ┣ 📜mapperUtil.ts
 ┃ ┃ ┣ 📜moverUtile.ts
 ┃ ┃ ┣ 📜naver.ts
 ┃ ┃ ┗ 📜reviewUtil.ts
 ┃ ┗ 📜app.ts
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜.prettierrc
 ┣ 📜README.md
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜test.http
 ┗ 📜tsconfig.json

  </pre>
</details>
