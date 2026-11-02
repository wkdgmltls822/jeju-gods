import { GOD_COLORS } from '../data/gods'

// 신마다 하나씩 그려 둔 그림 카드 (SVG 일러스트). 신 이야기의 핵심 장면을 상징으로 담았습니다.
// 색은 --c(대표 빛깔)로 맞추고, 움직임은 theme.css 의 gart-* 애니메이션이 맡습니다.
const STARS = [[30, 24], [88, 50], [140, 18], [210, 36], [262, 14], [330, 40], [372, 22], [60, 96], [352, 98], [18, 140], [386, 150], [300, 72], [170, 64], [120, 112],
  [48, 60], [236, 62], [396, 70], [10, 80], [180, 12], [320, 12], [110, 36], [275, 40], [350, 128], [28, 118], [220, 100], [150, 92], [390, 110], [66, 14]]

// 네 갈래로 반짝이는 별
const spark = (x, y, r) => `M${x} ${y - r} Q${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} Q${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} Q${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} Q${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r}Z`

// 별과 별 사이를 선 대신 작은 별가루 점으로 잇는다
function Dotted({ pts, gap = 6, r = 1.1, o = 0.6 }) {
  const dots = []
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / gap))
    for (let k = 1; k < n; k++) dots.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n])
  }
  return <g>{dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o} />)}</g>
}

// 소용돌이치며 불어오는 바람 한 덩어리 (줄이 아니라 채워진 모양)
function Gust({ x, y, s = 1, rot = 0, d = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g className="gart-sway" style={{ animationDelay: `${d}s` }}>
        <path d="M-30 6 C-14 -16 22 -18 36 -2 C46 10 38 26 22 24 C34 16 32 6 22 4 C10 2 2 12 -10 10 C-18 8 -24 10 -30 6Z" fill="#fff" opacity=".5" />
        <path d="M-30 6 C-14 -10 16 -12 28 -2 C20 -4 8 -2 -4 4 C-14 9 -22 9 -30 6Z" fill="var(--c)" opacity=".55" />
        <circle cx="-34" cy="7" r="2" fill="#fff" opacity=".8" className="gart-pulse" />
      </g>
    </g>
  )
}

