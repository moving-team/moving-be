# 🛻 MOVING 



## **FullStack 1기 3팀 BE**

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
- **AWS, PostgreSQL**

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
