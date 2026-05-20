// Gradient avatar — deterministic gradient from name/id + silhouette.
const GRADIENTS = [
  ['#FF6B9D', '#C77DFF'], // pink → lavender
  ['#7B5BFF', '#3A86FF'], // purple → blue
  ['#F5A524', '#FA2D1A'], // gold → red
  ['#22C55E', '#A855F7'], // green → purple
  ['#06B6D4', '#3B82F6'], // cyan → blue
  ['#F472B6', '#A855F7'], // pink → purple
  ['#FDE047', '#F97316'], // yellow → orange
  ['#A78BFA', '#EC4899'], // lavender → pink
]

function hash(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function Avatar({ name = '', id = '', size = 40, ring = false, online = false }) {
  const key = id || name
  const [c1, c2] = GRADIENTS[hash(key) % GRADIENTS.length]
  const initial = (name || '?').charAt(0).toUpperCase()

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', fontWeight: 700, fontSize: size * 0.4,
        fontFamily: "'Inter', sans-serif", letterSpacing: 0,
        boxShadow: ring ? '0 0 0 2px var(--bg), 0 0 0 4px var(--primary)' : 'none',
        userSelect: 'none',
      }}>
        {initial}
      </div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: 'var(--accent-green)',
          border: `2px solid var(--bg)`,
        }} />
      )}
    </div>
  )
}
