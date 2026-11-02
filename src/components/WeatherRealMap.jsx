import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BUILDINGS } from '../lib/buildings'

// 실제 지도(OpenFreeMap 벡터 타일): 건물·도로가 그대로 보이고, 확대하고 기울이면 3D 건물이 올라온다.
// 읍·면 날씨 핀과 대표 시설 표시는 그림 지도와 같은 것을 올린다.
const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export default function WeatherRealMap({ rows, regions, sel, onSelect, modeOf, iconOf }) {
  const box = useRef(null)
  const map = useRef(null)
  const [markers, setMarkers] = useState([])
  const [bad, setBad] = useState(false)

  useEffect(() => {
    let m
    try {
      m = new maplibregl.Map({ container: box.current, style: STYLE, center: [126.55, 33.38], zoom: 9.2, pitch: 50, bearing: -12, maxPitch: 75, attributionControl: { compact: true } })
    } catch { setBad(true); return undefined }
    map.current = m
    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    m.on('error', (e) => { if (e?.error?.status === 0 || /Failed to fetch/.test(e?.error?.message ?? '')) setBad(true) })
    // 날씨 핀 + 대표 시설 마커를 지도 위 HTML 요소로 만들고, 그 안은 React 가 그린다
    const made = [
      ...regions.map((r) => {
        const el = document.createElement('div'); el.className = 'wr-mk'
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(r.pos).addTo(m)
        return { kind: 'wx', name: r.name, el }
      }),
      ...BUILDINGS.map((b) => {
        const el = document.createElement('div'); el.className = 'wr-mk bld'
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(b.pos).addTo(m)
        return { kind: 'bld', b, el }
      }),
    ]
    Promise.resolve().then(() => setMarkers(made))
    return () => { m.remove(); map.current = null }
  }, [regions])

  // 고른 지역으로 부드럽게 날아가기
  useEffect(() => {
    const r = regions.find((x) => x.name === sel)
    if (r && map.current) map.current.easeTo({ center: r.pos, zoom: Math.max(map.current.getZoom(), 11.2), duration: 900 })
  }, [sel, regions])

  if (bad) return <div className="wr wr-bad"><i className="bi bi-wifi-off me-2" />실제 지도를 불러오지 못했어요. 인터넷 연결을 확인하고 그림 지도로 돌아가 보세요.</div>
  return (
    <div className="wr">
      <div ref={box} className="wr-box" />
      {markers.map((k) => {
        if (k.kind === 'bld') return createPortal(<span className={`wr-bld ${k.b.kind}`} title={k.b.name}><i className={`bi bi-${k.b.icon}`} /><em>{k.b.name}</em></span>, k.el, k.b.name)
        const r = rows.find((x) => x.name === k.name)
        if (!r) return null
        const m = modeOf(r.h)
        return createPortal(
          <button type="button" className={`wr-pin ${r.name === sel ? 'on' : ''}`} style={{ '--tc': m.color }} onClick={() => onSelect(r.name)} aria-label={`${r.name} ${r.h.temp}도`}>
            <i className={`bi bi-${iconOf(r.h)}`} /><b>{m.val}</b><span>{r.name}</span>
          </button>, k.el, `wx-${r.name}`)
      })}
      <span className="wr-hint"><i className="bi bi-buildings me-1" />확대하고 기울이면 건물이 솟아올라요 (두 손가락 / 오른쪽 버튼 드래그)</span>
    </div>
  )
}
