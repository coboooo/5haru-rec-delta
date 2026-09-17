# 하루 기록 델타

React와 Firebase로 만든 하루 기록 델타 버전이야.

## 현재 기능

- Google 소셜 로그인과 로그아웃
- 사용자 계정별 실시간 기록 저장·조회·삭제
- Firebase Realtime Database 보안 규칙
- Vercel 프로덕션 배포

## 로컬 실행

```bash
npm install
npm run dev
```

Firebase 웹 앱 연결 정보는 `src/firebase.js`에서 관리해. 이 설정값은 Firebase 웹 클라이언트가 사용하는 공개 식별 정보이며, 데이터 접근 권한은 `database.rules.json`에서 제한해.

## 확인 명령

```bash
npm run lint
npm run build
```

## Firebase 규칙 배포

```bash
npx firebase-tools deploy --only database
```
