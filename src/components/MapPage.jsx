import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLang } from '../lib/i18n'
import { getChessLocations, addChessLocation, deleteChessLocation, supabase } from '../lib/supabase'
import { IconPawn, IconGraduation, IconSchool, IconTree, IconTrophy, IconPin, IconCheck } from './Icons'

const display = { fontFamily: "'Oswald', sans-serif", fontWeight: 900 }

// Roughly: geographic center of Kazakhstan
const KZ_CENTER = [48.0196, 66.9237]
const KZ_DEFAULT_ZOOM = 5
// Bounding box that wraps all of Kazakhstan (SW, NE corners).
// User can't pan outside this box and can't zoom out past minZoom.
const KZ_BOUNDS = [[40.5, 46.0], [55.7, 88.0]]
const KZ_MIN_ZOOM = 5

const TYPE_META = {
  club:       { emoji: '♟', Icon: IconPawn,       color: '#2E4C8C', labelKey: 'map_type_club' },
  section:    { emoji: '◆', Icon: IconGraduation, color: 'var(--accent-green)', labelKey: 'map_type_section' },
  school:     { emoji: '▲', Icon: IconSchool,     color: '#7c3aed', labelKey: 'map_type_school' },
  outdoor:    { emoji: '◉', Icon: IconTree,       color: '#92400e', labelKey: 'map_type_outdoor' },
  tournament: { emoji: '★', Icon: IconTrophy,     color: '#FA2D1A', labelKey: 'map_type_tournament' },
}

