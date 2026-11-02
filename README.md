# 신들의 섬, 제주

> 1만 8천 신이 깃든 땅의 신화와 설화를, AI 이야기꾼과 함께 오늘의 날씨와 장소 위에서 다시 만나는 웹앱

- 배포 주소: https://jeju-gods.vercel.app
- GitHub: https://github.com/wkdgmltls822/jeju-gods
- 제주대 청년도약 부트캠프 1기 BOOT UP · 2일 개별 과제

## 기획 의도

**어떤 제주 IP인가** — 제주 신화·설화 속 신들(설문대할망, 영등할망, 자청비 등 10명)

**누구를 위한 것인가** — 제주 신화를 책으로 읽기는 어렵지만, 여행하며 이야기와 장소를 함께 만나고 싶은 사람

**어떤 가치인가**
- 신들을 밤하늘의 **별자리 지도**로 그려, 별을 눌러 이야기를 만난다. 평면 지도와 함께, 끌어서 돌려 볼 수 있는 **3D 별자리**(Three.js)도 있고, 한라산이 솟은 **3D 제주 지도** 위에 별자리를 띄워 각 신과 이어진 실제 장소로 빛줄기가 내려오게 했다(해안선은 단순화한 지형).
- 그날의 **날씨**가 오늘의 신을 고른다. (바람 센 날은 영등할망, 구름 낀 날은 설문대할망)
- 신과 이어지는 **실제 장소**를 보여 주고, 서귀포 관광지가 **얼마나 붐비는지**도 함께 알려 준다.
- **AI 신**과 대화하면, 신의 말투로 답하면서 날씨·장소·관람객 데이터를 스스로 찾아 근거로 쓴다.

## 화면

| 화면 | 주소 | 설명 |
|---|---|---|
| 홈 | `/` | 기획 의도, 오늘 제주 날씨, 날씨로 고른 오늘의 신 |
| 별자리 | `/myths` | 신 10명의 별자리 지도(평면·3D 전환), 신 소개, 관련 장소, 서귀포 월별 관람객 그래프, 즐겨찾기 |
| 신과 대화 | `/agent` | 신을 골라 대화. 답변 아래에 AI가 호출한 도구가 표시됨 |
| 내 신 기록 | `/my` | 닉네임별 즐겨찾기한 신과 대화 기록 (Supabase) |

## 사용한 공공데이터 API (3개)

| # | API | 쓰는 곳 | 서버 함수 |
|---|---|---|---|
| 1 | 한국관광공사 국문 관광정보 서비스 (TourAPI) | 신 소개의 "이어지는 곳", 신 그림 배경에 깔리는 실제 장소 사진(출처 표기: 한국관광공사) | `/api/tour` |
| 2 | 기상청 단기예보 조회서비스 | 홈 날씨 배지, 오늘의 신 고르기 | `/api/weather` |
| 3 | 제주특별자치도 서귀포시 직영관광지 관람객수 추이 | 별자리 페이지 월별 막대 그래프 | `/api/visitors` |

세 API 모두 공공데이터포털 인증키 하나(`DATA_GO_KR_KEY`)로 호출한다. 키는 서버 함수에서만 쓰이고 브라우저에는 나가지 않는다.

## AI 에이전트

신을 고르면 그 신의 말투로 답하고, 필요한 정보는 **도구를 스스로 골라 호출**한 뒤 결과로 답한다. 호출한 도구는 답변 아래에 칩으로 보인다.

| 도구 | 하는 일 | 연결된 API |
|---|---|---|
| `get_weather` | 제주시·서귀포시 앞으로 몇 시간 예보 | 기상청 |
| `search_places` | 제주 장소 검색 | TourAPI |
| `get_visitors` | 서귀포 관광지 6곳 월별 관람객 | 서귀포 관람객 추이 |
| `get_god` | 신의 역할·본풀이·이야기 | 직접 정리한 신 데이터 |

안전장치: 도구 호출 루프 상한 5회, 대화 기록은 최근 10개만 전송, 답은 5문장 이내, "도구 결과에 없는 내용은 지어내지 않는다" 지시.

AI는 `ANTHROPIC_API_KEY`가 있으면 Claude(`claude-sonnet-5-5`)를, 없고 `GEMINI_API_KEY`만 있으면 Gemini를 쓴다.

**데모 채팅(폴백)**: AI 키가 없거나 사용 한도를 넘었거나 연결에 실패하면, API 연동 없이 미리 준비한 답(`server/dummyChat.js`)으로 대신 응답한다. 이때 화면에는 호출한 도구 대신 "데모 응답 · AI·API 없이 미리 준비한 답이에요 (이유)"가 표시되어, 실제 AI 답변과 구분된다. 날씨·관람객 같은 실시간 정보는 지어내지 않고 "지금은 확인할 수 없다"고 답한다. `AI_DEMO=1` 환경변수로 일부러 데모 모드를 켤 수도 있다.

