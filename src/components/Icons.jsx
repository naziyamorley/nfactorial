// Hand-drawn pencil-sketch SVG icons.
// Uses feTurbulence + feDisplacementMap to wobble lines slightly,
// producing an organic "drawn from the hand" feel.

function SketchIcon({ size, color, viewBox, strokeWidth = 2, children, seed = 2, wobble = 0.6 }) {
  const id = `sk-${seed}`
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={wobble} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </svg>
  )
}

export function IconRobot({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={2}>
      <line x1="18" y1="2" x2="18" y2="7" />
      <circle cx="18" cy="1.5" r="2" fill={color} stroke="none" />
      <path d="M6 9 Q6 7 8 7 L28 7 Q30 7 30 9 L30 23 Q30 26 27 26 L9 26 Q6 26 6 23 Z" />
      <ellipse cx="13" cy="16" rx="3" ry="3.5" />
      <ellipse cx="23" cy="16" rx="3" ry="3.5" />
      <circle cx="13" cy="16" r="1.2" fill={color} stroke="none" />
      <circle cx="23" cy="16" r="1.2" fill={color} stroke="none" />
      <path d="M13 22 Q18 24.5 23 22" />
      <path d="M6 19 Q3 20 2 24 Q3 25 5 24" />
      <path d="M30 19 Q33 20 34 24 Q33 25 31 24" />
      <line x1="6" y1="31" x2="30" y2="31" strokeWidth="2.5" />
    </SketchIcon>
  )
}

export function IconSwords({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={3}>
      {/* Sword 1: top-left to bottom-right (\) */}
      <line x1="8" y1="8" x2="26" y2="26" />
      <line x1="5" y1="11" x2="11" y2="5" />
      <line x1="26" y1="26" x2="30" y2="30" strokeWidth="2.5" />
      {/* Sword 2: top-right to bottom-left (/) */}
      <line x1="28" y1="8" x2="10" y2="26" />
      <line x1="25" y1="5" x2="31" y2="11" />
      <line x1="10" y1="26" x2="6" y2="30" strokeWidth="2.5" />
    </SketchIcon>
  )
}

export function IconShield({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={4}>
      <path d="M18 3 Q24 5 30 6 L30 18 Q30 28 18 33 Q6 28 6 18 L6 6 Q12 5 18 3 Z" />
      <path d="M18 11 L18 23" />
      <path d="M12 17 L24 17" />
    </SketchIcon>
  )
}

export function IconKnight({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={5}>
      <path d="M10 32 L26 32" />
      <path d="M12 32 L11 26 Q9 22 10 17 Q11 12 15 9 Q13 7 12 5 Q14 3 17 3 Q22 3 24 6 Q26 9 23 13 Q26 15 26 21 L25 32" />
      <circle cx="15" cy="8" r="1.5" fill={color} stroke="none" />
      <path d="M15 14 Q19 13 22 14" />
      <path d="M10 22 Q14 20 18 22" />
    </SketchIcon>
  )
}

export function IconLightning({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={6} strokeWidth={2.2}>
      <path d="M22 3 L12 19 L19 19 L14 33 L24 17 L17 17 Z" />
    </SketchIcon>
  )
}

export function IconCrown({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={7}>
      <path d="M4 26 L4 12 Q9 17 12 13 L18 5 L24 13 Q27 17 32 12 L32 26 Z" />
      <path d="M4 30 L32 30" strokeWidth="2.5" />
      <circle cx="4" cy="12" r="2" fill={color} stroke="none" />
      <circle cx="18" cy="5" r="2" fill={color} stroke="none" />
      <circle cx="32" cy="12" r="2" fill={color} stroke="none" />
      <path d="M10 26 L10 22" strokeWidth="1.2" />
      <path d="M18 26 L18 21" strokeWidth="1.2" />
      <path d="M26 26 L26 22" strokeWidth="1.2" />
    </SketchIcon>
  )
}

export function IconSkull({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={8}>
      <path d="M10 24 Q5 23 5 16 Q5 6 18 6 Q31 6 31 16 Q31 23 26 24 L26 30 Q26 31 25 31 L11 31 Q10 31 10 30 Z" />
      <ellipse cx="13" cy="16" rx="3" ry="3.5" />
      <ellipse cx="23" cy="16" rx="3" ry="3.5" />
      <path d="M13 31 L13 26" />
      <path d="M18 31 L18 25" />
      <path d="M23 31 L23 26" />
      <path d="M16 21 Q18 22.5 20 21" />
    </SketchIcon>
  )
}

