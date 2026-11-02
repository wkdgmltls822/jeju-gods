import GodArt from './GodArt'

// 신 그림의 가운데를 동그랗게 오려 낸 작은 얼굴(프로필) 그림
export default function GodAvatar({ id, size = 40, active = false }) {
  return (
    <span className={`god-avatar ${active ? 'active' : ''}`} style={{ '--s': `${size}px` }}>
      <GodArt id={id} />
    </span>
  )
}