function makeIcon(type, isUser = false) {
  if (isUser) {
    return L.divIcon({
      className: 'chessy-user-pin',
      html: '<div style="width:18px;height:18px;border-radius:50%;background:#FA2D1A;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
  }
  const meta = TYPE_META[type] || TYPE_META.club
  return L.divIcon({
    className: 'chessy-pin',
    html: `<div style="
      width:34px;height:34px;border-radius:50% 50% 50% 0;
      background:${meta.color};
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 10px rgba(0,0,0,0.25);
      border:2px solid #fff;
    "><span style="transform:rotate(45deg);font-size:16px;">${meta.emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  })
}

// Haversine distance in km
function distanceKm(a, b) {
  if (!a || !b) return null
  const toRad = d => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

async function geocode(address) {
  const q = encodeURIComponent(address.includes('Казахстан') ? address : `${address}, Казахстан`)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
    headers: { 'Accept-Language': 'ru' },
  })
  if (!res.ok) throw new Error('geocode failed')
  const data = await res.json()
  if (!data?.length) return null
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name,
  }
}

function FlyTo({ position, zoom = 13 }) {
  const map = useMap()
  const lat = position?.[0]
  const lon = position?.[1]
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 0.8 })
    // `position` is derived from [lat, lon]; including it would cause infinite loops
    // because it's a new array reference each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, zoom, map])
  return null
}

export default function MapPage() {
  const { t } = useLang()
  const [locations, setLocations]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [me, setMe]                   = useState(null)        // { id }
  const [userPos, setUserPos]         = useState(null)        // [lat, lon] from address search
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching]     = useState(false)
  const [searchError, setSearchError] = useState('')
  const [filters, setFilters]         = useState(new Set(Object.keys(TYPE_META)))
  const [selectedId, setSelectedId]   = useState(null)
  const [showAdd, setShowAdd]         = useState(false)
  const markerRefs                    = useRef({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setMe(session?.user ? { id: session.user.id } : null)
    })
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getChessLocations({})
      setLocations(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function handleSearch(e) {
    e?.preventDefault?.()
    if (!searchQuery.trim()) return
    setSearching(true); setSearchError('')
    try {
      const r = await geocode(searchQuery.trim())
      if (!r) { setSearchError(t('map_address_not_found')); return }
      setUserPos([r.lat, r.lon])
    } catch (err) {
      console.error(err)
      setSearchError(t('map_address_not_found'))
    } finally {
      setSearching(false)
    }
  }

  function toggleFilter(type) {
    setFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type); else next.add(type)
      if (next.size === 0) return new Set(Object.keys(TYPE_META))
      return next
    })
  }

  const visibleLocations = useMemo(
    () => locations.filter(l => filters.has(l.type)),
    [locations, filters]
  )

  // Closest list (only when userPos is set)
  const closest = useMemo(() => {
    if (!userPos) return []
    return visibleLocations
      .map(l => ({ ...l, distance: distanceKm(userPos, [l.lat, l.lon]) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
  }, [visibleLocations, userPos])

  function focusOnLocation(loc) {
    setSelectedId(loc.id)
    const marker = markerRefs.current[loc.id]
    if (marker) marker.openPopup()
  }

  async function handleDelete(id) {
    if (!window.confirm(t('confirm_delete_location'))) return
    try {
      await deleteChessLocation(id)
      setLocations(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      alert(e.message || 'error')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ ...display, fontSize: 40, color: 'var(--text)', lineHeight: 1 }}>{t('map_title')}</div>
        <div style={{ fontSize: 13, color: 'var(--muted-soft)' }}>{t('map_subtitle')}</div>
        <div style={{ flex: 1 }} />
        {me && (
          <button onClick={() => setShowAdd(true)} style={btnPrimary}>+ {t('map_add_btn')}</button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('map_address_placeholder')}
          style={{
            flex: 1, minWidth: 240, padding: '12px 16px', borderRadius: 12,
            border: '1.5px solid var(--border)', background: 'var(--bg-card)',
            fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <button type="submit" disabled={searching} style={{ ...btnPrimary, padding: '12px 24px' }}>
          {searching ? '...' : t('map_search_btn')}
        </button>
      </form>
      {searchError && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#FA2D1A' }}>{searchError}</p>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(TYPE_META).map(([type, m]) => {
          const active = filters.has(type)
          const Icon = m.Icon
          return (
            <button key={type} onClick={() => toggleFilter(type)} style={{
              padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
              border: `1.5px solid ${active ? m.color : 'var(--border)'}`,
              background: active ? m.color : 'var(--bg-card)',
              color: active ? '#fff' : 'var(--muted)',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon size={14} color="currentColor" /> {t(m.labelKey)}
            </button>
          )
        })}
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'stretch' }}>
        <div style={{ height: 560, borderRadius: 18, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
          <MapContainer
            center={KZ_CENTER}
            zoom={KZ_DEFAULT_ZOOM}
            minZoom={KZ_MIN_ZOOM}
            maxBounds={KZ_BOUNDS}
            maxBoundsViscosity={0}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            preferCanvas
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userPos && (
              <>
                <Marker position={userPos} icon={makeIcon('club', true)}>
                  <Popup>{t('map_you_are_here')}</Popup>
                </Marker>
                <Circle center={userPos} radius={5000} pathOptions={{ color: '#FA2D1A', fillOpacity: 0.05, weight: 1 }} />
              </>
            )}

            <FlyTo position={userPos} zoom={12} />

            {visibleLocations.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lon]}
                icon={makeIcon(loc.type)}
                eventHandlers={{
                  add: (e) => { markerRefs.current[loc.id] = e.target },
                  remove: () => { delete markerRefs.current[loc.id] },
                }}
              >
                <Popup>
                  <LocationPopup loc={loc} me={me} t={t} userPos={userPos} onDelete={handleDelete} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar list */}
        <aside style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 18,
          display: 'flex', flexDirection: 'column', maxHeight: 560,
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border-soft)' }}>
            <div style={{ ...display, fontSize: 18, color: 'var(--text)' }}>
              {userPos ? t('map_nearest') : t('map_all_places')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginTop: 2 }}>
              {loading ? '...' : `${visibleLocations.length} ${t('places_suffix')}`}
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-soft)' }}>...</div>
            ) : (userPos ? closest : visibleLocations).length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted-soft)', fontSize: 13 }}>
                {t('no_data')}
              </div>
            ) : (
              (userPos ? closest : visibleLocations).map(loc => {
                const m = TYPE_META[loc.type] || TYPE_META.club
                const dist = userPos ? distanceKm(userPos, [loc.lat, loc.lon]) : null
                return (
                  <button
                    key={loc.id}
                    onClick={() => focusOnLocation(loc)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      padding: '12px 18px', border: 'none', background: selectedId === loc.id ? 'var(--bg)' : 'var(--bg-card)',
                      borderBottom: '1px solid var(--border-soft)', fontFamily: 'inherit',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: m.color + '20', color: m.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>{m.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                        {loc.name}
                        {loc.verified && <span style={{ marginLeft: 6, color: 'var(--accent-green)', display: 'inline-flex' }}><IconCheck size={11} color="currentColor" /></span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-soft)', marginTop: 2 }}>
                        {loc.city}{loc.address ? ` · ${loc.address}` : ''}
                      </div>
                      {dist != null && (
                        <div style={{ fontSize: 11, color: '#FA2D1A', marginTop: 4, fontWeight: 700 }}>
                          {dist < 1 ? `${Math.round(dist * 1000)} м` : `${dist.toFixed(1)} км`}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>
      </div>

      {/* Add modal */}
      {showAdd && me && (
        <AddLocationModal
          t={t}
          userId={me.id}
          onClose={() => setShowAdd(false)}
          onAdded={loc => { setLocations(prev => [loc, ...prev]); setShowAdd(false); setUserPos([loc.lat, loc.lon]) }}
        />
      )}
    </div>
  )
}

// ── Popup ─────────────────────────────────────────────────────────────────────
function LocationPopup({ loc, me, t, userPos, onDelete }) {
  const m = TYPE_META[loc.type] || TYPE_META.club
  const dist = userPos ? distanceKm(userPos, [loc.lat, loc.lon]) : null
  return (
    <div style={{ minWidth: 220, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
          background: m.color + '20', color: m.color, letterSpacing: 0.5,
        }}>{t(m.labelKey)}</span>
        {loc.verified && <span style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconCheck size={11} color="currentColor" /> {t('map_verified')}</span>}
      </div>
      <div style={{ ...display, fontSize: 16, color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>{loc.name}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: loc.description ? 6 : 0 }}>
        {loc.city}{loc.address ? ` · ${loc.address}` : ''}
      </div>
      {loc.description && (
        <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{loc.description}</p>
      )}
      {loc.schedule && (
        <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--muted)' }}><strong>{t('map_schedule')}:</strong> {loc.schedule}</p>
      )}
      {loc.contact && (
        <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--muted)' }}><strong>{t('map_contact')}:</strong> {loc.contact}</p>
      )}
      {dist != null && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#FA2D1A', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconPin size={11} color="currentColor" /> {dist < 1 ? `${Math.round(dist * 1000)} м` : `${dist.toFixed(1)} км`} {t('map_from_you')}</span>
        </p>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lon}`}
          target="_blank" rel="noreferrer"
          style={{ ...btnGhost, padding: '5px 10px', fontSize: 11, textDecoration: 'none' }}
        >
          {t('map_directions')}
        </a>
        {me && loc.added_by === me.id && (
          <button onClick={() => onDelete(loc.id)} style={{ ...btnGhost, padding: '5px 10px', fontSize: 11, color: '#FA2D1A', borderColor: 'var(--tint-red-border)' }}>
            {t('map_delete')}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Add modal ─────────────────────────────────────────────────────────────────
function AddLocationModal({ userId, onClose, onAdded, t }) {
  const [form, setForm]   = useState({
    name: '', type: 'club', city: '', address: '', description: '', contact: '', schedule: '',
  })
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      setError(t('map_fill_required'))
      return
    }
    setBusy(true); setError('')
    try {
      const geo = await geocode(`${form.address}, ${form.city}`)
      if (!geo) { setError(t('map_address_not_found')); return }
      const created = await addChessLocation({
        name: form.name.trim(),
        type: form.type,
        city: form.city.trim(),
        address: form.address.trim(),
        lat: geo.lat,
        lon: geo.lon,
        description: form.description.trim() || null,
        contact: form.contact.trim() || null,
        schedule: form.schedule.trim() || null,
        added_by: userId,
      })
      onAdded(created)
    } catch (err) {
      console.error(err)
      setError(err.message || 'error')
    } finally {
      setBusy(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid var(--border)', background: 'var(--bg-card)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 28, maxWidth: 460, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ ...display, fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>{t('map_add_title')}</div>
        <p style={{ margin: '0 0 18px', fontSize: 12, color: 'var(--muted)' }}>{t('map_add_hint')}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldLabel label={t('map_field_name')}>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="ШК Каисса" style={inp} required />
          </FieldLabel>

          <FieldLabel label={t('map_field_type')}>
            <select value={form.type} onChange={e => update('type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {Object.entries(TYPE_META).map(([k, m]) => (
                <option key={k} value={k}>{m.emoji} {t(m.labelKey)}</option>
              ))}
            </select>
          </FieldLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <FieldLabel label={t('map_field_city')}>
              <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Алматы" style={inp} required />
            </FieldLabel>
            <FieldLabel label={t('map_field_address')}>
              <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="ул. Тимирязева 28" style={inp} required />
            </FieldLabel>
          </div>

          <FieldLabel label={t('map_field_description')}>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
          </FieldLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FieldLabel label={t('map_field_schedule')}>
              <input value={form.schedule} onChange={e => update('schedule', e.target.value)} placeholder="пн-пт 18:00-21:00" style={inp} />
            </FieldLabel>
            <FieldLabel label={t('map_field_contact')}>
              <input value={form.contact} onChange={e => update('contact', e.target.value)} placeholder="+7 ... / @tg" style={inp} />
            </FieldLabel>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: '#FA2D1A', background: 'var(--tint-red)', border: '1.5px solid var(--tint-red-border)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={busy} style={{ ...btnGhost, flex: 1, padding: 12 }}>
              {t('map_cancel')}
            </button>
            <button type="submit" disabled={busy} style={{ ...btnPrimary, flex: 1, padding: 12 }}>
              {busy ? '...' : t('map_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FieldLabel({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, letterSpacing: 0.5 }}>{label}</div>
      {children}
    </label>
  )
}

// ── Button styles ─────────────────────────────────────────────────────────────
const btnPrimary = {
  padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
  background: 'var(--text)', color: 'var(--bg)',
  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 1,
}
const btnGhost = {
  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
  background: 'var(--bg-card)', color: 'var(--muted)', border: '1.5px solid var(--border)',
  fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: 13,
}
