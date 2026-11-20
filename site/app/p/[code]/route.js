import { NextResponse } from 'next/server'

// Lien de parrainage personnel : /p/AB12CD → réservation avec le code du parrain déjà rempli.
export async function GET(request, { params }) {
  const { code } = await params
  const clean = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  const url = new URL(clean ? `/reserver?parrain=${clean}` : '/reserver', request.url)
  return NextResponse.redirect(url, 307)
}
