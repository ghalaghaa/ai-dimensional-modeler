const PALETTE = [
  'from-indigo-400 to-violet-500',
  'from-fuchsia-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
  'from-purple-400 to-indigo-500',
  'from-teal-400 to-cyan-500',
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

export function avatarGradient(seed = '') {
  return PALETTE[hash(seed) % PALETTE.length]
}

export function initialsFor(text = '') {
  const clean = text.trim()
  if (!clean) return '?'
  return clean[0].toUpperCase()
}
