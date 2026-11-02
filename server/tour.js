// 한국관광공사 국문 관광정보 서비스 (TourAPI) — 키워드로 장소 검색
// 신 이름은 TourAPI 에 없어서, 신화와 이어지는 "장소"(삼성혈, 한라산 등)를 찾는 용도로 씁니다.
const BASE = 'https://apis.data.go.kr/B551011/KorService2'

export async function searchTour({ keyword = '', contentTypeId = '' } = {}) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) throw new Error('DATA_GO_KR_KEY 가 없어요 (.env.local 확인)')
  if (!keyword.trim()) throw new Error('keyword 가 필요해요')

  const params = {
    serviceKey: key, MobileOS: 'ETC', MobileApp: 'jeju-gods', _type: 'json',
    keyword: keyword.trim(), numOfRows: '50', pageNo: '1',
  }
  if (contentTypeId) params.contentTypeId = contentTypeId
  // areaCode 필터를 걸면 제주 삼성혈 같은 곳이 빠져서, 전국에서 찾은 뒤 주소로 제주만 거릅니다.
  const r = await fetch(`${BASE}/searchKeyword2?${new URLSearchParams(params)}`)
  const j = await r.json().catch(() => { throw new Error(`TourAPI 응답이 JSON이 아님 (${r.status})`) })
  const header = j.response?.header
  if (header?.resultCode !== '0000') throw new Error(`TourAPI 오류: ${header?.resultMsg ?? r.status}`)

  const items = j.response.body.items?.item ?? []
  // 종류를 따로 고르지 않으면 숙박(32)·쇼핑(38)·음식점(39)은 뺍니다 (카페한라산, 삼성혈해물탕 같은 잡음 방지)
  const noise = contentTypeId ? [] : ['32', '38', '39']
  return items
    .filter((i) => i.addr1?.startsWith('제주') && !noise.includes(i.contenttypeid))
    .map((i) => ({
      id: i.contentid,
      title: i.title,
      address: i.addr1,
      image: i.firstimage || null,
      lat: Number(i.mapy) || null,
      lng: Number(i.mapx) || null,
      type: i.contenttypeid,
    }))
}
