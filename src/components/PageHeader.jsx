export default function PageHeader({ title, desc }) {
  return (
    <header className="mb-4">
      <h1 className="h2 hero-title">{title}</h1>
      {desc && <p className="text-secondary mb-0">{desc}</p>}
    </header>
  )
}
