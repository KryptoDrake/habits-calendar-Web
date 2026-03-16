import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { getMealTypeLabel, getDifficultyLabel } from '../lib/helpers'
import type { Recipe, ShoppingItem, MealPlan } from '../lib/types'
import { Search } from 'lucide-react'

type SubTab = 'rezepte' | 'einkaufen' | 'speiseplan'

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [expanded, setExpanded] = useState(false)

  // Background color based on cuisine
  const getBgGradient = () => {
    if (recipe.isFavorite) return 'linear-gradient(135deg, rgba(248,113,113,0.06), rgba(255,255,255,0.015))'
    return undefined
  }

  return (
    <div
      className="g-card-sm"
      style={{ marginBottom: '8px', cursor: 'pointer', background: getBgGradient() }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="card-glow" />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>{recipe.title}</span>
            {recipe.isFavorite && <span style={{ fontSize: '12px' }}>{'\u2764\uFE0F'}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {recipe.cuisine && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{recipe.cuisine}</span>
            )}
            {recipe.difficulty && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>&middot; {getDifficultyLabel(recipe.difficulty)}</span>
            )}
            {recipe.rating && (
              <span style={{ fontSize: '11px', color: 'var(--warning)' }}>
                {'\u2B50'} {recipe.rating}
              </span>
            )}
            {recipe.cookCount && recipe.cookCount > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>&middot; {recipe.cookCount}x</span>
            )}
          </div>
          {recipe.mealTypes && recipe.mealTypes.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
              {recipe.mealTypes.map(type => (
                <span key={type} className="glass-tag" style={{ background: 'rgba(251,146,60,0.12)', color: 'var(--orange)' }}>
                  {getMealTypeLabel(type)}
                </span>
              ))}
            </div>
          )}
        </div>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '4px', flexShrink: 0 }}>
          {expanded ? '\u25BC' : '\u25B6'}
        </span>
      </div>

      {expanded && (
        <div style={{
          marginTop: '14px', paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Zutaten */}
          {recipe.ingredients.length > 0 && (
            <div>
              <div className="section-label" style={{ margin: '0 0 6px' }}>Zutaten</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {ing.amount && `${ing.amount} `}{ing.unit && `${ing.unit} `}{ing.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vorbereitung */}
          {recipe.prepSteps.length > 0 && (
            <div>
              <div className="section-label" style={{ margin: '0 0 6px' }}>Vorbereitung</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recipe.prepSteps.sort((a, b) => a.order - b.order).map((step, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '2px', flexShrink: 0 }}>{i + 1}.</span>
                    {step.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kochen */}
          {recipe.cookingSteps.length > 0 && (
            <div>
              <div className="section-label" style={{ margin: '0 0 6px' }}>Kochen</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recipe.cookingSteps.sort((a, b) => a.order - b.order).map((step, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '2px', flexShrink: 0 }}>{i + 1}.</span>
                    {step.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {recipe.tags.map(tag => (
                <span key={tag} className="glass-tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ShoppingListView({ items }: { items: ShoppingItem[] }) {
  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)
  const [showChecked, setShowChecked] = useState(false)

  const grouped: Record<string, ShoppingItem[]> = {}
  for (const item of unchecked) {
    const key = item.recipeName || 'Sonstige'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {unchecked.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F6D2}'}</div>
          <p style={{ fontSize: '14px' }}>Einkaufsliste ist leer</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div style={{
              fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)',
              marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map(item => (
                <div key={item.id} className="shop-item">
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '6px', flexShrink: 0,
                    border: '2px solid var(--text-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} />
                  <span>
                    {item.amount && `${item.amount} `}{item.unit && `${item.unit} `}{item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {checked.length > 0 && (
        <div>
          <button
            onClick={() => setShowChecked(!showChecked)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 600,
              padding: '8px 0', fontFamily: 'Inter, sans-serif',
            }}
          >
            {showChecked ? '\u25BC' : '\u25B6'} Abgehakt ({checked.length})
          </button>
          {showChecked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.4 }}>
              {checked.map(item => (
                <div key={item.id} className="shop-item">
                  <div className="glass-check checked" style={{ width: '18px', height: '18px', borderRadius: '6px' }}>
                    {'\u2713'}
                  </div>
                  <span style={{ textDecoration: 'line-through' }}>
                    {item.amount && `${item.amount} `}{item.unit && `${item.unit} `}{item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MealPlanView({ plans }: { plans: MealPlan[] }) {
  if (plans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F4C5}'}</div>
        <p style={{ fontSize: '14px' }}>Keine Speisepläne</p>
      </div>
    )
  }

  const sorted = [...plans].sort((a, b) => b.weekStart.localeCompare(a.weekStart))
  const plan = sorted[0]

  const weekdayLabels: Record<string, string> = {
    montag: 'Montag', dienstag: 'Dienstag', mittwoch: 'Mittwoch',
    donnerstag: 'Donnerstag', freitag: 'Freitag', samstag: 'Samstag', sonntag: 'Sonntag',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Woche ab {plan.weekStart}</div>
      {plan.days.map(day => {
        const hasMeals = Object.values(day.meals).some(m => m && m.length > 0)
        if (!hasMeals) return null

        return (
          <div key={day.date} className="g-card-sm">
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              {weekdayLabels[day.weekday] || day.weekday}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(day.meals).map(([type, meals]) => {
                if (!meals || meals.length === 0) return null
                return meals.map((meal, i) => (
                  <div key={`${type}-${i}`} className="mplan-slot">
                    <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {getMealTypeLabel(type)}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                      {meal.recipeName}
                    </div>
                  </div>
                ))
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function EssenView() {
  const { data } = useData()
  const [subTab, setSubTab] = useState<SubTab>('rezepte')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'alle' | 'zuhause' | 'auswaerts'>('alle')

  if (!data) return null

  let recipes = data.recipes
  if (category !== 'alle') {
    recipes = recipes.filter(r => r.category === category)
  }
  if (search.trim()) {
    const q = search.toLowerCase()
    recipes = recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q) ||
      r.tags?.some(t => t.toLowerCase().includes(q))
    )
  }
  recipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="stagger-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.3px' }}>
          Küche
        </h1>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {([
          { id: 'rezepte' as SubTab, label: '\u{1F468}\u200D\u{1F373} Rezepte', count: data.recipes.length },
          { id: 'einkaufen' as SubTab, label: '\u{1F6D2} Einkaufen', count: data.shoppingList.filter(s => !s.checked).length },
          { id: 'speiseplan' as SubTab, label: '\u{1F4C5} Plan' },
        ]).map(tab => (
          <button
            key={tab.id}
            className={`kitchen-tab ${subTab === tab.id ? 'active' : ''}`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                marginLeft: '4px', fontSize: '10px', fontWeight: 800,
                opacity: subTab === tab.id ? 0.7 : 0.5,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'rezepte' && (
        <>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              className="w-4 h-4"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rezept suchen..."
              className="glass-search"
            />
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['alle', 'zuhause', 'auswaerts'] as const).map(cat => (
              <button
                key={cat}
                className={`kitchen-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                {cat === 'alle' ? 'Alle' : cat === 'zuhause' ? '\u{1F3E0} Zuhause' : '\u{1F37D}\uFE0F Auswärts'}
              </button>
            ))}
          </div>

          {/* Recipes */}
          {recipes.length > 0 ? (
            recipes.map(r => <RecipeCard key={r.id} recipe={r} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F468}\u200D\u{1F373}'}</div>
              <p style={{ fontSize: '14px' }}>Keine Rezepte gefunden</p>
            </div>
          )}
        </>
      )}

      {subTab === 'einkaufen' && <ShoppingListView items={data.shoppingList} />}
      {subTab === 'speiseplan' && <MealPlanView plans={data.mealPlans} />}
    </div>
  )
}
