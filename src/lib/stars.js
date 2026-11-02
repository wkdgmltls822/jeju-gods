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
