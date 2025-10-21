/**
 * Unified Pipedrive server-side client for both Deals and Leads
 * For server-side usage (Next.js server components / API routes)
 */
import type { PipedriveDeal, PipedriveLead, PipedriveListResponse } from './types'
import type { StandardDeal, StandardLead, StandardPaginatedResponse } from './mapping'
import { mapPipedriveDealsListResponse, mapPipedriveLeadsListResponse } from './mapping'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  query?: Record<string, string | number | boolean | string[] | undefined>
  body?: any
  headers?: Record<string, string>
}

function pickDefaultToken() {
  const prod = process.env.PIPEDRIVE_PROD_API_TOKEN
  const sandbox = process.env.PIPEDRIVE_SANDBOX_API_TOKEN
  return process.env.NODE_ENV === 'production' ? prod || sandbox : sandbox || prod
}

export class PipedriveClient {
  private token: string
  private baseUrl: string

  constructor(opts?: { token?: string; baseUrl?: string }) {
    this.token = opts?.token || pickDefaultToken() || ''
    if (!this.token) throw new Error('Pipedrive API token not configured in env')
    this.baseUrl = opts?.baseUrl || process.env.PIPEDRIVE_BASE_API_URL || 'https://api.pipedrive.com'
  }

  private buildUrl(path: string, query?: Record<string, any>) {
    const base = this.baseUrl.replace(/\/+$/, '')
    const p = path.replace(/^\/+/, '/')
    const url = new URL(`${base}/v1${p}`)
    const q = { ...(query || {}), api_token: this.token }
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) {
          // For v1 API, convert arrays to comma-separated strings
          url.searchParams.set(k, v.join(','))
        } else {
          url.searchParams.set(k, String(v))
        }
      }
    })
    return url.toString()
  }

  private async request(path: string, opts: RequestOptions = {}) {
    const method = opts.method || 'GET'
    const url = this.buildUrl(path, opts.query)
    const headers: Record<string, string> = { ...(opts.headers || {}) }
    let body: string | undefined
    if (opts.body != null && method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
      body = JSON.stringify(opts.body)
    }

    const res = await fetch(url, { method, headers, body })
    const payload = await res.json().catch(() => null)

    if (!res.ok) {
      const errMsg = payload && (payload.error || payload.message) ? JSON.stringify(payload) : res.statusText
      throw new Error(`Pipedrive HTTP error ${res.status}: ${errMsg}`)
    }

    if (payload && payload.success === false) {
      const message = payload.error || payload.error_message || JSON.stringify(payload)
      throw new Error(`Pipedrive API error: ${message}`)
    }

    return payload?.data ?? payload
  }

  // DEALS METHODS
  getDeal(id: number | string) {
    return this.request(`/deals/${id}`, { method: 'GET' })
  }

  listDeals(query?: { start?: number; limit?: number; status?: string | string[] }) {
    return this.request('/deals', { method: 'GET', query })
  }

  // Return raw payload (including additional_data/pagination) for deals list endpoints
  async listDealsWithMeta(query?: { start?: number; limit?: number; status?: string | string[] }) {
    const base = this.baseUrl.replace(/\/+$/, '')
    const p = '/v1/deals'
    const url = new URL(`${base}${p}`)
    const q = { ...(query || {}), api_token: this.token }
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) {
          // For v1 API, convert arrays to comma-separated strings
          url.searchParams.set(k, v.join(','))
        } else {
          url.searchParams.set(k, String(v))
        }
      }
    })

    const res = await fetch(url.toString(), { method: 'GET' })
    const payload = await res.json().catch(() => null)
    if (!res.ok) {
      const errMsg = payload && (payload.error || payload.message) ? JSON.stringify(payload) : res.statusText
      throw new Error(`Pipedrive HTTP error ${res.status}: ${errMsg}`)
    }
    if (payload && payload.success === false) {
      const message = payload.error || payload.error_message || JSON.stringify(payload)
      throw new Error(`Pipedrive API error: ${message}`)
    }
    return payload
  }

  createDeal(payload: Record<string, any>) {
    return this.request('/deals', { method: 'POST', body: payload })
  }

  updateDeal(id: number | string, payload: Record<string, any>) {
    return this.request(`/deals/${id}`, { method: 'PUT', body: payload })
  }

  // LEADS METHODS
  getLead(id: string) {
    return this.request(`/leads/${id}`, { method: 'GET' })
  }

  // Return raw payload for leads endpoints
  async listLeadsWithMeta(query?: { start?: number; limit?: number; owner_id?: number; person_id?: number; organization_id?: number; filter_id?: number }, archived = false) {
    const base = this.baseUrl.replace(/\/+$/, '')
    const p = archived ? '/v1/leads/archived' : '/v1/leads'
    const url = new URL(`${base}${p}`)
    const q = { ...(query || {}), api_token: this.token }
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v))
      }
    })

    const res = await fetch(url.toString(), { method: 'GET' })
    const payload = await res.json().catch(() => null)
    if (!res.ok) {
      const errMsg = payload && (payload.error || payload.message) ? JSON.stringify(payload) : res.statusText
      throw new Error(`Pipedrive HTTP error ${res.status}: ${errMsg}`)
    }
    if (payload && payload.success === false) {
      const message = payload.error || payload.error_message || JSON.stringify(payload)
      throw new Error(`Pipedrive API error: ${message}`)
    }
    return payload
  }

  createLead(payload: Record<string, any>) {
    return this.request('/leads', { method: 'POST', body: payload })
  }

  updateLead(id: string, payload: Record<string, any>) {
    return this.request(`/leads/${id}`, { method: 'PUT', body: payload })
  }

  // PERSONS METHODS
  getPerson(id: number | string) {
    return this.request(`/persons/${id}`, { method: 'GET' })
  }

  searchPersons(term: string, options?: { field_type?: string; limit?: number }) {
    return this.request('/persons/search', { method: 'GET', query: { term, ...options } })
  }

  createPerson(payload: Record<string, any>) {
    return this.request('/persons', { method: 'POST', body: payload })
  }

  updatePerson(id: number | string, payload: Record<string, any>) {
    return this.request(`/persons/${id}`, { method: 'PUT', body: payload })
  }

  // Generic raw request
  raw(path: string, opts?: RequestOptions) {
    return this.request(path, opts || {})
  }
}

