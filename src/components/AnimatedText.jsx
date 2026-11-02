// 글자·단어가 하나씩 나타나는 글. 움직임은 styles/todaygod.css (.reveal.in 안에서 시작)
export function Chars({ text, base = 0, step = 0.05 }) {
  return (
    <>
      {[...text].map((ch, i) => <span key={i} className="tg-char" style={{ '--d': `${(base + i * step).toFixed(2)}s` }}>{ch === ' ' ? ' ' : ch}</span>)}
    </>
  )
}

export function Words({ text, base = 0, step = 0.05 }) {
  return (
    <>
      {text.split(' ').map((w, i) => <span key={i} className="tg-word" style={{ '--d': `${(base + i * step).toFixed(2)}s` }}>{w}</span>)}
    </>
  )
}
