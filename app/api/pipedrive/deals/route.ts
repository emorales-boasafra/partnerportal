import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import PipedriveClient from '@/lib/pipedrive/service'
import type { PipedriveAPIResponse, PipedriveDealListResponse } from '@/lib/pipedrive/types'

export async function GET(req: NextRequest): Promise<NextResponse<PipedriveAPIResponse<PipedriveDealListResponse>>> {
  try {
    const client = new PipedriveClient()
    // Read optional query params
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '10')
    const start = url.searchParams.get('start')
    const status = url.searchParams.get('status')

    const queryParams: any = { limit }
    if (start) {
      queryParams.start = Number(start)
    }
    if (status) {
      // v1 API expects comma-separated status values
      queryParams.status = status
    }

    const payload = await client.listDealsWithMeta(queryParams)

    // payload should include { success, data, additional_data, related_objects }
    return NextResponse.json({ ok: true, payload })
  } catch (err: any) {
    console.error('❌ Pipedrive API Error:', err.message)
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
