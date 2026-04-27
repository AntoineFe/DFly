export default function SectionLabel({ num, label, align = 'left' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      flexWrap: 'nowrap', whiteSpace: 'nowrap',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      fontFamily: 'var(--sans)', fontSize: 11,
      letterSpacing: '0.36em', textTransform: 'uppercase', color: 'var(--fg-muted)',
    }}>
      <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '0.02em', textTransform: 'none', fontSize: 14 }}>
        — {num}
      </span>
      <span>{label}</span>
    </div>
  )
}