### 에이전트 테스트 기록

| # | 질문 | 기대 | 결과 |
|---|---|---|---|
| 1 | 제주시 지금 날씨 어때? | `get_weather` 호출 | (캡처 추가 예정) |
| 2 | 설문대할망 이야기가 뭐야? | `get_god` 호출 | (캡처 추가 예정) |
| 3 | 내일 서귀포에 비 오면 갈 만한 곳, 덜 붐비는 곳이면 좋겠어 | 도구 2개 이상 연속 호출 | (캡처 추가 예정) |
| 4 | 제주에 있는 에펠탑 알려줘 | 지어내지 않고 "없다"고 답함 | (캡처 추가 예정) |

## Supabase (저장·조회)

| 테이블 | 저장하는 것 |
|---|---|
| `favorite_gods` | 닉네임별 즐겨찾기한 신 |
| `chat_logs` | 닉네임별 신과 나눈 대화 (질문과 답) |

테이블을 만드는 SQL은 [`supabase/schema.sql`](supabase/schema.sql)에 있다. 새로고침하거나 다른 브라우저에서 같은 닉네임을 쓰면 기록이 그대로 보인다.

> 로그인 없이 닉네임으로 구분하는 과제용 구조라서, 같은 닉네임을 쓰면 기록이 섞일 수 있다. 실제 서비스라면 Supabase Auth로 로그인한 사용자만 쓰게 바꿔야 한다.

## 구조

```
api/                 Vercel 서버 함수 (/api/파일이름) — 비밀 키는 여기서만 쓴다
  tour.js  weather.js  visitors.js  agent.js
server/              공공데이터 호출 함수 (화면용 API와 에이전트 도구가 함께 사용)
src/
  main.jsx           Bootstrap + 우리 스타일, 라우터 시작
  router.jsx         메뉴(NAV_ITEMS) + 주소별 페이지
  layouts/           공통 틀 (메뉴·푸터)
  pages/             Home, Myths, Agent, My, NotFound
  components/        StarMap, StarMap3D(3D), JejuMap3D(3D 지도), GodArt(신 그림), GodPanel, VisitorChart, WeatherBadge, TodayGod ...
  store/             Zustand 전역 상태 (닉네임, 날씨, 즐겨찾기, 대화)
  data/gods.js       신 10명의 정보와 날씨 매칭 규칙
  api/client.js      화면 → /api 호출 함수
  lib/supabase.js    Supabase 연결
supabase/schema.sql  테이블 생성 SQL
vercel.json          새로고침 시 404 방지, 서울 리전, 에이전트 제한 시간
```

## 실행 방법

```bash
npm install
cp .env.example .env.local   # 값 채우기 (Windows: copy .env.example .env.local)
npm run dev                  # http://localhost:5173  (화면 + /api 함께 실행)
```

`npm run dev`로 `vite.config.js`의 개발용 연결 코드가 `/api/*`를 `api/` 폴더 함수로 이어 준다. 배포하면 같은 파일이 Vercel 서버 함수로 동작한다.

### 환경변수

| 이름 | 용도 | 브라우저에 노출? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase 주소 | 공개용 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개(publishable) 키 | 공개용 |
| `DATA_GO_KR_KEY` | 공공데이터포털 인증키 | 서버만 |
| `ANTHROPIC_API_KEY` | Claude 키 | 서버만 |
| `GEMINI_API_KEY` | (임시) Gemini 키 | 서버만 |

`.env.local`은 `.gitignore`에 들어 있어 GitHub에 올라가지 않는다. 배포할 때는 Vercel → Settings → Environment Variables에 같은 이름으로 입력한다.

## 개발하며 알게 된 점

- TourAPI에 `areaCode=39`(제주) 필터를 걸면 제주 삼성혈 같은 장소가 빠졌다. 그래서 전국에서 검색한 뒤 주소가 "제주"인 것만 서버에서 걸러낸다. 숙박·쇼핑·음식점도 기본으로 뺐다.
- 신 이름(설문대할망 등)은 TourAPI에 없다. 신 소개는 직접 정리한 데이터(`src/data/gods.js`)이고, TourAPI는 신과 이어지는 "장소"를 찾는 데 쓴다. 신 소개는 본풀이 줄거리를 짧게 풀어 쓴 것이라 출처로 한 번 더 확인이 필요하다.
- 서귀포 관람객 데이터는 공공데이터포털의 odcloud 형식이라 다른 두 API와 주소 형식이 다르다.
