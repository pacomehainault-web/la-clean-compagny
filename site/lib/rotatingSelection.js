const MS_PER_DAY = 86_400_000
const ROTATE_EVERY_DAYS = 2

// Hash FNV-1a 32 bits : simple, rapide, bonne distribution même pour des entrées
// très proches (ex. "home:41" vs "home:42"). Sert de base à un choix
// "aléatoire" mais reproductible à partir d'une chaîne (namespace + période).
function fnv1a(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// Choisit un index dans [0, count) qui reste stable pendant 48h, puis change pour
// un autre index de façon pseudo-aléatoire (mais reproductible pour tout le monde,
// puisque basé uniquement sur la date). `namespace` permet à deux sections du site
// d'afficher chacune un élément différent le même jour, sans se resynchroniser.
export function getRotatingIndex(count, { date = new Date(), namespace = 'default' } = {}) {
  if (!count || count < 1) return 0
  const daysSinceEpoch = Math.floor(date.getTime() / MS_PER_DAY)
  const periodIndex = Math.floor(daysSinceEpoch / ROTATE_EVERY_DAYS)
  return fnv1a(`${namespace}:${periodIndex}`) % count
}
