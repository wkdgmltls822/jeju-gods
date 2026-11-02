import { GOD_COLORS } from '../data/gods'

// 신마다 하나씩 그려 둔 그림 카드 (SVG 일러스트). 신 이야기의 핵심 장면을 상징으로 담았습니다.
// 색은 --c(대표 빛깔)로 맞추고, 움직임은 theme.css 의 gart-* 애니메이션이 맡습니다.
const STARS = [[30, 24], [88, 50], [140, 18], [210, 36], [262, 14], [330, 40], [372, 22], [60, 96], [352, 98], [18, 140], [386, 150], [300, 72], [170, 64], [120, 112],
  [48, 60], [236, 62], [396, 70], [10, 80], [180, 12], [320, 12], [110, 36], [275, 40], [350, 128], [28, 118], [220, 100], [150, 92], [390, 110], [66, 14]]

// 네 갈래로 반짝이는 별
const spark = (x, y, r) => `M${x} ${y - r} Q${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} Q${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} Q${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} Q${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r}Z`

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
      <polyline points="176,96 196,84 218,100 206,124 186,118" fill="none" stroke="#fff" strokeOpacity=".5" />
      {[[176, 96], [196, 84], [218, 100], [206, 124], [186, 118]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#fff" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} />)}
      <ellipse cx="130" cy="128" rx="48" ry="9" fill="#9bd3ff" opacity=".18" /><ellipse cx="276" cy="140" rx="44" ry="8" fill="#9bd3ff" opacity=".16" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={104 + i * 24} cy="172" r="2.2" fill="#fde68a" className="gart-fall" style={{ '--d': `${i * 0.35}s` }} />
      ))}
      <path d="M20 200 L160 124 Q200 108 240 124 L380 200Z" fill="#0b2a49" />
      <path d="M160 124 Q200 108 240 124 L228 134 Q200 126 172 134Z" fill="#e6f6ff" opacity=".85" />
      <ellipse cx="200" cy="130" rx="15" ry="4" fill="var(--c)" opacity=".9" className="gart-pulse" />
      {[[70, 190, 34], [140, 194, 24], [270, 192, 30], [340, 196, 22]].map(([x, y, r], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="#0e3358" /><path d={`M${x - r} ${y} Q${x} ${y - r * 0.6} ${x + r} ${y}`} stroke="var(--c)" strokeOpacity=".5" fill="none" /></g>
      ))}
    </>
  ),

  // 하늘 문이 열리고 빛줄기를 타고 내려오는 하늘의 왕
  cheonjiwang: () => (
    <>
      <defs>
        <linearGradient id="gb-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7c2" stopOpacity=".9" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="gb-sun"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="var(--c)" stopOpacity=".7" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="200" cy="40" r="70" fill="url(#gb-sun)" className="gart-breathe" />
      <g className="gart-rot" style={{ transformOrigin: '200px 40px', transformBox: 'view-box' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <polygon key={i} points="196,40 204,40 232,200 168,200" fill="url(#gb-ray)" opacity=".5" transform={`rotate(${-80 + i * 20} 200 40)`} />
        ))}
      </g>
      <path d="M0 52 Q40 30 90 46 T190 40 T300 46 T400 36 V70 H0Z" fill="#2b2f86" opacity=".9" />
      <path d="M0 66 Q60 48 120 62 T240 58 T340 62 T400 56 V86 H0Z" fill="#3a3aa0" opacity=".8" />
      <path d={spark(200, 38, 22)} fill="#fff" className="gart-pulse" />
      <path d="M186 58 L200 70 L214 58 L210 74 L190 74Z" fill="#fff7c2" opacity=".9" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={150 + i * 9} cy="150" r="1.6" fill="#fff7c2" className="gart-rise" style={{ '--d': `${i * 0.28}s` }} />
      ))}
      <path d="M0 200 V172 Q80 150 150 168 Q200 156 250 168 Q320 150 400 172 V200Z" fill="#0b2a49" />
      <path d="M130 168 Q200 150 270 168" fill="none" stroke="var(--c)" strokeOpacity=".6" />
      <path d="M318 176 l0 -20 M318 166 l-8 -8 M318 162 l8 -7" stroke="#133556" strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  // 해 둘 달 둘이던 세상: 낮의 이승(해)과 밤의 저승(달)을 두 형제가 나눠 다스림
  daebyeol: () => (
    <>
      <defs>
        <clipPath id="gb-left"><polygon points="0,0 214,0 186,200 0,200" /></clipPath>
        <clipPath id="gb-right"><polygon points="214,0 400,0 400,200 186,200" /></clipPath>
        <radialGradient id="gb-day"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#ffd27d" /><stop offset="1" stopColor="#ffb35c" stopOpacity="0" /></radialGradient>
      </defs>
      <g clipPath="url(#gb-left)">
        <rect width="400" height="200" fill="#c2527a" />
        <rect y="90" width="400" height="110" fill="#e48a5d" opacity=".55" />
        <circle cx="104" cy="82" r="70" fill="url(#gb-day)" className="gart-breathe" />
        <g className="gart-rays">{Array.from({ length: 14 }, (_, i) => <line key={i} x1="104" y1="30" x2="104" y2="18" stroke="#ffe1a0" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * (360 / 14)} 104 82)`} />)}</g>
        <circle cx="104" cy="82" r="26" fill="#fff2c4" />
      </g>
      <g clipPath="url(#gb-right)">
        <rect width="400" height="200" fill="#0a1240" />
        {[[250, 30], [300, 60], [350, 24], [380, 90], [270, 100], [330, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" className="gart-twinkle" style={{ '--d': `${i * 0.4}s` }} />)}
        <circle cx="296" cy="78" r="46" fill="#a5b4fc" opacity=".18" className="gart-breathe" />
        <circle cx="296" cy="78" r="24" fill="#e7ecff" />
        <circle cx="306" cy="72" r="21" fill="#0a1240" />
      </g>
      <line x1="214" y1="0" x2="186" y2="200" stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" className="gart-pulse" />
      <path d="M0 150 Q50 140 100 150 T200 150 T300 150 T400 150 V200 H0Z" fill="#12335a" opacity=".9" />
      <path d="M0 170 Q50 160 100 170 T200 170 T300 170 T400 170 V200 H0Z" fill="#0b2748" className="gart-sway" />
      <g fill="#0b1b33"><circle cx="104" cy="130" r="5" /><path d="M96 152 L104 136 L112 152Z" /><circle cx="296" cy="130" r="5" /><path d="M288 152 L296 136 L304 152Z" /></g>
    </>
  ),

  // 삼성혈 세 구멍에서 솟아오른 세 신인: 솔숲 사이로 세 줄기 빛
  samseong: () => (
    <>
      <defs>
        <linearGradient id="gb-col" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--c)" stopOpacity=".95" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => {
        const x = 110 + i * 90
        return (
          <g key={x}>
            <polygon points={`${x - 9},158 ${x + 9},158 ${x + 32},-4 ${x - 32},-4`} fill="url(#gb-col)" opacity=".55" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />
            <polygon points={`${x - 4},158 ${x + 4},158 ${x + 10},10 ${x - 10},10`} fill="#fff" opacity=".7" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={x - 9 + k * 6} cy="150" r="1.8" fill="#fff" className="gart-rise" style={{ '--d': `${i * 0.4 + k * 0.6}s` }} />)}
          </g>
        )
      })}
      {[[18, 120], [60, 130], [340, 124], [384, 132]].map(([x, y], i) => (
        <g key={i} fill="#0b2a49"><path d={`M${x - 20} ${y + 6} L${x} ${y - 42} L${x + 20} ${y + 6}Z`} /><rect x={x - 2} y={y + 4} width="4" height="40" /></g>
      ))}
      <path d="M0 200 V158 Q200 142 400 158 V200Z" fill="#0b2a49" />
      {[110, 200, 290].map((x) => (
        <g key={x}><ellipse cx={x} cy="162" rx="26" ry="7" fill="#050f22" stroke="var(--c)" strokeOpacity=".9" strokeWidth="1.5" /><ellipse cx={x} cy="161" rx="18" ry="4" fill="var(--c)" opacity=".5" className="gart-pulse" /></g>
      ))}
    </>
  ),

  // 송당 오름 위의 어머니 신과, 가지처럼 뻗은 자손 신들의 별 나무
  baekjuddo: () => (
    <>
      <defs>
        <radialGradient id="gb-mom"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="var(--c)" stopOpacity=".8" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <path d="M212 40 A24 24 0 1 0 232 78 A19 19 0 1 1 212 40Z" fill="#fdf6d8" opacity=".85" />
      {[[78, 106], [130, 84], [170, 116], [232, 112], [276, 82], [326, 108], [104, 58], [300, 54], [200, 100]].map(([x, y], i) => (
        <g key={i}>
          <line x1="200" y1="150" x2={x} y2={y} stroke="var(--c)" strokeOpacity=".4" />
          <line x1="200" y1="62" x2={x} y2={y} stroke="var(--c)" strokeOpacity=".5" />
          <circle cx={x} cy={y} r="8" fill="url(#gb-mom)" className="gart-pulse" style={{ '--d': `${i * 0.35}s` }} />
          <circle cx={x} cy={y} r="2.8" fill="#fff" />
        </g>
      ))}
      <circle cx="200" cy="62" r="34" fill="url(#gb-mom)" className="gart-breathe" />
      <path d={spark(200, 62, 26)} fill="#fff" className="gart-pulse" />
      <path d="M0 200 V170 Q70 148 140 160 Q200 128 260 160 Q330 148 400 170 V200Z" fill="#0b2a49" />
      <path d="M140 160 Q200 128 260 160" fill="none" stroke="var(--c)" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M0 200 V184 Q100 172 200 184 T400 184 V200Z" fill="#071d36" />
      {[40, 90, 150, 250, 310, 360].map((x, i) => <path key={i} d={`M${x} 190 q2 -10 0 -16 M${x + 4} 190 q3 -8 1 -13`} stroke="var(--c)" strokeOpacity=".6" fill="none" strokeLinecap="round" />)}
    </>
  ),

  // 바람을 타고 들어와 해녀의 바다에 씨를 뿌리는 여신
  yeongdeung: () => (
    <>
      <path d="M-10 70 C80 10 150 120 230 56 S360 30 420 80 C330 60 290 120 200 96 S60 140 -10 70Z" fill="var(--c)" opacity=".14" className="gart-sway" />
      {[[34, 62, 0], [66, 100, 0.8], [26, 134, 1.6], [48, 36, 2.2]].map(([y0, y1, d], i) => (
        <path key={i} d={`M-10 ${y1} C70 ${y0 - 24} 130 ${y1 + 34} 210 ${y1 - 8} S350 ${y0 + 12} 410 ${y1}`} fill="none" stroke="var(--c)" strokeWidth={i % 2 ? 2 : 3} strokeLinecap="round" strokeOpacity=".8" strokeDasharray="70 44" className="gart-wind" style={{ '--d': `${d}s` }} />
      ))}
      <path d="M300 70 a6 6 0 1 1 6 6 a12 12 0 1 1 -12 -12 a20 20 0 1 1 20 20" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" className="gart-pulse" />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={30 + i * 8} cy={50 + (i * 17) % 100} rx="4.5" ry="2.2" fill="#f9a8d4" className="gart-petal" style={{ '--d': `${i * 0.7}s`, '--y': `${(i % 3) * 10 - 10}px` }} />
      ))}
      <path d="M0 156 Q50 144 100 156 T200 156 T300 156 T400 156 V200 H0Z" fill="#0c3a63" />
      <path d="M0 172 Q50 162 100 172 T200 172 T300 172 T400 172 V200 H0Z" fill="#0a2d52" className="gart-sway" />
      <path d="M0 188 Q50 180 100 188 T200 188 T300 188 T400 188 V200 H0Z" fill="#071f3a" className="gart-sway" />
      <g fill="#050f22"><ellipse cx="318" cy="166" rx="10" ry="5" /><circle cx="340" cy="160" r="6" /><path d="M328 168 Q336 162 346 168 L342 176 Q334 172 326 176Z" /></g>
      <circle cx="318" cy="160" r="6" fill="#ff8a5c" className="gart-pulse" />
    </>
  ),

  // 오곡의 씨앗을 퍼뜨린 농경의 여신: 해 뜨는 들판의 황금빛 이삭
  jacheongbi: () => (
    <>
      <defs>
        <radialGradient id="gb-dawn"><stop offset="0" stopColor="#fff6c9" /><stop offset=".3" stopColor="#ffd166" stopOpacity=".85" /><stop offset="1" stopColor="#ff9f5c" stopOpacity="0" /></radialGradient>
        <linearGradient id="gb-field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8aa83a" /><stop offset="1" stopColor="#1f4a2c" /></linearGradient>
      </defs>
      <rect y="100" width="400" height="60" fill="#ff9f5c" opacity=".25" />
      <circle cx="200" cy="140" r="96" fill="url(#gb-dawn)" className="gart-breathe" />
      <g className="gart-rays">{Array.from({ length: 16 }, (_, i) => <line key={i} x1="200" y1="62" x2="200" y2="48" stroke="#ffe9a8" strokeWidth="3" strokeLinecap="round" opacity=".8" transform={`rotate(${-80 + i * 10.7} 200 140)`} />)}</g>
      <circle cx="200" cy="140" r="30" fill="#fff4bf" />
      <path d="M0 200 V150 Q200 134 400 150 V200Z" fill="url(#gb-field)" />
      {[0, 1, 2].map((r) => (
        <path key={r} d={`M0 ${166 + r * 14} Q200 ${152 + r * 14} 400 ${166 + r * 14}`} fill="none" stroke="#0e2b1c" strokeOpacity=".5" strokeWidth="2" />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 18 + i * 28, base = 158 + (i % 3) * 12, h = 40 + (i % 4) * 9
        return (
          <g key={i} className="gart-stalk" style={{ '--d': `${i * 0.2}s` }}>
            <line x1={x} y1={base} x2={x} y2={base - h} stroke="#c9d66b" strokeWidth="2.4" strokeLinecap="round" />
            {[-1, 1].map((d) => <ellipse key={d} cx={x + d * 4} cy={base - h + 8} rx="2.6" ry="6" fill="#ffd166" transform={`rotate(${d * 24} ${x + d * 4} ${base - h + 8})`} />)}
            <ellipse cx={x} cy={base - h} rx="2.8" ry="7" fill="#ffe08a" />
          </g>
        )
      })}
      {[[60, 40], [330, 50], [280, 34]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q5 -6 10 0 q5 -6 10 0`} fill="none" stroke="#1b1b3a" strokeWidth="1.8" strokeLinecap="round" className="gart-pulse" style={{ '--d': `${i * 0.6}s` }} />)}
    </>
  ),

  // 집 문 앞에서 가족을 지키는 신: 돌담 너머 초가, 따뜻한 불빛이 새어 나오는 문
  munjeon: () => (
    <>
      <defs>
        <radialGradient id="gb-warm"><stop offset="0" stopColor="#ffe3a8" stopOpacity=".95" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
        <linearGradient id="gb-thatch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a6a3b" /><stop offset="1" stopColor="#4a3820" /></linearGradient>
      </defs>
      <circle cx="200" cy="130" r="100" fill="url(#gb-warm)" opacity=".5" className="gart-breathe" />
      <polygon points="168,198 232,198 330,200 70,200" fill="#ffd9a0" opacity=".3" className="gart-pulse" />
      <path d="M84 92 L200 30 L316 92 L304 98 L200 46 L96 98Z" fill="url(#gb-thatch)" />
      <path d="M96 98 L200 46 L304 98 L292 106 L200 62 L108 106Z" fill="#3a2b17" />
      <rect x="116" y="102" width="168" height="98" fill="#1a2748" />
      <rect x="166" y="112" width="68" height="88" rx="3" fill="#ffcf85" className="gart-pulse" />
      <rect x="166" y="112" width="68" height="88" rx="3" fill="none" stroke="#5a3d1a" strokeWidth="5" />
      <line x1="200" y1="112" x2="200" y2="200" stroke="#5a3d1a" strokeWidth="3" />
      <rect x="132" y="116" width="26" height="20" fill="#ffcf85" opacity=".75" className="gart-pulse" style={{ '--d': '.6s' }} />
      <circle cx="200" cy="108" r="4" fill="#ff7a59" className="gart-pulse" />
      <path d="M0 200 V176 L40 172 L80 178 L120 172 L120 200Z M280 200 V172 L320 178 L360 172 L400 176 V200Z" fill="#0b1b33" />
      {[[40, 178], [90, 182], [310, 180], [360, 178]].map(([x, y], i) => <circle key={i} cx={x} cy={y - 40} r="1.8" fill="#ffe08a" className="gart-pulse" style={{ '--d': `${i * 0.5}s` }} />)}
      {[0, 1, 2].map((i) => <circle key={i} cx={236 + i * 8} cy="86" r="5" fill="#cbd5e1" opacity=".25" className="gart-rise" style={{ '--d': `${i * 0.9}s` }} />)}
    </>
  ),

  // 부엌 아궁이의 불과 가마솥을 지키는 할망
  jowang: () => (
    <>
      <defs>
        <radialGradient id="gb-fire"><stop offset="0" stopColor="#fff3b0" stopOpacity=".95" /><stop offset=".5" stopColor="var(--c)" stopOpacity=".5" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="200" fill="#1a0f22" opacity=".45" />
      <circle cx="200" cy="140" r="110" fill="url(#gb-fire)" className="gart-breathe" />
      <path d="M150 112 Q200 70 250 112 L240 130 H160Z" fill="#111827" />
      <ellipse cx="200" cy="112" rx="50" ry="8" fill="#1f2937" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${180 + i * 20} 96 q-8 -14 0 -26 q8 -12 0 -24`} fill="none" stroke="#e5e7eb" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" className="gart-rise" style={{ '--d': `${i * 0.8}s` }} />)}
      <path d="M200 74 C226 108 246 126 240 156 C236 176 220 184 200 184 C180 184 164 176 160 156 C154 126 176 112 200 74Z" fill="var(--c)" className="gart-flame" />
      <path d="M200 106 C216 128 226 142 222 160 C219 174 210 180 200 180 C190 180 181 174 178 160 C174 142 184 130 200 106Z" fill="#ffd166" className="gart-flame" style={{ '--d': '.25s' }} />
      <path d="M200 140 C208 152 212 160 209 170 C207 176 203 178 200 178 C197 178 193 176 191 170 C188 160 192 152 200 140Z" fill="#fff6c9" className="gart-flame" style={{ '--d': '.5s' }} />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={166 + i * 10} cy="130" r={i % 2 ? 1.6 : 2.2} fill="#ffd166" className="gart-rise" style={{ '--d': `${i * 0.42}s` }} />)}
      <rect x="110" y="176" width="180" height="24" rx="4" fill="#0b1b33" />
      <rect x="128" y="162" width="44" height="18" rx="6" fill="#1b2a47" /><rect x="228" y="162" width="44" height="18" rx="6" fill="#1b2a47" />
    </>
  ),

  // 북두칠성 아래 항아리를 감고 집을 지키는 뱀
  chilseong: () => (
    <>
      <defs>
        <radialGradient id="gb-moon"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="var(--c)" stopOpacity=".35" /><stop offset="1" stopColor="var(--c)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="318" cy="46" r="52" fill="url(#gb-moon)" className="gart-breathe" />
      <circle cx="318" cy="46" r="16" fill="#f1ecff" />
      <polyline points="46,36 90,50 134,44 170,66 184,98 232,100 270,70" fill="none" stroke="#fff" strokeOpacity=".5" />
      {[[46, 36], [90, 50], [134, 44], [170, 66], [184, 98], [232, 100], [270, 70]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="10" fill="url(#gb-moon)" className="gart-pulse" style={{ '--d': `${i * 0.3}s` }} /><path d={spark(x, y, 7)} fill="#fff" /></g>
      ))}
      <path d="M140 200 V146 Q138 120 172 114 H228 Q262 120 260 146 V200Z" fill="#4a3d9a" />
      <path d="M154 196 V148 Q154 128 178 124" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round" />
      <path d="M140 150 Q200 164 260 150" fill="none" stroke="#1a1445" strokeOpacity=".7" strokeWidth="3" />
      <path d="M150 140 Q200 150 250 140 M150 168 Q200 178 250 168" stroke="var(--c)" strokeOpacity=".5" fill="none" />
      <ellipse cx="200" cy="118" rx="30" ry="7" fill="#120d2b" stroke="var(--c)" strokeOpacity=".7" />
      <path d="M150 188 C140 170 262 172 250 152 C240 136 158 140 156 124 C154 112 188 108 214 114" fill="none" stroke="#120d2b" strokeWidth="17" strokeLinecap="round" opacity=".75" />
      <path d="M150 188 C140 170 262 172 250 152 C240 136 158 140 156 124 C154 112 188 108 214 114" fill="none" stroke="var(--c)" strokeWidth="12" strokeLinecap="round" strokeDasharray="15 5" className="gart-snake" />
      <ellipse cx="226" cy="112" rx="11" ry="8" fill="var(--c)" />
      <circle cx="229" cy="109" r="2.2" fill="#ffe08a" /><path d="M236 114 l10 3 m-10 -3 l9 -4" stroke="#ff6f91" strokeWidth="1.5" strokeLinecap="round" className="gart-pulse" />
      <path d="M0 200 V184 Q100 172 200 184 T400 184 V200Z" fill="#0b1633" />
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
