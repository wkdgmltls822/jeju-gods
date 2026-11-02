import { useEffect, useState } from 'react'
import { fetchVisitors } from '../api/client'
import { ErrorNote, Loading } from './Status'
import CountUp from './CountUp'

// 서귀포 직영관광지 월별 관람객 — "사람들이 이 신의 땅을 얼마나 찾는지" 막대로 보여줍니다
export default function VisitorChart() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [idx, setIdx] = useState(null) // 선택한 달 (처음엔 가장 최근 달)

  useEffect(() => {
    fetchVisitors().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorNote error={error} text="관람객 정보를 불러오지 못했어요" />
  if (!data) return <Loading text="관람객 정보를 불러오는 중…" />

  const i = idx ?? data.months.length - 1
  const m = data.months[i]
  const max = Math.max(...data.months.flatMap((x) => Object.values(x.sites))) // 달이 바뀌어도 막대 길이 기준을 같게
  const rows = Object.entries(m.sites).sort((a, b) => b[1] - a[1])

  return (
    <section className="visitor-chart">
      <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-2">
        <h2 className="h5 mb-0"><i className="bi bi-people me-1 sea" />서귀포 관광지, 이 달엔 몇 명이 찾았을까</h2>
        <span className="accent fw-bold">{m.year}년 {m.month}월</span>
      </div>
      <input type="range" className="form-range" min="0" max={data.months.length - 1} value={i}
        onChange={(e) => setIdx(Number(e.target.value))} aria-label="월 선택" />
      <ul className="list-unstyled mb-1">
        {rows.map(([name, n]) => (
          <li key={name} className="bar-row">
            <span className="bar-name">{name.replace('_', ' · ')}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${(n / max) * 100}%` }} /></span>
            <span className="bar-num"><CountUp value={n} />명</span>
          </li>
        ))}
      </ul>
      <p className="text-secondary small mb-0">자료: 제주특별자치도 서귀포시 직영관광지 관람객수 추이(공공데이터포털)</p>
    </section>
  )
}
