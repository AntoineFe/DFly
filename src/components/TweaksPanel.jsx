import { useState, useRef, useCallback, useEffect } from 'react'

const STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
    border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.12);
    box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
`

// ── TweaksPanel ──────────────────────────────────────────────────────────────
export default function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = useState(false)
  const dragRef  = useRef(null)
  const offsetRef = useRef({ x: 16, y: 16 })

  const clamp = useCallback(() => {
    const panel = dragRef.current
    if (!panel) return
    const w = panel.offsetWidth, h = panel.offsetHeight
    const PAD = 16
    offsetRef.current = {
      x: Math.min(Math.max(PAD, offsetRef.current.x), window.innerWidth  - w - PAD),
      y: Math.min(Math.max(PAD, offsetRef.current.y), window.innerHeight - h - PAD),
    }
    panel.style.right  = offsetRef.current.x + 'px'
    panel.style.bottom = offsetRef.current.y + 'px'
  }, [])

  useEffect(() => {
    if (!open) return
    clamp()
    window.addEventListener('resize', clamp)
    return () => window.removeEventListener('resize', clamp)
  }, [open, clamp])

  const onDragStart = (e) => {
    const panel = dragRef.current
    if (!panel) return
    const r = panel.getBoundingClientRect()
    const [sx, sy] = [e.clientX, e.clientY]
    const [startR, startB] = [window.innerWidth - r.right, window.innerHeight - r.bottom]
    const move = (ev) => {
      offsetRef.current = { x: startR - (ev.clientX - sx), y: startB - (ev.clientY - sy) }
      clamp()
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <>
      <style>{STYLE}</style>
      {/* Bouton d'ouverture */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 2147483645,
          background: 'rgba(250,249,247,.85)', border: '.5px solid rgba(0,0,0,.1)',
          borderRadius: 10, padding: '8px 14px', cursor: 'default',
          fontFamily: 'ui-sans-serif,system-ui,sans-serif', fontSize: 11.5, fontWeight: 600,
          backdropFilter: 'blur(12px)',
        }}>
          ⚙ Tweaks
        </button>
      )}
      {/* Panneau */}
      {open && (
        <div ref={dragRef} className="twk-panel" style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
          <div className="twk-hd" onMouseDown={onDragStart}>
            <b>{title}</b>
            <button className="twk-x" onMouseDown={e => e.stopPropagation()} onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  )
}

// ── Sections et contrôles ────────────────────────────────────────────────────
export function TweakSection({ title, children }) {
  return (
    <>
      <div className="twk-sect">{title}</div>
      {children}
    </>
  )
}

export function TweakRadio({ value, options, onChange }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const opts = options.map(o => typeof o === 'object' ? o : { value: o, label: o })
  const n = opts.length
  const idx = Math.max(0, opts.findIndex(o => o.value === value))
  const valueRef = useRef(value)
  valueRef.current = value

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect()
    const i = Math.floor(((clientX - r.left - 2) / (r.width - 4)) * n)
    return opts[Math.max(0, Math.min(n - 1, i))].value
  }

  const onPointerDown = (e) => {
    setDragging(true)
    const v0 = segAt(e.clientX)
    if (v0 !== valueRef.current) onChange(v0)
    const move = (ev) => { const v = segAt(ev.clientX); if (v !== valueRef.current) onChange(v) }
    const up = () => { setDragging(false); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
      className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
      <div className="twk-seg-thumb" style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`, width: `calc((100% - 4px) / ${n})` }} />
      {opts.map(o => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>{o.label}</button>
      ))}
    </div>
  )
}

export function TweakSlider({ value, min = 0, max = 100, step = 1, onChange, format }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>Valeur</span>
        <span className="twk-val">{format ? format(value) : value}</span>
      </div>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}
