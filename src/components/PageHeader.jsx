export default function PageHeader({ title, desc, titleClass = '' }) {
  return (
    <header className="mb-4">
      <h1 className={`h2 hero-title ${titleClass}`}>{title}</h1>
      {desc && <p className="text-secondary mb-0">{desc}</p>}
    </header>
  )
}