export function IconHandshake({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={9}>
      <path d="M2 22 Q5 18 8 16 L13 18 Q16 16 19 15 L25 15 Q29 15 34 20" />
      <path d="M8 16 Q11 11 15 13 Q17 14 19 13" />
      <path d="M13 18 L17 23" />
      <path d="M17 16 L21 21" />
      <path d="M21 15 L25 20" />
      <path d="M2 22 Q4 27 9 25 L22 24 Q28 24 34 20" />
    </SketchIcon>
  )
}

export function IconWarning({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={10}>
      <path d="M16 3 Q17 3 18 5 L30 26 Q31 28 30 29 Q29 30 28 30 L4 30 Q3 30 2 29 Q1 28 2 26 L14 5 Q15 3 16 3 Z" />
      <line x1="16" y1="13" x2="16" y2="21" />
      <circle cx="16" cy="25" r="1.5" fill={color} stroke="none" />
    </SketchIcon>
  )
}

export function IconSparkle({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={11}>
      <path d="M16 2 Q17 9 16 16 Q15 9 16 2 Z" fill={color} stroke="none" />
      <path d="M16 2 L16 30" />
      <path d="M2 16 L30 16" />
      <path d="M6 6 L26 26" />
      <path d="M26 6 L6 26" />
      <circle cx="16" cy="16" r="3" fill={color} stroke="none" />
    </SketchIcon>
  )
}

export function IconLightbulb({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={12}>
      <path d="M11 22 Q6 18 6 12 Q6 5 16 5 Q26 5 26 12 Q26 18 21 22 Z" />
      <line x1="11" y1="22" x2="21" y2="22" />
      <path d="M12 25 L20 25" />
      <path d="M13 28 Q13 30 16 30 Q19 30 19 28 L19 25 L13 25 Z" />
      <path d="M13 15 Q14 12 16 11 Q18 12 19 15" strokeWidth="1.5" />
    </SketchIcon>
  )
}

export function IconMasks({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={13}>
      <path d="M4 10 Q4 5 10 5 Q16 5 16 10 L16 18 Q16 21 12 22 Q8 23 5 21 Q4 20 4 18 Z" />
      <path d="M9 14 Q10 16 12 14" />
      <circle cx="8" cy="11" r="1.2" fill={color} stroke="none" />
      <circle cx="13" cy="11" r="1.2" fill={color} stroke="none" />
      <path d="M16 13 Q20 10 26 11 Q30 12 30 17 L30 22 Q30 26 26 27 Q22 28 19 26 Q17 25 16 22" />
      <path d="M20 19 Q22 21 25 20" />
      <circle cx="20" cy="15.5" r="1.2" fill={color} stroke="none" />
      <circle cx="25" cy="15" r="1.2" fill={color} stroke="none" />
    </SketchIcon>
  )
}

export function IconMedal({ size = 28, rank = 1 }) {
  const fill = rank === 1 ? '#F5C218' : rank === 2 ? '#B8B8B8' : '#CD7F32'
  const id = `sk-medal-${rank}`
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={14 + rank} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <circle cx="16" cy="20" r="10" fill={`${fill}22`} />
        <circle cx="16" cy="20" r="10" />
        <path d="M11 10 L9 4 L13 7 L16 2 L19 7 L23 4 L21 10" fill={`${fill}44`} />
      </g>
      <text x="16" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill={fill} stroke="none" fontFamily="Oswald, sans-serif">
        {rank}
      </text>
    </svg>
  )
}

export function IconFlag({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={17}>
      <line x1="6" y1="4" x2="6" y2="30" />
      <path d="M6 5 Q14 3 20 7 Q14 11 6 9 Z" />
    </SketchIcon>
  )
}

export function IconClipboard({ size = 28, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={18}>
      <path d="M12 4 L8 4 Q6 4 6 6 L6 28 Q6 30 8 30 L24 30 Q26 30 26 28 L26 6 Q26 4 24 4 L20 4" />
      <path d="M12 4 Q12 2 16 2 Q20 2 20 4 L20 6 L12 6 Z" />
      <line x1="11" y1="14" x2="21" y2="14" />
      <line x1="11" y1="19" x2="21" y2="19" />
      <line x1="11" y1="24" x2="17" y2="24" />
    </SketchIcon>
  )
}

