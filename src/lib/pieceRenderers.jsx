/* eslint-disable react-refresh/only-export-components */
import { PIECE_SKINS } from './pieceSkins'

const BASE  = (c) => <rect x="9" y="34" width="27" height="5" rx="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.5"/>

const Pawn   = (c) => (<><circle cx="22.5" cy="12" r="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5"/><path d="M17 19C15 25 13 29 11 34H34C32 29 30 25 28 19Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/>{BASE(c)}</>)
const Rook   = (c) => (<><path d="M11 32L11 14L15 14L15 9L19 9L19 14L26 14L26 9L30 9L30 14L34 14L34 32Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/>{BASE(c)}</>)
const Knight = (c) => (<><path d="M14 34L14 22Q13 10 22 8Q33 6 33 18Q33 25 26 27L28 34Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/><circle cx="26" cy="15" r="2" fill={c.accent} stroke={c.stroke} strokeWidth="1"/><path d="M16 22Q14 18 15 14" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round"/>{BASE(c)}</>)
const Bishop = (c) => (<><path d="M22.5 5L16 18H29Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/><rect x="21" y="8" width="3" height="7" rx="1" fill={c.accent}/><rect x="18.5" y="11" width="8" height="3" rx="1" fill={c.accent}/><path d="M16 18C14 25 12 29 10 34H35C33 29 31 25 29 18Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/>{BASE(c)}</>)
const Queen  = (c) => (<><circle cx="22.5" cy="8" r="3" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="13" cy="14" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="32" cy="14" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="17" cy="10" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><circle cx="28" cy="10" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><path d="M10 17L9 34H36L35 17Q22.5 23 10 17Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/>{BASE(c)}</>)
const King   = (c) => (<><rect x="20.5" y="4" width="4" height="12" rx="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><rect x="16.5" y="7" width="12" height="4" rx="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2"/><path d="M12 18L10 34H35L33 18Q22.5 23 12 18Z" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"/>{BASE(c)}</>)

const SHAPES = { P: Pawn, R: Rook, N: Knight, B: Bishop, Q: Queen, K: King }

export function createCustomPieces(skinId) {
  const skin = PIECE_SKINS.find(s => s.id === skinId)
  if (!skin?.colors) return undefined

  const pieces = {}
  for (const [type, shapeFn] of Object.entries(SHAPES)) {
    for (const [prefix, isWhite] of [['w', true], ['b', false]]) {
      const c = isWhite ? skin.colors.white : skin.colors.black
      pieces[`${prefix}${type}`] = ({ squareWidth: w }) => (
        <svg width={w} height={w} viewBox="0 0 45 45" fill="none">
          {shapeFn(c)}
        </svg>
      )
    }
  }
  return pieces
}

export function KingPreview({ colors, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" fill="none">
      {King(colors)}
    </svg>
  )
}
