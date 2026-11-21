import { NextResponse } from 'next/server'
import { publicPart } from '@/lib/app-config'
import { getConfig } from '@/lib/server/app-config'

/** The admin's app-wide settings that every device follows (never the invite code). */
export async function GET() {
  return NextResponse.json(publicPart(await getConfig()), { headers: { 'Cache-Control': 'no-store' } })
}