const SCENES = {
  // 한라산 위로 솟은 거인 여신: 은하수를 품은 치마폭에서 흙이 쏟아져 오름이 된다
  seolmundae: () => (
    <>
      <defs>
        <linearGradient id="gb-seol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--c)" stopOpacity=".7" /><stop offset="1" stopColor="var(--c)" stopOpacity=".05" />
        </linearGradient>
      </defs>
      <path d="M96 200 C100 118 140 76 200 66 C260 76 300 118 304 200Z" fill="url(#gb-seol)" className="gart-breathe" />
      <circle cx="200" cy="50" r="16" fill="var(--c)" opacity=".75" />
      <path d="M186 44 C150 58 138 112 146 160 M214 44 C250 58 262 112 254 160" stroke="var(--c)" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".45" className="gart-sway" />
      <path d="M160 112 Q118 140 100 176 M240 112 Q282 140 300 176" stroke="var(--c)" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".5" />
      <Dotted pts={[[176, 96], [196, 84], [218, 100], [206, 124], [186, 118]]} />
      {[[176, 96], [196, 84], [218, 100], [206, 124], [186, 118]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#fff" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} />)}
      <ellipse cx="130" cy="128" rx="48" ry="9" fill="#9bd3ff" opacity=".18" /><ellipse cx="276" cy="140" rx="44" ry="8" fill="#9bd3ff" opacity=".16" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={104 + i * 24} cy="172" r="2.2" fill="#fde68a" className="gart-fall" style={{ '--d': `${i * 0.35}s` }} />
      ))}
      <path d="M300 200 L316 168 Q340 162 364 168 L380 200Z" fill="#0f3a62" /><path d="M316 168 Q340 162 364 168" fill="none" stroke="var(--c)" strokeOpacity=".7" />
      <path d="M20 200 L160 124 Q200 108 240 124 L380 200Z" fill="#0b2a49" />
      <path d="M160 124 Q200 108 240 124 L228 134 Q200 126 172 134Z" fill="#e6f6ff" opacity=".85" />
      <ellipse cx="200" cy="130" rx="15" ry="4" fill="var(--c)" opacity=".9" className="gart-pulse" />
      {[[70, 190, 34], [140, 194, 24], [270, 192, 30], [340, 196, 22]].map(([x, y, r], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="#0e3358" /><path d={`M${x - r} ${y} Q${x} ${y - r * 0.6} ${x + r} ${y}`} stroke="var(--c)" strokeOpacity=".5" fill="none" /></g>
      ))}
    </>
  ),

  // 천지왕본풀이: 혼란한 세상에 내려온 하늘의 왕이 총명부인에게 박씨를 남기고, 그 박 덩굴이 하늘까지 닿는다
  cheonjiwang: () => (
    <>
      <defs>
        <linearGradient id="gb-gate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff7c2" stopOpacity=".95" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></linearGradient>
        <radialGradient id="gb-halo"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="var(--c)" stopOpacity=".7" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="250" cy="40" r="84" fill="url(#gb-halo)" className="gart-breathe" />
      <polygon points="238,36 262,36 340,200 164,200" fill="url(#gb-gate)" opacity=".5" className="gart-pulse" />
      <path d="M110 40 Q160 14 210 32 T330 28 T420 38 V70 H110Z" fill="#35348f" opacity=".92" />
      <path d="M140 64 Q200 40 250 58 T360 54 T420 62 V86 H140Z" fill="#46449f" opacity=".85" />
      <path d="M70 200 C34 156 112 136 92 96 C76 64 126 44 150 58" fill="none" stroke="#86d36b" strokeWidth="4" strokeLinecap="round" className="gart-sway" />
      {[[60, 168, -30], [100, 136, 40], [84, 98, -40], [130, 60, 30]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx="11" ry="5" fill="#a3e48a" transform={`rotate(${r} ${x} ${y})`} className="gart-pulse" style={{ '--d': `${i * 0.4}s` }} />)}
      {[[50, 186], [112, 112]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y + 6} r="10" fill="#fff0b0" /><circle cx={x} cy={y - 6} r="6" fill="#fff0b0" /><circle cx={x - 3} cy={y + 3} r="3" fill="#fff" opacity=".6" /></g>)}
      <g className="gart-float">
        <circle cx="250" cy="84" r="8" fill="#ffe9c2" />
        <path d="M236 78 q-12 -6 -14 -14 q10 2 18 8Z M264 78 q12 -6 14 -14 q-10 2 -18 8Z M241 78 L245 68 L250 74 L255 68 L259 78Z" fill="#ffd166" />
        <path d="M242 92 L258 92 L278 142 L222 142Z" fill="#ffcf5a" /><path d="M250 92 V142" stroke="#c9852b" />
        <path d="M244 96 L214 118 L222 126 L246 110Z M256 96 L286 118 L278 126 L254 110Z" fill="#ffe08a" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={282 + i * 5} cy="124" rx="2.2" ry="3.2" fill="#fff0b0" className="gart-fall" style={{ '--d': `${i * 0.45}s` }} />)}
      <path d="M0 200 V176 Q100 160 200 176 T400 172 V200Z" fill="#0b2a49" />
      <g><path d="M300 176 L336 150 L372 176Z" fill="#7a5a30" /><rect x="306" y="176" width="60" height="24" fill="#1a2748" /><rect x="326" y="180" width="16" height="14" fill="#ffcf85" className="gart-pulse" /></g>
    </>
  ),

  // 천지왕본풀이: 해와 달이 둘씩 떠 있던 세상, 대별왕이 활로 해 하나와 달 하나를 쏘아 떨어뜨린다
  daebyeol: () => (
    <>
      <defs>
        <radialGradient id="gb-sun1"><stop offset="0" stopColor="#fff6c9" /><stop offset=".4" stopColor="#ffd166" stopOpacity=".85" /><stop offset="1" stopColor="#ff9f5c" stopOpacity="0" /></radialGradient>
        <radialGradient id="gb-sun2"><stop offset="0" stopColor="#ffd9c2" /><stop offset=".4" stopColor="#ff6b4a" stopOpacity=".85" /><stop offset="1" stopColor="#ff3d3d" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="292" cy="54" r="64" fill="url(#gb-sun1)" className="gart-breathe" />
      <g className="gart-rays">{Array.from({ length: 12 }, (_, i) => <line key={i} x1="292" y1="14" x2="292" y2="4" stroke="#ffe9a8" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 30} 292 54)`} />)}</g>
      <circle cx="292" cy="54" r="22" fill="#fff4bf" />
      <circle cx="176" cy="44" r="46" fill="url(#gb-sun2)" className="gart-pulse" />
      <circle cx="176" cy="44" r="17" fill="#ffb199" />
      <path d="M176 44 C172 78 152 102 122 138 C140 106 152 78 160 52Z" fill="url(#gb-sun2)" opacity=".75" className="gart-pulse" />
      {[[150, 80], [138, 98], [128, 114]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#ffd166" className="gart-fall" style={{ '--d': `${i * 0.3}s` }} />)}
      <path d="M58 20 A18 18 0 1 0 80 44 A14 14 0 1 1 58 20Z" fill="#e7ecff" />
      <path d="M118 22 A12 12 0 1 0 134 38 A9 9 0 1 1 118 22Z" fill="#8b93c9" opacity=".5" />
      <path d="M95 135 L166 54 L171 58 L99 139Z" fill="#fff6c9" /><path d="M178 46 L162 52 L172 63Z" fill="#fff" />
      <path d="M95 135 L84 134 L91 125Z M99 139 L97 150 L88 143Z" fill="#fff" opacity=".9" />
      <path d="M100 106 Q142 136 100 168 Q124 136 100 106Z" fill="#c9852b" />
      <g fill="#0b1b33"><circle cx="86" cy="130" r="7" /><path d="M70 176 Q70 146 86 140 Q102 146 102 176Z" /><path d="M96 144 L112 134 L114 140 L100 152Z" /></g>
      <g fill="#0b1b33"><circle cx="330" cy="148" r="5" /><path d="M318 176 Q318 156 330 152 Q342 156 342 176Z" /></g>
      <path d="M0 176 Q60 168 120 176 T240 176 T360 176 T400 176 V200 H0Z" fill="#0b2748" />
      {[[210, 186], [260, 188]].map(([x, y], i) => (
        <g key={i}><rect x={x - 8} y={y - 8} width="16" height="12" rx="3" fill="#2a2150" /><path d={`M${x} ${y - 8} V${y - 22}`} stroke="#7ccf6b" strokeWidth="2" />{i === 0 && [-6, 0, 6].map((d) => <circle key={d} cx={x + d} cy={y - 24 + Math.abs(d) / 2} r="4" fill="#f9a8d4" className="gart-pulse" />)}{i === 1 && <circle cx={x} cy={y - 24} r="3" fill="#9aa4c9" />}</g>
      ))}
    </>
  ),

  // 탐라 건국 신화: 모흥혈 세 구멍에서 솟은 고·양·부, 바다 건너 온 나무 함 속의 세 공주와 오곡 씨앗
  samseong: () => (
    <>
      <defs>
        <linearGradient id="gb-col" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--c)" stopOpacity=".9" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></linearGradient>
        <linearGradient id="gb-dawnsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb58a" stopOpacity=".6" /><stop offset="1" stopColor="#0d4a78" /></linearGradient>
      </defs>
      <rect x="196" y="96" width="204" height="104" fill="url(#gb-dawnsea)" />
      <circle cx="320" cy="96" r="34" fill="#ffe3b0" opacity=".85" className="gart-breathe" />
      <path d="M0 200 V150 Q100 138 196 154 L196 200Z" fill="#0b2a49" />
      {[72, 112, 152].map((x, i) => (
        <g key={x}>
          <polygon points={`${x - 6},150 ${x + 6},150 ${x + 20},0 ${x - 20},0`} fill="url(#gb-col)" opacity=".55" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />
          <ellipse cx={x} cy="152" rx="17" ry="5" fill="#050f22" stroke="var(--c)" strokeWidth="1.5" />
          <g fill="#0b1b33"><circle cx={x} cy="124" r="6" /><path d={`M${x - 9} 150 Q${x - 9} 130 ${x} 128 Q${x + 9} 130 ${x + 9} 150Z`} /></g>
          <path d={`M${x - 9} 138 L${x + 9} 134`} stroke="#8a6a3b" strokeWidth="3" />
        </g>
      ))}
      {[[20, 112], [190, 120]].map(([x, y], i) => <g key={i} fill="#0b2a49"><path d={`M${x - 18} ${y + 30} L${x} ${y - 20} L${x + 18} ${y + 30}Z`} /><rect x={x - 2} y={y + 26} width="4" height="20" /></g>)}
      <path d="M196 150 Q246 142 296 150 T400 150 V200 H196Z" fill="#0d4a78" opacity=".9" />
      <path d="M196 168 Q246 160 296 168 T400 168 V200 H196Z" fill="#0a3560" className="gart-sway" />
      <g className="gart-sway">
        <rect x="268" y="138" width="56" height="26" rx="3" fill="#7a5a30" /><rect x="268" y="138" width="56" height="8" rx="3" fill="#a07a42" />
        <rect x="292" y="148" width="8" height="10" fill="#ffd166" className="gart-pulse" />
        <path d="M268 138 Q296 122 324 138" fill="none" stroke="var(--c)" strokeWidth="2" className="gart-pulse" />
        {[0, 1, 2].map((i) => <circle key={i} cx={278 + i * 18} cy="128" r="4" fill="#ffe9f2" />)}
      </g>
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={266 + i * 10} cy="130" r="1.8" fill="#ffe08a" className="gart-rise" style={{ '--d': `${i * 0.4}s` }} />)}
    </>
  ),

  // 송당본풀이: 송당 본향당의 늙은 신목(팽나무)에 지전을 걸고, 백주또의 자손 신들이 별처럼 퍼져 나간다
  baekjuddo: () => (
    <>
      <defs>
        <radialGradient id="gb-mom"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="var(--c)" stopOpacity=".8" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M0 200 V150 Q60 120 130 142 Q170 108 220 140 Q280 118 400 150 V200Z" fill="#0c2c4d" />
      <path d="M130 142 Q170 108 220 140" fill="none" stroke="var(--c)" strokeOpacity=".6" />
      {[[64, 30], [110, 18], [160, 34], [248, 20], [296, 34], [340, 24], [90, 62], [320, 66], [36, 78]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="9" fill="url(#gb-mom)" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} /><circle cx={x} cy={y} r="2.4" fill="#fff" /></g>
      ))}
      <circle cx="200" cy="40" r="30" fill="url(#gb-mom)" className="gart-breathe" />
      <path d="M200 22 q-9 8 -9 22 q9 -4 18 0 q0 -14 -9 -22Z" fill="#ffe9f2" /><circle cx="200" cy="26" r="6" fill="#fff" />
      <path d="M196 148 C190 128 182 112 160 106 M204 148 C210 128 218 112 240 106" stroke="#2a1e3a" strokeWidth="14" strokeLinecap="round" fill="none" />
      <rect x="192" y="110" width="16" height="92" fill="#2a1e3a" />
      {[[150, 100, 44], [196, 82, 52], [248, 100, 44], [174, 108, 36], [226, 110, 36]].map(([x, y, r], i) => (
        <g key={i}><circle cx={x} cy={y} r={r} fill="#0f3d4a" /><circle cx={x} cy={y} r={r} fill="none" stroke="var(--c)" strokeOpacity=".45" strokeWidth="2" /></g>
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 128 + i * 11
        const y0 = 112 + (i % 3) * 8, d = i % 2 ? 4 : -4
        return <path key={i} d={`M${x - 2.4} ${y0} Q${x - 2.4 + d} ${y0 + 14} ${x - 2.4} ${y0 + 26} L${x - 3} ${y0 + 40} L${x} ${y0 + 36} L${x + 3} ${y0 + 40} L${x + 2.4} ${y0 + 26} Q${x + 2.4 + d} ${y0 + 14} ${x + 2.4} ${y0}Z`} fill={i % 3 ? '#fff' : '#f9a8d4'} opacity=".92" className="gart-sway" style={{ animationDelay: `${i * 0.2}s` }} />
      })}
      <rect x="176" y="176" width="48" height="10" rx="2" fill="#3a3a5a" /><rect x="186" y="168" width="28" height="8" rx="2" fill="#4a4a6a" />
      <circle cx="200" cy="164" r="5" fill="#ffd166" className="gart-pulse" />
      <path d="M0 200 V188 Q100 178 200 188 T400 188 V200Z" fill="#071d36" />
    </>
  ),

  // 바람을 타고 제주에 들어와 바다에 씨를 뿌려 주는 영등할망: 휘날리는 머리와 옷자락, 동백꽃, 해녀의 바다
  yeongdeung: () => (
    <>
      <defs>
        <linearGradient id="gb-cloak" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="var(--c)" stopOpacity=".85" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gb-moonpath" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf6d8" stopOpacity=".55" /><stop offset="1" stopColor="#fdf6d8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="72" cy="38" r="40" fill="#fdf6d8" opacity=".14" className="gart-breathe" />
      <path d="M64 18 A20 20 0 1 0 92 48 A16 16 0 1 1 64 18Z" fill="#fdf6d8" />
      <path d="M-10 92 C60 60 120 120 190 78 C230 54 262 66 276 74 L268 92 C220 80 190 110 130 112 C70 114 30 100 -10 120Z" fill="url(#gb-cloak)" className="gart-sway" />
      <path d="M-10 62 C50 30 110 84 170 52 C206 34 240 44 262 62 L256 70 C220 56 190 74 150 76 C90 80 40 62 -10 82Z" fill="url(#gb-cloak)" opacity=".6" className="gart-sway" style={{ animationDirection: 'alternate-reverse' }} />
      <Gust x={60} y={52} s={1.5} rot={-8} /><Gust x={150} y={82} s={1.2} rot={6} d={0.8} /><Gust x={296} y={84} s={1.3} rot={12} d={0.4} />
      <Gust x={206} y={34} s={1.7} rot={0} d={1.6} /><Gust x={104} y={118} s={1.0} rot={-4} d={2.2} />
      <g>
        <circle cx="278" cy="66" r="9" fill="#ffe9f2" />
        <path d="M270 62 C250 58 226 72 206 60 C226 50 252 50 270 56Z" fill="#17206b" className="gart-sway" />
        <path d="M268 74 C262 96 258 112 252 126 C270 120 288 108 296 90 C298 80 292 72 284 72Z" fill="url(#gb-cloak)" />
        <path d="M290 84 C304 90 316 98 326 108" stroke="#ffe9f2" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={316 + (i % 4) * 8} cy="112" r={i % 2 ? 1.8 : 2.6} fill="#ffe9a8" className="gart-fall" style={{ '--d': `${i * 0.3}s` }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={120 + i * 22} cy={40 + (i * 23) % 70} rx="5" ry="2.6" fill={i % 2 ? '#fb7185' : '#f9a8d4'} className="gart-petal" style={{ '--d': `${i * 0.8}s`, '--y': `${(i % 3) * 14 - 10}px` }} />
      ))}
      <path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V200 H0Z" fill="#0d4a78" />
      <ellipse cx="200" cy="151" rx="200" ry="3.5" fill="#bfe6ff" opacity=".22" />
      <path d="M0 168 Q50 158 100 168 T200 168 T300 168 T400 168 V200 H0Z" fill="#0a3560" className="gart-sway" />
      <ellipse cx="200" cy="169" rx="200" ry="3" fill="#bfe6ff" opacity=".16" className="gart-sway" />
      <path d="M0 186 Q50 178 100 186 T200 186 T300 186 T400 186 V200 H0Z" fill="#062648" className="gart-sway" style={{ animationDirection: 'alternate-reverse' }} />
      {[[40, 190], [232, 192]].map(([x, y], i) => (
        <g key={i}><path d={`M${x - 9} ${y} q-2 -12 10 -12 q10 2 8 12 q-4 6 -10 4 q-6 -2 -3 -8 q4 -3 6 1`} fill="#ffd9c2" stroke="#ff9f7a" /><path d={`M${x - 9} ${y} q-6 2 -4 6 q6 3 12 0`} fill="#ffb59a" /></g>
      ))}
      {[[170, 198], [190, 198], [300, 198]].map(([x, y], i) => <path key={i} d={`M${x} ${y} C${x - 9} ${y - 8} ${x - 7} ${y - 22} ${x} ${y - 34} C${x + 5} ${y - 22} ${x + 9} ${y - 8} ${x} ${y}Z`} fill="#1f9d6b" opacity=".85" className="gart-sway" style={{ animationDelay: `${i * 0.5}s` }} />)}
      <g className="gart-sway">
        <circle cx="96" cy="158" r="9" fill="#ff8a5c" /><path d="M88 156 q8 6 16 0 M90 162 q6 4 12 0" stroke="#7a2f14" fill="none" />
        <circle cx="116" cy="162" r="4.5" fill="#050f22" /><path d="M110 168 q6 -5 12 0" fill="#050f22" />
      </g>
      <path d="M340 200 L346 168 L362 160 L378 170 L400 166 V200Z" fill="#050f22" />
      {[[352, 164], [366, 158], [384, 166]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="5" fill="#fb3a5e" /><circle cx={x} cy={y} r="2" fill="#ffd166" /></g>
      ))}
    </>
  ),

  // 세경본풀이: 문도령을 살리려 서천꽃밭에서 환생꽃을 얻고, 오곡의 씨앗을 세상에 퍼뜨린 농경의 여신
  jacheongbi: () => (
    <>
      <defs>
        <radialGradient id="gb-flower"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="#ffc2e0" stopOpacity=".9" /><stop offset="1" stopColor="#ff7ab8" stopOpacity="0" /></radialGradient>
        <radialGradient id="gb-gold"><stop offset="0" stopColor="#fff6c9" /><stop offset="1" stopColor="#ffd166" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="300" cy="44" r="52" fill="url(#gb-gold)" className="gart-breathe" />
      <path d="M0 54 Q60 34 120 50 T250 46 T400 50 V76 H0Z" fill="#46449f" opacity=".7" />
      <path d="M0 200 V150 Q200 128 400 150 V200Z" fill="#14483a" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 20 + i * 44, h = 36 + (i % 3) * 10
        return <g key={i} className="gart-stalk" style={{ '--d': `${i * 0.25}s` }}><line x1={x} y1="172" x2={x} y2={172 - h} stroke="#c9d66b" strokeWidth="2.4" strokeLinecap="round" /><ellipse cx={x} cy={172 - h} rx="2.8" ry="7" fill="#ffd166" /><ellipse cx={x - 4} cy={172 - h + 8} rx="2.4" ry="5.5" fill="#ffe08a" transform={`rotate(-24 ${x - 4} ${172 - h + 8})`} /></g>
      })}
      {[[70, 150, 15], [330, 146, 17], [120, 170, 11], [284, 168, 13], [40, 176, 9]].map(([x, y, r], i) => (
        <g key={i} className="gart-pulse" style={{ '--d': `${i * 0.35}s` }}>
          <circle cx={x} cy={y} r={r * 1.9} fill="url(#gb-flower)" />
          {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx={x} cy={y - r * 0.62} rx={r * 0.3} ry={r * 0.62} fill={i % 2 ? '#ffb3d9' : '#c4b5fd'} transform={`rotate(${k * 45} ${x} ${y})`} />)}
          <circle cx={x} cy={y} r={r * 0.28} fill="#fff6c9" />
        </g>
      ))}
      <g>
        <path d="M200 70 C176 78 174 120 182 148 M200 70 C228 78 232 114 226 140" stroke="#1a1445" strokeWidth="9" strokeLinecap="round" fill="none" className="gart-sway" />
        <circle cx="200" cy="64" r="11" fill="#ffe9d0" />
        <path d="M189 62 C190 50 210 50 211 62 C206 56 194 56 189 62Z" fill="#1a1445" />
        <path d="M192 76 L208 76 L214 98 L186 98Z" fill="#ff6f91" />
        <path d="M186 98 L214 98 L232 160 L168 160Z" fill="#7dd3fc" /><path d="M186 98 H214" stroke="#fff" strokeWidth="2" />
        <path d="M212 82 L240 98 L236 106 L208 92Z" fill="#ff6f91" />
        <circle cx="242" cy="98" r="9" fill="url(#gb-flower)" className="gart-pulse" /><circle cx="242" cy="98" r="3.4" fill="#fff" />
      </g>
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={150 + i * 20} cy="140" r="1.8" fill="#fff6c9" className="gart-rise" style={{ '--d': `${i * 0.5}s` }} />)}
    </>
  ),

  // 문전본풀이: 제주 집의 정낭(나무 막대 대문)과 정주석, 집 문을 지키는 막내 녹디생이, 일곱 아들 별
  munjeon: () => (
    <>
      <defs>
        <radialGradient id="gb-warm"><stop offset="0" stopColor="#ffe3a8" stopOpacity=".95" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      {[[96, 24], [118, 18], [140, 26], [162, 16], [184, 24], [206, 16], [228, 22]].map(([x, y], i) => (
        <g key={i}><circle cx={x + 40} cy={y + 8} r="7" fill="url(#gb-warm)" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} /><path d={spark(x + 40, y + 8, 4)} fill="#fff" /></g>
      ))}
      <circle cx="200" cy="128" r="100" fill="url(#gb-warm)" opacity=".5" className="gart-breathe" />
      <path d="M92 104 L200 52 L308 104 L298 110 L200 66 L102 110Z" fill="#6b5030" /><path d="M102 110 L200 66 L298 110 L288 118 L200 80 L112 118Z" fill="#3a2b17" />
      <rect x="120" y="116" width="160" height="62" fill="#1a2748" />
      <rect x="170" y="124" width="60" height="54" rx="3" fill="#ffcf85" className="gart-pulse" />
      <path d="M200 124 V178 M170 150 H230" stroke="#5a3d1a" strokeWidth="3" />
      <rect x="132" y="126" width="22" height="18" fill="#ffcf85" opacity=".75" className="gart-pulse" style={{ '--d': '.6s' }} />
      {[[0, 170, 52], [52, 176, 44], [300, 172, 48], [350, 174, 50]].map(([x, y, w], i) => (
        <g key={i} fill="#0e1b33"><rect x={x} y={y} width={w} height={32} rx="3" />{[0, 1, 2].map((k) => <ellipse key={k} cx={x + 8 + k * (w / 3)} cy={y + 8 + (k % 2) * 8} rx="7" ry="5" fill="#16264a" />)}</g>
      ))}
      <rect x="100" y="150" width="14" height="52" rx="3" fill="#2b2b3d" /><rect x="286" y="150" width="14" height="52" rx="3" fill="#2b2b3d" />
      {[158, 170, 194].map((y) => <rect key={y} x="98" y={y} width="204" height="5" rx="2" fill="#8a6a3b" />)}
      <g fill="#0b1b33"><circle cx="248" cy="168" r="5" /><path d="M240 196 Q240 176 248 174 Q256 176 256 196Z" /></g>
      <circle cx="262" cy="182" r="7" fill="#ffd166" className="gart-pulse" /><line x1="256" y1="178" x2="256" y2="184" stroke="#8a6a3b" />
      {[[60, 70], [330, 80], [350, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#ffe08a" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />)}
    </>
  ),

  // 문전본풀이: 부엌 솥덕(돌 세 개 아궁이)과 가마솥, 정화수, 불을 돌보는 조왕할망
  jowang: () => (
    <>
      <defs>
        <radialGradient id="gb-fire"><stop offset="0" stopColor="#fff3b0" stopOpacity=".95" /><stop offset=".5" stopColor="var(--c)" stopOpacity=".5" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="200" fill="#1a0f22" opacity=".5" />
      <rect x="40" y="30" width="60" height="50" rx="3" fill="#0f1a33" stroke="#4a3820" strokeWidth="4" /><path d="M70 30 V80 M40 55 H100" stroke="#4a3820" strokeWidth="2" />
      <circle cx="160" cy="146" r="110" fill="url(#gb-fire)" className="gart-breathe" />
      <path d="M118 120 Q160 86 202 120 L196 142 H124Z" fill="#111827" /><ellipse cx="160" cy="120" rx="42" ry="7" fill="#1f2937" />
      <path d="M130 114 Q160 106 190 114" stroke="#fff" strokeOpacity=".25" fill="none" />
      {[0, 1, 2].map((i) => <g key={i} className="gart-rise" style={{ '--d': `${i * 0.8}s` }}><circle cx={142 + i * 18} cy="96" r="7" fill="#e5e7eb" opacity=".24" /><circle cx={148 + i * 18} cy="88" r="5.5" fill="#e5e7eb" opacity=".2" /></g>)}
      <path d="M160 94 C184 120 198 134 194 156 C191 172 178 180 160 180 C142 180 129 172 126 156 C122 134 138 124 160 94Z" fill="var(--c)" className="gart-flame" />
      <path d="M160 122 C172 140 180 150 177 164 C175 174 168 178 160 178 C152 178 145 174 143 164 C140 150 148 140 160 122Z" fill="#ffd166" className="gart-flame" style={{ '--d': '.25s' }} />
      <path d="M160 150 C166 158 169 164 167 172 C166 176 163 178 160 178 C157 178 154 176 153 172 C151 164 154 158 160 150Z" fill="#fff6c9" className="gart-flame" style={{ '--d': '.5s' }} />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={130 + i * 10} cy="140" r={i % 2 ? 1.6 : 2.2} fill="#ffd166" className="gart-rise" style={{ '--d': `${i * 0.42}s` }} />)}
      {[[112, 176, 40], [148, 180, 40], [184, 176, 40]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height="22" rx="8" fill="#26334f" />)}
      <g fill="#0b1b33">
        <circle cx="282" cy="132" r="9" /><circle cx="282" cy="120" r="5" /><path d="M262 188 Q258 152 282 142 Q306 152 302 188Z" />
        <path d="M268 156 L228 168 L230 174 L270 164Z" />
      </g>
      <path d="M226 170 L206 176" stroke="#6b4a2b" strokeWidth="3" strokeLinecap="round" />
      <rect x="318" y="118" width="40" height="8" fill="#4a3820" /><ellipse cx="338" cy="112" rx="13" ry="5" fill="#f1f5f9" /><ellipse cx="338" cy="110" rx="10" ry="3" fill="#bfe6ff" className="gart-pulse" />
    </>
  ),

  // 칠성본풀이: 곡식 항아리(고팡)를 지키며 재물과 풍요를 부르는 뱀신. 일곱 별과 금빛 곡식
  chilseong: () => (
    <>
      <defs>
        <radialGradient id="gb-moon"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="var(--c)" stopOpacity=".35" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
        <linearGradient id="gb-jar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2f86" /><stop offset=".4" stopColor="#6a5cc4" /><stop offset="1" stopColor="#2a2060" /></linearGradient>
      </defs>
      <Dotted pts={[[40, 34], [84, 48], [128, 42], [164, 62], [178, 92], [226, 94], [262, 66]]} gap={7} r={1.3} o={0.7} />
      {[[40, 34], [84, 48], [128, 42], [164, 62], [178, 92], [226, 94], [262, 66]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="10" fill="url(#gb-moon)" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} /><path d={spark(x, y, 7)} fill="#fff" /></g>
      ))}
      <circle cx="330" cy="50" r="46" fill="url(#gb-moon)" className="gart-breathe" /><circle cx="330" cy="50" r="14" fill="#f1ecff" />
      <path d="M60 200 V152 Q60 130 84 126 H104 Q128 130 128 152 V200Z" fill="url(#gb-jar)" />
      <path d="M272 200 V156 Q272 136 294 132 H312 Q334 136 334 156 V200Z" fill="url(#gb-jar)" />
      <ellipse cx="94" cy="126" rx="22" ry="5" fill="#120d2b" /><ellipse cx="303" cy="132" rx="20" ry="5" fill="#120d2b" />
      <path d="M130 200 V140 Q128 112 166 106 H234 Q272 112 270 140 V200Z" fill="url(#gb-jar)" />
      <path d="M144 196 V144 Q144 124 172 118" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="200" cy="106" rx="36" ry="8" fill="#120d2b" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={178 + i * 6} cy="100" r="2.4" fill="#ffd166" className="gart-rise" style={{ '--d': `${i * 0.35}s` }} />)}
      <path d="M134 190 C124 168 276 172 268 148 C260 128 140 134 140 116 C140 104 180 98 214 104" fill="none" stroke="#120d2b" strokeWidth="18" strokeLinecap="round" opacity=".75" />
      <path d="M134 190 C124 168 276 172 268 148 C260 128 140 134 140 116 C140 104 180 98 214 104" fill="none" stroke="var(--c)" strokeWidth="12" strokeLinecap="round" strokeDasharray="14 5" className="gart-snake" />
      <path d="M134 190 C124 168 276 172 268 148 C260 128 140 134 140 116 C140 104 180 98 214 104" fill="none" stroke="#ffd166" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 17" />
      <ellipse cx="228" cy="102" rx="11" ry="8" fill="var(--c)" /><circle cx="231" cy="99" r="2.2" fill="#ffe08a" />
      <path d="M238 104 l10 3 m-10 -3 l9 -4" stroke="#ff6f91" strokeWidth="1.5" strokeLinecap="round" className="gart-pulse" />
      {[[40, 190], [52, 196], [350, 192], [362, 188], [372, 196]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="3.5" fill="#ffd166" />)}
      <path d="M0 200 V186 Q100 176 200 186 T400 186 V200Z" fill="#0b1633" />
    </>
  ),
}

export default function GodArt({ id, className = '' }) {
  const Scene = SCENES[id]
  return (
    <svg className={`god-art ${className}`} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ '--c': GOD_COLORS[id] ?? '#7dd3fc' }}>
      <defs>
        <linearGradient id="gb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070e33" />
          <stop offset=".55" stopColor="#1b1a63" />
          <stop offset="1" stopColor="#0f4468" />
        </linearGradient>
        <radialGradient id="gb-neb-a" cx="18%" cy="30%" r="50%"><stop offset="0" stopColor="var(--c)" stopOpacity=".38" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
        <radialGradient id="gb-neb-b" cx="88%" cy="65%" r="45%"><stop offset="0" stopColor="#a78bfa" stopOpacity=".32" /><stop offset="1" stopColor="#a78bfa" stopOpacity="0" /></radialGradient>
        <linearGradient id="gb-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id="gb-vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#020617" stopOpacity=".55" /></radialGradient>
      </defs>
      <rect width="400" height="200" fill="url(#gb-sky)" />
      <rect width="400" height="200" fill="url(#gb-neb-a)" />
      <rect width="400" height="200" fill="url(#gb-neb-b)" />
      {STARS.map(([x, y], i) => (
        i % 7 === 0
          ? <path key={i} d={spark(x, y, 3.4)} fill="#fff" className="gart-twinkle" style={{ '--d': `${(i % 6) * 0.5}s` }} />
          : <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 0.9} fill="#fff" className="gart-twinkle" style={{ '--d': `${(i % 6) * 0.5}s` }} />
      ))}
      {Scene && <Scene />}
      <rect width="400" height="200" fill="url(#gb-vig)" />
      <rect x="-140" width="120" height="200" fill="url(#gb-sweep)" className="gart-sweep" />
    </svg>
  )
}
