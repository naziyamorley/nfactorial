export const PIECE_SKINS = [
  { id: 'classic', price: 0,   colors: null },
  { id: 'crystal', price: 150,
    colors: { white: { fill: '#c8eaf8', stroke: '#3a8fbf', accent: '#e8f7ff' }, black: { fill: '#2a4a6a', stroke: '#0a1e30', accent: '#3a6080' } } },
  { id: 'gold',    price: 300,
    colors: { white: { fill: '#f5d050', stroke: '#8b6000', accent: '#fff0a0' }, black: { fill: '#b87000', stroke: '#4a2a00', accent: '#d49020' } } },
  { id: 'blood',   price: 400,
    colors: { white: { fill: '#f0b0a0', stroke: '#8b1a1a', accent: '#ffd0c0' }, black: { fill: '#5a0000', stroke: '#1a0000', accent: '#8b1010' } } },
  { id: 'shadow',  price: 500,
    colors: { white: { fill: '#9898b0', stroke: '#303050', accent: '#c0c0d8' }, black: { fill: '#0a0a14', stroke: '#000000', accent: '#1a1a28' } } },
]

export function getActivePieceSkin() {
  return localStorage.getItem('chessy_piece_skin') || 'classic'
}
export function setActivePieceSkin(id) {
  localStorage.setItem('chessy_piece_skin', id)
}
export function getPurchasedPieceSkins() {
  try { return JSON.parse(localStorage.getItem('chessy_purchased_skins') || '["classic"]') }
  catch { return ['classic'] }
}
export function purchasePieceSkin(id) {
  const list = getPurchasedPieceSkins()
  if (!list.includes(id)) localStorage.setItem('chessy_purchased_skins', JSON.stringify([...list, id]))
}
