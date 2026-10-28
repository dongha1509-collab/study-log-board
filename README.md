# 학습 기록 게시판

웹서비스설계 JWT 게시판 과제입니다.

## 작성자와 서비스 소개

- 학번 / 이름: 202117535 / 강동하
- 서비스 소개: 공부한 내용을 글로 남기는 게시판이다. 공부 기록을 정리하고 싶은 학생이 쓴다. 로그인 없이 누구나 글을 볼 수 있고, 글쓰기는 로그인한 사람만 할 수 있다. 수정과 삭제는 자기가 쓴 글만 할 수 있다.
- 선택한 기술: Vue + Express
- 주요 기능: 글 목록·상세, 로그인(JWT), 내 정보 조회, 글 쓰기·수정·삭제, 로그아웃

## 보고서와 테스트 증거

- [구현 보고서 PDF](docs/report.pdf) (작성 예정)
- [테스트 증거](docs/evidence/) (작성 예정)

## 폴더 구조

```text
.
├── README.md
├── .gitignore
├── frontend/     # Vue
├── backend/      # Express
└── docs/
    ├── report.pdf
    └── evidence/
```

## 실행 환경

| 항목 | 버전 |
|---|---|
| 운영체제 | Windows 11 Pro |
| Node.js | v24.19.0 |
| 프론트 | Vue 3.5.43 (Vite 8.3.4) |
| 백엔드 | Express 5.3.0 |
| 데이터 저장 | SQLite (sql.js 1.14.2) |

## 설치와 실행

### 1 저장소 받기

```sh
git clone [저장소 URL]
cd [저장소 폴더]
```

### 2 백엔드 실행

```sh
cd backend
npm ci
copy .env.example .env
```

(macOS/Linux는 `cp .env.example .env`)

`.env` 파일을 열고 `JWT_SECRET=` 뒤에 새로 만든 키를 넣는다. 키는 아래 명령으로 만든다. 키는 GitHub나 보고서에 올리지 않는다.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

- `TOKEN_TTL`: 토큰이 유효한 시간(초). 기본은 90초다. 만료 테스트를 할 때는 PowerShell에서 `$env:TOKEN_TTL="3"`을 입력하고 서버를 다시 켠다.

```sh
npm start
```

- 주소: http://127.0.0.1:8000
- 확인: 브라우저에서 http://127.0.0.1:8000/api/health 를 열었을 때 `status`가 `ok`면 정상이다.

### 3 프론트 실행

백엔드를 켜 둔 채 새 터미널에서 한다.

```sh
cd frontend
npm ci
npm run build
npm run preview
```

- 접속 주소: http://127.0.0.1:4173
- 개발할 때는 `npm run dev`를 쓰고 http://127.0.0.1:5173 으로 접속한다.
- 프론트의 `/api` 요청은 8000번 백엔드로 전달된다. 포트를 바꾸면 `frontend/vite.config.js`도 바꾼다.
- 끌 때는 두 터미널에서 각각 Ctrl+C를 누른다.
- 코드를 고쳤다면 프론트는 `npm run build`를 다시 하고, 백엔드는 다시 켠다.

### 4 테스트 계정과 DB

| 사용자 | 이메일 | 비밀번호 |
|---|---|---|
| Alice | alice@class.test | Classroom!2026 |
| Bob | bob@class.test | Classroom!2026 |

- DB 파일: 백엔드를 켜면 `backend/data/board.sqlite`가 자동으로 만들어진다.
- DB 초기화: 서버를 끄고 이 파일을 지운 뒤 다시 켠다. 글이 모두 사라진다.
- 서버를 다시 켜도 글이 남는지 확인한 결과: 작성 예정

## 구현 완료 범위

완료 여부는 브라우저에서 직접 확인한 뒤 적는다.

| 기능 | 완료 여부 | 파일 / 함수 |
|---|---|---|
| 공개 목록과 상세 | 작성 예정 | backend/src/app.js (제공 코드), frontend/src/App.vue |
| 로그인과 JWT 발급 | 작성 예정 | backend/src/auth.js `issueToken`, frontend/src/api.js `login` |
| JWT 검증과 내 정보 조회 | 작성 예정 | backend/src/auth.js `currentUserId`, backend/src/app.js `/api/me` |
| 글 작성과 작성자 저장 | 작성 예정 | backend/src/app.js `POST /api/posts` |
| 본인 글 수정·삭제 | 작성 예정 | backend/src/auth.js `assertOwner`, frontend/src/api.js `canEdit` |
| 토큰 만료와 로그아웃 | 작성 예정 | backend/src/auth.js `currentUserId`, frontend/src/api.js `request`, `clearSession` |
| 입력 오류와 권한 오류 처리 | 작성 예정 | backend/src/app.js `fields`, backend/src/auth.js `assertOwner` |

알려진 문제: 작성 예정

## 테스트 결과

- 실행한 검사: 작성 예정 (`tools/check_api.py`는 이 저장소에 넣지 않았다.)
- Alice/Bob 권한 확인: 작성 예정
- 상태 코드와 오류 code 확인: 작성 예정
- 응답 헤더와 본문 확인: 작성 예정
- 토큰 없음·변조·만료 확인: 작성 예정
- T01~T17 전체 결과: 작성 예정 (보고서에 적는다.)

## 핵심 구현 설명

1. **로그인**: `frontend/src/api.js`의 `login`이 이메일과 비밀번호를 서버에 보낸다. 맞으면 `backend/src/auth.js`의 `issueToken`이 토큰을 만들어 준다.
2. **토큰 보관과 전송**: 받은 토큰은 브라우저 메모리에만 저장한다. 요청할 때마다 `authorizationHeaders`가 `Authorization: Bearer <토큰>` 헤더를 붙인다.
3. **서버 검증**: `currentUserId`가 토큰이 진짜인지, 안 만료됐는지, 실제 있는 사용자인지 확인한다. 아니면 401을 보낸다.
4. **작성자 확인**: `assertOwner`가 요청한 사람과 글 작성자가 같은지 본다. 다르면 403을 보낸다.

자세한 코드 설명은 보고서에 있다.

## AI 활용

- 사용 여부: 사용
- 도구와 목적: Claude (Claude Code, Sonnet 5.5). 코드 작성, 오류 확인, 요청 시험, 보고서·README 문장 초안
- 반영한 곳: backend/src/auth.js, backend/src/app.js (두 줄), frontend/src/api.js, frontend/src/App.vue (일부)
- 내가 직접 고치거나 확인한 것: 작성 예정
- 자세한 기록: 보고서 AI 활용 부분 (작성 예정)
- 참고 자료: 수업에서 받은 과제 공지와 제공 템플릿

## 제출 확인

- [ ] README의 안내 문구를 실제 내용으로 바꿨다.
- [ ] 새 폴더에 clone해서 README만으로 설치·빌드·실행했다.
- [ ] 4173번 화면에서 API 연결과 필수 기능을 확인했다.
- [ ] GitHub에서 보고서와 증거 링크가 열린다.
- [ ] 교수자가 저장소를 열람·복제할 수 있다.
- [ ] 비밀 키·실제 토큰·DB·node_modules를 커밋하지 않았다.
- [ ] push 후 저장소 URL과 커밋 SHA를 LMS에 제출했다.
