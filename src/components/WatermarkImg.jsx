const WM = '© DFly Photographie & Vidéo'

export default function WatermarkImg({ wrapStyle, wrapClass, ...imgProps }) {
  return (
    <div className={wrapClass} style={{ position: 'relative', ...wrapStyle }}>
      <img {...imgProps} />
      <span className="wm-text" aria-hidden="true">{WM}</span>
    </div>
  )
}
