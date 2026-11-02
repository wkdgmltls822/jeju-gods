// 제주 신화 속 신들 — 별자리 지도의 별 하나하나
// text 는 본풀이(제주 무속 신화)의 줄거리를 짧게 풀어 쓴 소개글입니다. (발표 전에 출처로 한 번 더 확인하세요)
// x, y 는 별자리 지도(800×520) 위의 위치, places 는 TourAPI 로 찾을 관련 장소 검색어입니다.
// photo 는 신 그림 배경에 깔 실제 장소 사진을 찾는 검색어입니다.
export const GODS = [
  {
    id: 'seolmundae', name: '설문대할망', role: '창조의 거인 여신', tale: '설문대할망 설화',
    text: '치마폭에 흙을 담아 나르다 흙이 새어 나와 오름이 되었고, 한라산을 베개 삼아 누웠다고 전해지는 거인 여신입니다. 끝내 깊은 물장오리에 빠져 사라졌다는 이야기가 남아 있어요.',
    x: 400, y: 70, places: ['한라산'], photo: '제주돌문화공원',
  },
  {
    id: 'cheonjiwang', name: '천지왕', role: '하늘을 다스리는 왕', tale: '천지왕본풀이',
    text: '하늘에서 내려와 땅의 총명부인과 인연을 맺고, 대별왕과 소별왕 쌍둥이를 얻은 하늘의 왕입니다. 세상이 열리는 이야기의 시작에 서 있는 신이에요.',
    x: 230, y: 120, places: ['한라산'], photo: '백록담',
  },
  {
    id: 'daebyeol', name: '대별왕·소별왕', role: '이승과 저승을 나눠 다스린 쌍둥이', tale: '천지왕본풀이',
    text: '천지왕의 두 아들로, 형 대별왕은 저승을, 동생 소별왕은 이승을 맡아 다스리게 되었다고 합니다. 해와 달이 둘씩 떠 있던 세상을 바로잡은 이야기와 이어져요.',
    x: 130, y: 230, places: ['제주신화월드'], photo: '성산일출봉',
  },
  {
    id: 'samseong', name: '삼성신(고·양·부)', role: '탐라를 연 세 시조', tale: '탐라 건국 신화',
    text: '삼성혈의 세 구멍에서 솟아난 고을나·양을나·부을나입니다. 바다 건너온 세 공주를 맞이해 농사와 목축을 시작하며 탐라의 문을 열었다고 해요.',
    x: 560, y: 130, places: ['삼성혈'], photo: '삼성혈',
  },
  {
    id: 'baekjuddo', name: '백주또', role: '당신화의 어머니 신', tale: '송당본풀이',
    text: '송당 본향당의 여신으로, 사냥하는 소천국과 부부가 되어 많은 자손 신을 낳았습니다. 제주 곳곳 당의 신들이 이 신의 가계에서 갈라져 나왔다고 전해져요.',
    x: 690, y: 230, places: ['아부오름'], photo: '아부오름', // 송당리의 오름
  },
  {
    id: 'yeongdeung', name: '영등할망', role: '바람의 여신', tale: '영등굿',
    text: '음력 2월 초하루에 바람과 함께 제주에 들어와 보름에 돌아간다는 신입니다. 이 시기에 해녀들이 바다에서 소라·전복의 씨를 뿌려 주기를 빌었어요.',
    x: 600, y: 330, places: ['해녀박물관'], photo: '해녀박물관',
  },
  {
    id: 'jacheongbi', name: '자청비', role: '농사를 가르친 세경 여신', tale: '세경본풀이',
    text: '문도령과의 사랑을 지키려 갖은 모험을 겪고, 끝내 오곡의 씨앗을 얻어 세상에 농사를 퍼뜨린 여신입니다. 제주 농경의 신 세경으로 모셔져요.',
    x: 420, y: 300, places: ['제주민속촌'], photo: '보롬왓',
  },
  {
    id: 'munjeon', name: '문전신', role: '집의 문을 지키는 신', tale: '문전본풀이',
    text: '집 문 앞에서 가족의 평안을 지키는 신입니다. 일곱 아들 중 막내 녹디생이가 지혜로 어머니를 구해 낸 이야기로 전해져요.',
    x: 260, y: 340, places: ['제주민속촌'], photo: '성읍민속마을',
  },
  {
    id: 'jowang', name: '조왕할망', role: '부엌의 불을 지키는 신', tale: '문전본풀이',
    text: '문전본풀이에서 여산부인이 부엌을 지키는 조왕신이 되었다고 합니다. 아궁이의 불과 집안의 먹을거리를 돌보는 신이에요.',
    x: 190, y: 440, places: ['제주민속촌'], photo: '이중섭 거주지',
  },
  {
    id: 'chilseong', name: '칠성신', role: '뱀의 모습을 한 풍요의 신', tale: '칠성본풀이',
    text: '뱀의 모습으로 나타나 집안의 재물과 풍요를 지킨다고 믿어 온 신입니다. 제주에서는 뱀을 함부로 해치지 않고 집을 지키는 존재로 여겼어요.',
    x: 480, y: 440, places: ['제주민속촌'], photo: '만장굴',
  },
]

