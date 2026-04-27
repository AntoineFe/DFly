export default function DflyMonogram({ size = 56, color = 'currentColor' }) {
  const isLight = color !== 'currentColor' && (
    color.includes('ivory') || color.includes('243,237,226') || color === 'white' || color === '#fff'
  )
  return (
    <img
      src="./assets/dfly-logo.png"
      alt="DFly"
      style={{
        width: size, height: size,
        objectFit: 'contain', display: 'block',
        filter: isLight ? 'invert(1) brightness(1.05)' : 'none',
      }}
    />
  )
}