export function IconEnvelope({ size = 36, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 36 36" seed={19}>
      <path d="M4 8 Q4 6 6 6 L30 6 Q32 6 32 8 L32 28 Q32 30 30 30 L6 30 Q4 30 4 28 Z" />
      <path d="M4 8 L18 20 L32 8" />
      <line x1="4" y1="30" x2="13" y2="19" />
      <line x1="32" y1="30" x2="23" y2="19" />
    </SketchIcon>
  )
}

export function IconCoin({ size = 20, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={20}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6.5" strokeWidth="1.2" />
      <path d="M9 12 L11 14 L15 9" strokeWidth="1.8" />
    </SketchIcon>
  )
}

export function IconPin({ size = 18, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={21}>
      <path d="M12 2 Q18 2 18 9 Q18 15 12 22 Q6 15 6 9 Q6 2 12 2 Z" />
      <circle cx="12" cy="9" r="2.5" />
    </SketchIcon>
  )
}

export function IconSprout({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={22}>
      <line x1="12" y1="22" x2="12" y2="10" />
      <path d="M12 10 Q12 4 6 4 Q6 10 12 10" />
      <path d="M12 14 Q12 8 18 7 Q19 13 12 14" />
    </SketchIcon>
  )
}

export function IconTarget({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={23}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </SketchIcon>
  )
}

export function IconFlame({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={24}>
      <path d="M12 2 Q14 6 13 9 Q16 6 15 3 Q20 7 20 13 Q20 19 12 22 Q4 19 4 13 Q4 8 8 5 Q8 9 10 10 Q9 6 12 2 Z" />
      <path d="M12 22 Q9 18 10 15 Q12 17 14 15 Q15 18 12 22" />
    </SketchIcon>
  )
}

export function IconDiamond({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={25}>
      <path d="M12 2 L22 9 L12 22 L2 9 Z" />
      <path d="M2 9 L8 9 L12 2 L16 9 L22 9" />
      <path d="M8 9 L12 22 L16 9" />
    </SketchIcon>
  )
}

export function IconBook({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={27}>
      <path d="M4 4 Q4 3 5 3 L11 3 Q12 4 12 5 L12 21 Q11 20 10 20 L5 20 Q4 20 4 19 Z" />
      <path d="M20 4 Q20 3 19 3 L13 3 Q12 4 12 5 L12 21 Q13 20 14 20 L19 20 Q20 20 20 19 Z" />
      <path d="M6 7 L10 7" strokeWidth="1.3" />
      <path d="M6 10 L10 10" strokeWidth="1.3" />
      <path d="M14 7 L18 7" strokeWidth="1.3" />
      <path d="M14 10 L18 10" strokeWidth="1.3" />
    </SketchIcon>
  )
}

export function IconTrophy({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={28}>
      <path d="M7 4 L17 4 L17 11 Q17 15 12 15 Q7 15 7 11 Z" />
      <path d="M7 6 Q3 6 3 9 Q3 12 7 12" />
      <path d="M17 6 Q21 6 21 9 Q21 12 17 12" />
      <path d="M12 15 L12 19" />
      <path d="M9 21 L15 21" strokeWidth="2.4" />
      <path d="M10 19 L14 19" />
    </SketchIcon>
  )
}

export function IconGraduation({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={29}>
      <path d="M2 9 L12 4 L22 9 L12 14 Z" />
      <path d="M6 11 L6 17 Q6 19 12 19 Q18 19 18 17 L18 11" />
      <line x1="22" y1="9" x2="22" y2="15" />
      <circle cx="22" cy="16" r="1" fill={color} stroke="none" />
    </SketchIcon>
  )
}

export function IconSchool({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10 L12 3 L22 10" />
      <path d="M4 10 L4 21 L20 21 L20 10" />
      <path d="M10 13 L10 21 L14 21 L14 13 Q14 11 12 11 Q10 11 10 13 Z" />
      <line x1="3" y1="21" x2="21" y2="21" strokeWidth="2.5" />
      <circle cx="12" cy="3" r="1" fill={color} stroke="none" />
    </svg>
  )
}

export function IconUsers({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={30}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 21 Q3 15 9 15 Q15 15 15 21" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 15 Q21 15 21 21" />
    </SketchIcon>
  )
}