// 별자리 선: 어떤 별끼리 이을지
export const EDGES = [
  ['cheonjiwang', 'seolmundae'], ['cheonjiwang', 'daebyeol'], ['seolmundae', 'samseong'],
  ['samseong', 'baekjuddo'], ['baekjuddo', 'yeongdeung'], ['yeongdeung', 'jacheongbi'],
  ['jacheongbi', 'munjeon'], ['munjeon', 'jowang'], ['jacheongbi', 'chilseong'], ['daebyeol', 'munjeon'],
]

export const godById = (id) => GODS.find((g) => g.id === id)

// 오늘 날씨(기상청 예보 한 시각)에 어울리는 신을 고릅니다. 점수가 가장 높은 신, 같으면 앞에 있는 신.
export function pickGodForWeather(w) {
  if (!w) return { god: godById('seolmundae'), reason: '오늘의 하늘을 불러오는 중이라, 먼저 설문대할망을 만나 봐요.' }
  const rainy = w.rain !== '없음' || w.rainChance >= 60
  const scores = {
    yeongdeung: w.wind >= 4 ? 5 : 0,                         // 바람이 센 날
    cheonjiwang: rainy ? 4 : 0,                              // 비 오는 날, 하늘이 열리는 날
    seolmundae: w.sky === '흐림' || w.sky === '구름많음' ? 3 : 0, // 구름 낀 한라산
    jacheongbi: !rainy && w.sky === '맑음' ? 3 : 0,           // 맑아서 농사짓기 좋은 날
    jowang: w.temp <= 10 ? 4 : 0,                            // 부엌 불이 고마운 날
    samseong: 1,                                             // 기본
  }
  const reasons = {
    yeongdeung: `바람이 ${w.wind}m/s 로 불어요. 영등할망이 바람을 타고 오는 날이에요.`,
    cheonjiwang: `비 소식(강수확률 ${w.rainChance}%)이 있어요. 하늘의 왕 천지왕을 떠올리기 좋은 날이에요.`,
    seolmundae: `하늘이 ${w.sky}이에요. 구름 걸린 한라산을 베고 누운 설문대할망이 어울려요.`,
    jacheongbi: `하늘이 맑아요. 농사를 가르친 자청비의 날이에요.`,
    jowang: `기온이 ${w.temp}°C 로 쌀쌀해요. 부엌 불을 지키는 조왕할망이 떠오르는 날이에요.`,
    samseong: '오늘은 특별한 날씨가 없어요. 탐라를 연 삼성신의 이야기로 시작해 봐요.',
  }
  const [id] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return { god: godById(id), reason: reasons[id] }
}

// 신마다 대표 빛깔 (그림 카드와 3D 별자리에서 같이 씁니다)
export const GOD_COLORS = {
  seolmundae: '#7dd3fc', cheonjiwang: '#fde68a', daebyeol: '#f9a8d4', samseong: '#5eead4', baekjuddo: '#c4b5fd',
  yeongdeung: '#a5f3fc', jacheongbi: '#bef264', munjeon: '#fdba74', jowang: '#fb923c', chilseong: '#a78bfa',
}
