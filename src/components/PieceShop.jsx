import { useState } from 'react'
import { PIECE_SKINS, getActivePieceSkin, setActivePieceSkin, getPurchasedPieceSkins, purchasePieceSkin } from '../lib/pieceSkins'
import { KingPreview } from '../lib/pieceRenderers'
import { IconCoin, IconChessKing } from './Icons'
import { useLang } from '../lib/i18n'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

function PiecePreview({ skinId }) {
  const skin = PIECE_SKINS.find(s => s.id === skinId)
  if (!skin?.colors) return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ color: '#E8D9B5' }}><IconChessKing size={26} color="currentColor" /></span>
      <span style={{ color: '#3d3d3d' }}><IconChessKing size={26} color="currentColor" /></span>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <KingPreview colors={skin.colors.white} />
      <KingPreview colors={skin.colors.black} />
    </div>
  )
}

export default function PieceShop({ profile, onSpendCoins }) {
  const { t } = useLang()
  const [active, setActive]       = useState(getActivePieceSkin)
  const [purchased, setPurchased] = useState(getPurchasedPieceSkins)
  const [buying, setBuying]       = useState(null)

  const coins = profile?.coins || 0

  function select(id) {
    if (!purchased.includes(id)) return
    setActive(id)
    setActivePieceSkin(id)
  }

  async function buy(skin) {
    if (coins < skin.price) return
    setBuying(skin.id)
    try {
      await onSpendCoins?.(skin.price)
      purchasePieceSkin(skin.id)
      setPurchased(getPurchasedPieceSkins())
      select(skin.id)
    } finally { setBuying(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)' }}>{t('skin_pieces')}</div>
        <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {PIECE_SKINS.map(skin => {
          const owned    = purchased.includes(skin.id)
          const isActive = active === skin.id
          const canAfford = coins >= skin.price

          return (
            <div key={skin.id} style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '14px 16px', borderRadius: 16,
              border: isActive ? '2px solid var(--text)' : '1.5px solid var(--border)',
              background: isActive ? 'var(--text)' : 'var(--bg-card)',
              minWidth: 110,
              transition: 'all 0.15s',
            }}>
              {/* Preview */}
              <div style={{ display: 'flex', justifyContent: 'center', minHeight: 36, alignItems: 'center' }}>
                <PiecePreview skinId={skin.id} />
              </div>

              {/* Name + desc */}
              <div>
                <div style={{ ...display, fontSize: 17, color: isActive ? 'var(--bg)' : 'var(--text)', lineHeight: 1, marginBottom: 2 }}>
                  {t(`piece_${skin.id}_name`)}
                </div>
                <div style={{ fontSize: 10, color: isActive ? 'rgba(255,243,225,0.45)' : 'var(--muted-soft)' }}>
                  {t(`piece_${skin.id}_desc`)}
                </div>
              </div>

              {/* Action */}
              {owned ? (
                <button
                  onClick={() => select(skin.id)}
                  style={{
                    padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    fontFamily: "'Oswald', sans-serif", cursor: isActive ? 'default' : 'pointer',
                    border: isActive ? 'none' : '1.5px solid var(--border)',
                    background: isActive ? 'rgba(255,243,225,0.12)' : 'transparent',
                    color: isActive ? 'rgba(255,243,225,0.6)' : 'var(--muted)',
                  }}>
                  {isActive ? t('skin_selected') : t('skin_select_btn')}
                </button>
              ) : (
                <button
                  onClick={() => buy(skin)}
                  disabled={!canAfford || buying === skin.id}
                  style={{
                    padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    fontFamily: "'Oswald', sans-serif",
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    border: 'none',
                    background: canAfford ? 'var(--accent-red)' : 'var(--border)',
                    color: canAfford ? '#fff' : 'var(--muted-soft)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                  {buying === skin.id ? '...' : <>{skin.price}<IconCoin size={11} color="currentColor" /></>}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