export function IconPawn({ size = 32, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 32 32" seed={26}>
      <circle cx="16" cy="9" r="5" />
      <path d="M12 14 Q9 22 7 29 L25 29 Q23 22 20 14" />
      <line x1="7" y1="29" x2="25" y2="29" strokeWidth="2.5" />
    </SketchIcon>
  )
}

export function IconCheck({ size = 20, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={31}>
      <path d="M4 13 L9 19 L20 5" strokeWidth="2.4" />
    </SketchIcon>
  )
}

export function IconStar({ size = 20, color = 'currentColor', filled = false }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={32}>
      <path d="M12 3 L14.5 9 L21 9.8 L16 14 L17.5 21 L12 17.5 L6.5 21 L8 14 L3 9.8 L9.5 9 Z" fill={filled ? color : 'none'} />
    </SketchIcon>
  )
}

export function IconSun({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={33}>
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.5" y1="4.5" x2="6.8" y2="6.8" />
      <line x1="17.2" y1="17.2" x2="19.5" y2="19.5" />
      <line x1="4.5" y1="19.5" x2="6.8" y2="17.2" />
      <line x1="17.2" y1="6.8" x2="19.5" y2="4.5" />
    </SketchIcon>
  )
}

export function IconMoon({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={34}>
      <path d="M21 13 Q21 21 13 21 Q5 21 4 13 Q4 5 12 4 Q9 10 13 14 Q17 18 21 13 Z" />
    </SketchIcon>
  )
}

export function IconTree({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={35}>
      <path d="M12 2 Q7 4 7 9 Q3 10 5 14 Q3 16 6 17 L9 17 L9 22 L15 22 L15 17 L18 17 Q21 16 19 14 Q21 10 17 9 Q17 4 12 2 Z" />
      <line x1="12" y1="22" x2="12" y2="14" strokeWidth="1.3" />
    </SketchIcon>
  )
}

export function IconBuilding({ size = 22, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={36}>
      <path d="M3 21 L3 9 L12 3 L21 9 L21 21 Z" />
      <line x1="3" y1="21" x2="21" y2="21" strokeWidth="2.4" />
      <rect x="7" y="13" width="3.5" height="4" />
      <rect x="13.5" y="13" width="3.5" height="4" />
      <path d="M10 21 L10 17 L14 17 L14 21" />
    </SketchIcon>
  )
}

export function IconChessKing({ size = 80, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 80 80" seed={37} wobble={1.6} strokeWidth={1.8}>
      {/* Crown cross */}
      <line x1="40" y1="6" x2="40" y2="18" strokeWidth="2.5" />
      <line x1="34" y1="12" x2="46" y2="12" strokeWidth="2.5" />
      {/* Crown */}
      <path d="M22 30 Q16 30 16 24 Q16 20 20 20 Q22 20 23 22 Q26 18 30 22 Q33 14 40 14 Q47 14 50 22 Q54 18 57 22 Q58 20 60 20 Q64 20 64 24 Q64 30 58 30 L58 36 L22 36 Z" />
      <line x1="22" y1="36" x2="58" y2="36" strokeWidth="2" />
      {/* Body */}
      <path d="M25 38 Q22 50 24 60 L56 60 Q58 50 55 38" />
      {/* Mid band */}
      <path d="M22 46 Q40 50 58 46" />
      {/* Base */}
      <path d="M18 60 Q18 64 22 65 L58 65 Q62 64 62 60" />
      <line x1="18" y1="66" x2="62" y2="66" strokeWidth="2.6" />
      <line x1="15" y1="72" x2="65" y2="72" strokeWidth="2.6" />
      {/* Stitching detail */}
      <path d="M30 52 Q33 50 36 52" strokeWidth="1.1" />
      <path d="M44 52 Q47 50 50 52" strokeWidth="1.1" />
    </SketchIcon>
  )
}

export function IconChessRook({ size = 60, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 60 60" seed={38} wobble={1.3}>
      {/* Battlements */}
      <path d="M12 8 L12 18 L16 18 L16 12 L22 12 L22 18 L26 18 L26 12 L34 12 L34 18 L38 18 L38 12 L44 12 L44 18 L48 18 L48 8 Z" />
      {/* Neck */}
      <path d="M14 18 L14 24 L46 24 L46 18" />
      {/* Body */}
      <path d="M17 24 Q15 35 17 44 L43 44 Q45 35 43 24" />
      {/* Mid band */}
      <line x1="15" y1="32" x2="45" y2="32" />
      {/* Base */}
      <path d="M12 44 L12 50 L48 50 L48 44 Z" />
      <line x1="9" y1="52" x2="51" y2="52" strokeWidth="2.4" />
    </SketchIcon>
  )
}

