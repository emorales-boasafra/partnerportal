import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import PipedriveClient from '@/lib/pipedrive/service'
import type { PipedriveAPIResponse, PipedriveLeadListResponse } from '@/lib/pipedrive/types'

export async function GET(req: NextRequest): Promise<NextResponse<PipedriveAPIResponse<PipedriveLeadListResponse>>> {
  try {
    const client = new PipedriveClient()
    // Read optional query params
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '10')
    const start = url.searchParams.get('start')
    const owner_id = url.searchParams.get('owner_id')
    const person_id = url.searchParams.get('person_id')
    const organization_id = url.searchParams.get('organization_id')
    const filter_id = url.searchParams.get('filter_id')

    const queryParams: any = { limit }
    if (start) {
      queryParams.start = Number(start)
    }
    if (owner_id) {
      queryParams.owner_id = Number(owner_id)
    }
    if (person_id) {
      queryParams.person_id = Number(person_id)
    }
    if (organization_id) {
      queryParams.organization_id = Number(organization_id)
    }
    if (filter_id) {
      queryParams.filter_id = Number(filter_id)
    }

    const payload = await client.listLeadsWithMeta(queryParams)

    // payload should include { success, data, additional_data }
    return NextResponse.json({ ok: true, payload })
  } catch (err: any) {
    console.error('❌ Pipedrive Leads API Error:', err.message)
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}