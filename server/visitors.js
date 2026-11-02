// 제주특별자치도 서귀포시 직영관광지 관람객수 추이 (공공데이터포털 odcloud, 2025-10-02 기준 파일)
// 월별로 6곳(감귤박물관·산방산_용머리·정방폭포·중문대포 주상절리대·천제연폭포·천지연폭포)의 관람객 수가 있습니다.
const URL_BASE = 'https://api.odcloud.kr/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca'

export async function getVisitors() {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) throw new Error('DATA_GO_KR_KEY 가 없어요 (.env.local 확인)')

  const params = new URLSearchParams({ page: '1', perPage: '100', returnType: 'JSON', serviceKey: key })
  const r = await fetch(`${URL_BASE}?${params}`)
  const j = await r.json().catch(() => { throw new Error(`관람객 API 응답이 JSON이 아님 (${r.status})`) })
  if (!r.ok || !Array.isArray(j.data)) throw new Error(`관람객 API 오류: ${j.msg ?? r.status}`)

  // 한 줄 = 한 달. 곳 이름 컬럼만 뽑아서 { 연, 월, sites: { 곳: 인원 } } 로 바꿉니다
  const meta = new Set(['기준연도', '기준월', '데이터기준일자'])
  const months = j.data
    .map((row) => ({
      year: row['기준연도'],
      month: row['기준월'],
      sites: Object.fromEntries(Object.entries(row).filter(([k]) => !meta.has(k))),
    }))
    .sort((a, b) => a.year - b.year || a.month - b.month)

  return { months, sites: Object.keys(months[0]?.sites ?? {}) }
}