export default PipedriveClient

// SERVICE LAYER FUNCTIONS - These can be called from components/pages

export interface DealsListParams {
  page?: number
  pageSize?: number
  cursor?: string
  limit?: number
  status?: 'open' | 'won' | 'lost' | 'all_not_deleted' | string[] | string
}

export interface LeadsListParams {
  page?: number
  pageSize?: number
  start?: number  // For v1 API offset-based pagination
  owner_id?: number
  person_id?: number
  organization_id?: number
  filter_id?: number
}

/**
 * Service function to get paginated deals with proper mapping
 */
export async function getDealsService(params: DealsListParams = {}): Promise<StandardPaginatedResponse<StandardDeal>> {
  const client = new PipedriveClient()
  
  // Handle page-based pagination (convert to cursor-based for v2 API)
  let limit: number
  let currentPage: number
  let cursor: string | undefined
  
  if (params.page !== undefined && params.pageSize !== undefined) {
    currentPage = params.page
    limit = params.pageSize
    cursor = params.cursor
  } else {
    limit = params.limit || 10
    currentPage = 1
    cursor = params.cursor
  }

  const queryParams: any = { 
    limit
  }

  // Add cursor if provided (for pagination beyond first page)
  if (cursor) {
    queryParams.cursor = cursor
  }

  // Add status filter if specified
  if (params.status) {
    queryParams.status = params.status
  }

  const response = await client.listDealsWithMeta(queryParams)
  return mapPipedriveDealsListResponse(response, currentPage, limit)
}

/**
 * Service function to get paginated leads with proper mapping
 */
export async function getLeadsService(params: LeadsListParams = {}): Promise<StandardPaginatedResponse<StandardLead>> {
  const client = new PipedriveClient()
  
  const { page = 1, pageSize = 10, start, owner_id, person_id, organization_id, filter_id } = params
  
  const queryParams: any = { 
    limit: pageSize
  }

  if (start) {
    queryParams.start = start
  }
  if (owner_id) {
    queryParams.owner_id = owner_id
  }
  if (person_id) {
    queryParams.person_id = person_id
  }
  if (organization_id) {
    queryParams.organization_id = organization_id
  }
  if (filter_id) {
    queryParams.filter_id = filter_id
  }

  // Always get active leads only
  const response = await client.listLeadsWithMeta(queryParams, false)
  return mapPipedriveLeadsListResponse(response, page, pageSize)
}

/**
 * Service function to get a single deal by ID
 */
export async function getDealService(id: number | string): Promise<StandardDeal> {
  const client = new PipedriveClient()
  const deal = await client.getDeal(id)
  // We would need to import the single deal mapping function here
  // For now, we'll throw an error since we haven't implemented single deal mapping
  throw new Error('Single deal mapping not implemented yet')
}

/**
 * Service function to get a single lead by ID
 */
export async function getLeadService(id: string): Promise<StandardLead> {
  const client = new PipedriveClient()
  const lead = await client.getLead(id)
  // We would need to import the single lead mapping function here
  throw new Error('Single lead mapping not implemented yet')
}

/**
 * Service function to create a new deal
 */
export async function createDealService(dealData: Record<string, any>): Promise<StandardDeal> {
  const client = new PipedriveClient()
  const deal = await client.createDeal(dealData)
  // We would need to map the created deal here
  throw new Error('Create deal mapping not implemented yet')
}

/**
 * Service function to create a new lead
 */
export async function createLeadService(leadData: Record<string, any>): Promise<StandardLead> {
  const client = new PipedriveClient()
  const lead = await client.createLead(leadData)
  // We would need to map the created lead here
  throw new Error('Create lead mapping not implemented yet')
}

/**
 * Service function to update an existing deal
 */
export async function updateDealService(id: number | string, dealData: Record<string, any>): Promise<StandardDeal> {
  const client = new PipedriveClient()
  const deal = await client.updateDeal(id, dealData)
  // We would need to map the updated deal here
  throw new Error('Update deal mapping not implemented yet')
}

/**
 * Service function to update an existing lead
 */
export async function updateLeadService(id: string, leadData: Record<string, any>): Promise<StandardLead> {
  const client = new PipedriveClient()
  const lead = await client.updateLead(id, leadData)
  // We would need to map the updated lead here
  throw new Error('Update lead mapping not implemented yet')
}