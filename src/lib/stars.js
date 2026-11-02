// 별똥별(유성) 여러 개: 시작 위치·거리·길이·속도·시작 시간을 제각각으로 만든다.
// 방향은 모두 오른쪽 아래(기울기 0.375)로 같아서 소나기처럼 보인다.
export function makeMeteors(count = 12, seed = 7) {
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  return Array.from({ length: count }, (_, i) => {
    const dx = 260 + rand() * 360
    return {
      id: i,
      sx: Math.round(rand() * 760), sy: Math.round(rand() * 240 - 40),
      dx: Math.round(dx), dy: Math.round(dx * 0.375),
      len: Math.round(45 + rand() * 60),
      width: (1 + rand() * 1.1).toFixed(2),
      dur: (3.2 + rand() * 4.5).toFixed(2),   // 한 번 떨어지고 다음까지 걸리는 시간(초)
      delay: (rand() * 7).toFixed(2),
    }
  })
}

// 장식용 배경 별: 매번 같은 모양이 나오도록 숫자 씨앗으로 만든다 (렌더마다 위치가 바뀌지 않게)
// 별자리 지도와 홈 화면이 함께 쓴다.
export function makeBackgroundStars(count = 90, seed = 20261102) {
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: rand() * 800, y: rand() * 520,
    r: 0.5 + rand() * 1.4,
    delay: rand() * 6, dur: 2.5 + rand() * 4,
    warm: rand() > 0.8, // 가끔 노란 별
  }))
}
