// 장면 시간표: 이름 → 역할 → 말풍선 → 설명 → 버튼 순서로 이어지도록 시작 시각을 계산한다
export function godTimeline({ name, reason, text = '' }) {
  const nameStart = 0.35
  const nameEnd = nameStart + [...name].length * 0.05
  const reasonPop = nameEnd + 0.3
  const reasonWords = reasonPop + 0.2
  const textStart = reasonWords + reason.split(' ').length * 0.05 + 0.15
  const actions = textStart + (text ? text.split(' ').length * 0.03 : 0) + 0.15
  return { tale: 0.15, nameStart, role: nameEnd + 0.05, reasonPop, reasonWords, textStart, actions }
}
