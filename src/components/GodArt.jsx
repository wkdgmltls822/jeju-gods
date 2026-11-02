import { GOD_COLORS } from '../data/gods'
// 신마다 하나씩 그려 둔 그림 카드 (SVG 일러스트). 신 이야기의 핵심 장면을 상징으로 담았습니다.
// 색은 --c(대표 빛깔)로 맞추고, 움직임은 theme.css 의 gart-* 애니메이션이 맡습니다.
const STARS = [[30, 24], [88, 50], [140, 18], [210, 36], [262, 14], [330, 40], [372, 22], [60, 96], [352, 98], [18, 140], [386, 150], [300, 72], [170, 64], [120, 112]]


const SCENES = {
  // 한라산을 베고 누운 거인 여신, 치마에서 흘러내리는 흙이 오름이 된다
  seolmundae: () => (
    <>
      <path d="M130 170 Q140 70 200 60 Q260 70 270 170Z" fill="var(--c)" opacity=".16" className="gart-breathe" />
      <circle cx="200" cy="50" r="15" fill="var(--c)" opacity=".28" className="gart-breathe" />
      <path d="M40 190 L165 96 Q200 84 235 96 L360 190Z" fill="#0e2742" />
      <path d="M165 96 Q200 84 235 96 L225 104 Q200 98 175 104Z" fill="var(--c)" opacity=".45" />
      <ellipse cx="200" cy="100" rx="16" ry="4" fill="#06202e" />
      {[[90, 176, 26], [130, 180, 18], [290, 178, 22], [330, 182, 16]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill="#133556" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={165 + i * 14} cy="120" r="2.2" fill="var(--c)" className="gart-fall" style={{ '--d': `${i * 0.45}s` }} />
      ))}
    </>
  ),
  // 하늘이 열리고 빛줄기를 타고 내려오는 하늘의 왕
  cheonjiwang: () => (
    <>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--c)" stopOpacity=".85" />
          <stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="190,36 210,36 280,190 120,190" fill="url(#beam)" className="gart-pulse" />
      {[[110, 40, 46], [200, 26, 56], [290, 42, 44]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.32} fill="#1b3a5c" />
      ))}
      <path d="M200 10 L205 30 L225 35 L205 40 L200 60 L195 40 L175 35 L195 30Z" fill="#fff" className="gart-pulse" />
      <path d="M0 190 Q100 172 200 182 T400 176 V200 H0Z" fill="#0e2742" />
      <path d="M318 182 l0 -22 M318 172 l-9 -9 M318 168 l9 -8" stroke="#133556" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // 해와 달을 둘씩 달고 있던 세상: 밝은 이승(해)과 어두운 저승(달)을 나눠 다스림
  daebyeol: () => (
    <>
      <g className="gart-rays">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="110" y1="38" x2="110" y2="28" stroke="var(--c)" strokeWidth="3" strokeLinecap="round"
            transform={`rotate(${i * 30} 110 76)`} />
        ))}
      </g>
      <circle cx="110" cy="76" r="26" fill="#fde68a" />
      <circle cx="292" cy="76" r="24" fill="#cbd5e1" />
      <circle cx="302" cy="70" r="20" fill="#0b1b2e" />
      <line x1="200" y1="20" x2="200" y2="150" stroke="var(--c)" strokeOpacity=".45" strokeDasharray="4 5" />
      <path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V200 H0Z" fill="#0e2742" />
      <path d="M0 168 Q50 158 100 168 T200 168 T300 168 T400 168 V200 H0Z" fill="#12335a" className="gart-sway" />
    </>
  ),
  // 삼성혈 세 구멍에서 솟아오르는 세 줄기 빛
  samseong: () => (
    <>
      <defs>
        <linearGradient id="beam3" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--c)" stopOpacity=".8" />
          <stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[110, 200, 290].map((x, i) => (
        <g key={x}>
          <rect x={x - 12} y="20" width="24" height="136" fill="url(#beam3)" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />
          <circle cx={x} cy="150" r="2.4" fill="#fff" className="gart-rise" style={{ '--d': `${i * 0.7}s` }} />
        </g>
      ))}
      <path d="M0 156 Q200 140 400 156 V200 H0Z" fill="#0e2742" />
      {[110, 200, 290].map((x) => (
        <ellipse key={x} cx={x} cy="158" rx="20" ry="5" fill="#06202e" stroke="var(--c)" strokeOpacity=".7" />
      ))}
    </>
  ),
  // 송당 오름 위의 어머니 신과, 가지처럼 퍼져 나간 자손 신들
  baekjuddo: () => (
    <>
      {[[90, 120], [150, 130], [250, 130], [310, 120], [200, 138]].map(([x, y], i) => (
        <g key={i}>
          <line x1="200" y1="52" x2={x} y2={y} stroke="var(--c)" strokeOpacity=".5" />
          <circle cx={x} cy={y} r="5" fill="var(--c)" className="gart-pulse" style={{ '--d': `${i * 0.4}s` }} />
        </g>
      ))}
      <circle cx="200" cy="52" r="20" fill="var(--c)" opacity=".25" className="gart-breathe" />
      <circle cx="200" cy="52" r="9" fill="#fff" />
      <path d="M20 190 Q110 150 200 156 Q290 150 380 190Z" fill="#0e2742" />
      <path d="M150 168 Q200 150 250 168" fill="none" stroke="var(--c)" strokeOpacity=".4" />
    </>
  ),
  // 바람을 타고 들어와 해녀의 바다에 씨를 뿌리는 여신
  yeongdeung: () => (
    <>
      {[[30, 52, 0], [60, 92, 0.8], [20, 130, 1.6]].map(([y0, y1, d], i) => (
        <path key={i} d={`M-10 ${y1} C70 ${y0 - 20} 130 ${y1 + 30} 210 ${y1 - 6} S350 ${y0 + 10} 410 ${y1}`} fill="none"
          stroke="var(--c)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity=".75" strokeDasharray="60 40" className="gart-wind" style={{ '--d': `${d}s` }} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={40 + i * 8} cy={60 + i * 22} rx="4" ry="2" fill="#f9a8d4" className="gart-petal" style={{ '--d': `${i * 0.7}s`, '--y': `${i * 6}px` }} />
      ))}
      <path d="M0 160 Q50 148 100 160 T200 160 T300 160 T400 160 V200 H0Z" fill="#0e2742" />
      <path d="M0 176 Q50 166 100 176 T200 176 T300 176 T400 176 V200 H0Z" fill="#12335a" className="gart-sway" />
    </>
  ),
  // 오곡의 씨앗으로 퍼진 농사: 햇빛 아래 익어 가는 이삭
  jacheongbi: () => (
    <>
      <circle cx="320" cy="48" r="22" fill="#fde68a" className="gart-breathe" />
      <circle cx="320" cy="48" r="34" fill="#fde68a" opacity=".15" className="gart-breathe" />
      <path d="M0 160 Q200 140 400 160 V200 H0Z" fill="#0e2742" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 40 + i * 40, h = 54 + (i % 3) * 14
        return (
          <g key={i} className="gart-stalk" style={{ '--d': `${i * 0.25}s` }}>
            <line x1={x} y1="162" x2={x} y2={162 - h} stroke="var(--c)" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx={x - 4} cy={162 - h + 6} rx="3" ry="6" fill="#fde68a" transform={`rotate(-25 ${x - 4} ${162 - h + 6})`} />
            <ellipse cx={x + 4} cy={162 - h + 4} rx="3" ry="6" fill="#fde68a" transform={`rotate(25 ${x + 4} ${162 - h + 4})`} />
            <ellipse cx={x} cy={162 - h - 2} rx="3" ry="7" fill="#fde68a" />
          </g>
        )
      })}
    </>
  ),
  // 집 문 앞에서 가족을 지키는 신: 따뜻한 불빛이 새어 나오는 문
  munjeon: () => (
    <>
      <polygon points="168,190 232,190 300,200 100,200" fill="var(--c)" opacity=".25" className="gart-pulse" />
      <path d="M96 76 L200 28 L304 76 L292 82 L200 44 L108 82Z" fill="#1b3a5c" />
      <rect x="120" y="82" width="160" height="108" fill="#0e2742" />
      <rect x="168" y="100" width="64" height="90" rx="3" fill="var(--c)" opacity=".85" className="gart-pulse" />
      <line x1="200" y1="100" x2="200" y2="190" stroke="#06202e" strokeWidth="2" />
      <rect x="160" y="94" width="6" height="96" fill="#1b3a5c" />
      <rect x="234" y="94" width="6" height="96" fill="#1b3a5c" />
      <rect x="156" y="88" width="88" height="8" rx="2" fill="#1b3a5c" />
    </>
  ),
  // 부엌 아궁이의 불을 지키는 할망
  jowang: () => (
    <>
      <ellipse cx="200" cy="150" rx="70" ry="30" fill="var(--c)" opacity=".18" className="gart-breathe" />
      <path d="M200 40 C226 80 244 98 238 128 C234 148 218 156 200 156 C182 156 166 148 162 128 C156 98 178 84 200 40Z" fill="var(--c)" className="gart-flame" />
      <path d="M200 78 C214 100 222 112 218 130 C215 144 208 150 200 150 C192 150 185 144 182 130 C178 112 190 102 200 78Z" fill="#fde68a" className="gart-flame" style={{ '--d': '.2s' }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={170 + i * 15} cy="110" r="1.8" fill="#fde68a" className="gart-rise" style={{ '--d': `${i * 0.5}s` }} />
      ))}
      <rect x="120" y="156" width="160" height="34" rx="4" fill="#0e2742" />
      <rect x="140" y="146" width="36" height="14" rx="5" fill="#133556" />
      <rect x="224" y="146" width="36" height="14" rx="5" fill="#133556" />
    </>
  ),
  // 일곱 별(북두칠성) 아래 똬리를 튼 뱀
  chilseong: () => (
    <>
      <polyline points="70,34 110,46 150,40 188,58 200,86 250,92 290,64" fill="none" stroke="var(--c)" strokeOpacity=".5" />
      {[[70, 34], [110, 46], [150, 40], [188, 58], [200, 86], [250, 92], [290, 64]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="#fff" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} />
      ))}
      <path d="M70 176 C130 176 140 140 200 146 C270 152 300 120 262 104 C226 90 190 112 220 126" fill="none" stroke="var(--c)" strokeWidth="14" strokeLinecap="round" strokeDasharray="16 5" className="gart-snake" />
      <circle cx="220" cy="126" r="9" fill="var(--c)" />
      <circle cx="223" cy="123" r="2" fill="#06202e" />
      <path d="M0 184 Q200 172 400 184 V200 H0Z" fill="#0e2742" />
    </>
  ),
}

export default function GodArt({ id, className = '' }) {
  const Scene = SCENES[id]
  return (
    <svg className={`god-art ${className}`} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ '--c': GOD_COLORS[id] ?? '#7dd3fc' }}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1a2e" />
          <stop offset="1" stopColor="#173b63" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#sky-${id})`} />
      {STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" className="gart-twinkle" style={{ '--d': `${(i % 6) * 0.5}s` }} />
      ))}
      {Scene && <Scene />}
    </svg>
  )
}
