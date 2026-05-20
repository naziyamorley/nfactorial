export const SKINS = [
  {
    id: 'purple',
    level: 1,
    light: '#E8DFF5',
    dark: '#5B3A85',
  },
  {
    id: 'classic',
    level: 1,
    light: '#f0d9b5',
    dark: '#b58863',
  },
  {
    id: 'night',
    level: 5,
    light: '#aebecb',
    dark: '#3d4d5c',
  },
  {
    id: 'jade',
    level: 10,
    light: '#ddf0c8',
    dark: '#4a7a3a',
  },
  {
    id: 'blood',
    level: 15,
    light: '#f0c4b0',
    dark: '#8b1a1a',
  },
  {
    id: 'legend',
    level: 20,
    light: '#f5e4a0',
    dark: '#8b6914',
  },
]

export function getActiveSkin() {
  const id = localStorage.getItem('chessSkin') || 'purple'
  return SKINS.find(s => s.id === id) || SKINS[0]
}

export function setActiveSkin(id) {
  localStorage.setItem('chessSkin', id)
}
