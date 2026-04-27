export default function Cartouche({ children, color = 'currentColor', width = 560, height = 720, className = '' }) {
  const w = width, h = height
  return (
    <div className={`cartouche-frame ${className}`} style={{ position: 'relative', width: w, height: h, maxWidth: '90vw' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%"
        style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="none">
        <path
          d={`M ${w/2} 8 C ${w*.25} 8,8 ${h*.08},8 ${h*.18} L 8 ${h-60} C 8 ${h-20},40 ${h-8},${w/2} ${h-8} C ${w-40} ${h-8},${w-8} ${h-20},${w-8} ${h-60} L ${w-8} ${h*.18} C ${w-8} ${h*.08},${w*.75} 8,${w/2} 8 Z`}
          fill="none" stroke={color} strokeWidth="1" opacity="0.55"
        />
        <path
          d={`M ${w/2} 18 C ${w*.27} 18,18 ${h*.09},18 ${h*.19} L 18 ${h-62} C 18 ${h-26},46 ${h-18},${w/2} ${h-18} C ${w-46} ${h-18},${w-18} ${h-26},${w-18} ${h-62} L ${w-18} ${h*.19} C ${w-18} ${h*.09},${w*.73} 18,${w/2} 18 Z`}
          fill="none" stroke={color} strokeWidth="0.6" opacity="0.35"
        />
      </svg>
      <div className="cartouche-inner" style={{
        position: 'relative', width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px', textAlign: 'center',
      }}>
        {children}
      </div>
    </div>
  )
}