export function IconArrowRight({ size = 18, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={39}>
      <line x1="4" y1="12" x2="19" y2="12" strokeWidth="2.2" />
      <polyline points="13 6 19 12 13 18" strokeWidth="2.2" />
    </SketchIcon>
  )
}

export function IconLogout({ size = 18, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={40}>
      <path d="M9 21 H5 Q3 21 3 19 V5 Q3 3 5 3 H9" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </SketchIcon>
  )
}

export function IconHome({ size = 20, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={41}>
      <path d="M3 11 L12 3 L21 11 V20 Q21 21 20 21 H15 V14 H9 V21 H4 Q3 21 3 20 Z" />
    </SketchIcon>
  )
}

export function IconMapAlt({ size = 20, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={42}>
      <path d="M2 6 L8 3 L16 6 L22 3 V18 L16 21 L8 18 L2 21 Z" />
      <line x1="8" y1="3" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="21" />
    </SketchIcon>
  )
}

export function IconScroll({ size = 20, color = 'currentColor' }) {
  return (
    <SketchIcon size={size} color={color} viewBox="0 0 24 24" seed={43}>
      <path d="M5 4 Q3 4 3 6 Q3 8 5 8 L17 8 Q19 8 19 6 Q19 4 17 4 Z" />
      <path d="M5 8 V18 Q5 20 7 20 H17 Q19 20 19 18 V8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="15" x2="14" y2="15" />
    </SketchIcon>
  )
}

/* Big illustrated decorative chess king — for hero/empty states.
   Drawn larger and more loosely than IconChessKing. */
export function HandKingIllustration({ width = 220, color = 'currentColor' }) {
  return (
    <svg width={width} viewBox="0 0 220 280" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <defs>
        <filter id="kingsk" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="50" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#kingsk)">
        {/* Cross on top */}
        <line x1="110" y1="14" x2="110" y2="46" strokeWidth="3" />
        <line x1="96" y1="30" x2="124" y2="30" strokeWidth="3" />
        {/* Crown rim */}
        <path d="M62 84 Q44 84 44 70 Q44 56 56 56 Q62 56 64 62 Q72 50 80 60 Q88 38 110 38 Q132 38 140 60 Q148 50 156 62 Q158 56 164 56 Q176 56 176 70 Q176 84 158 84 L158 96 L62 96 Z" />
        <line x1="62" y1="96" x2="158" y2="96" strokeWidth="2.6" />
        {/* Stitches on crown */}
        <path d="M80 76 Q86 72 92 76" strokeWidth="1.2" />
        <path d="M104 70 Q110 66 116 70" strokeWidth="1.2" />
        <path d="M128 76 Q134 72 140 76" strokeWidth="1.2" />
        {/* Body upper */}
        <path d="M70 100 Q60 130 65 170 L155 170 Q160 130 150 100" />
        {/* Sash */}
        <path d="M58 132 Q110 142 162 132" strokeWidth="2.4" />
        <path d="M58 142 Q110 152 162 142" strokeWidth="1.2" />
        {/* Lower body */}
        <path d="M68 170 Q62 200 70 220 L150 220 Q158 200 152 170" />
        <line x1="58" y1="222" x2="162" y2="222" strokeWidth="3" />
        {/* Base */}
        <path d="M52 224 Q50 240 60 248 L160 248 Q170 240 168 224" />
        <line x1="46" y1="252" x2="174" y2="252" strokeWidth="3.4" />
        <line x1="40" y1="264" x2="180" y2="264" strokeWidth="3.4" />
        {/* Hatching shadow */}
        <line x1="78" y1="118" x2="86" y2="128" strokeWidth="1" opacity="0.55" />
        <line x1="82" y1="116" x2="92" y2="130" strokeWidth="1" opacity="0.55" />
        <line x1="88" y1="115" x2="98" y2="132" strokeWidth="1" opacity="0.55" />
        <line x1="74" y1="186" x2="84" y2="200" strokeWidth="1" opacity="0.5" />
        <line x1="78" y1="184" x2="90" y2="200" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  )
}
