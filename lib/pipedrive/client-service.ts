/**
 * Unified client-side service functions for calling Pipedrive API routes
 * Handles both Deals and Leads from React components (client-side)
 */

import type { PipedriveAPIResponse, PipedriveDealListResponse, PipedriveLeadListResponse } from './types'
import type { StandardDeal, StandardLead, StandardPaginatedResponse } from './mapping'
import { mapPipedriveDealsListResponse, mapPipedriveLeadsListResponse, mapStandardResponseToLeadData } from './mapping'

export interface DealsListParams {
  page?: number
  pageSize?: number
  start?: number  // Changed from cursor to start for v1 API
  status?: 'open' | 'won' | 'lost' | 'all_not_deleted' | string
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
 * Client-side service to get paginated deals
 * Calls the API route and maps the response
 */
export async function getDealsClientService(params: DealsListParams = {}): Promise<StandardPaginatedResponse<StandardDeal>> {
  const { page = 1, pageSize = 10, start, status } = params
  
  let url = `/api/pipedrive/deals?limit=${pageSize}`
  if (start) {
    url += `&start=${start}`
  }
  if (status) {
    // Handle single status string
    url += `&status=${encodeURIComponent(status)}`
  }
  
  const res = await fetch(url)
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const apiResponse: PipedriveAPIResponse<PipedriveDealListResponse> = await res.json()
  
  if (!apiResponse.ok || !apiResponse.payload) {
    throw new Error(apiResponse.error || 'Failed to fetch deals')
  }
  
  return mapPipedriveDealsListResponse(apiResponse.payload, page, pageSize)
}

/**
 * Client-side service to get paginated leads
 * Calls the API route and maps the response
 */
export async function getLeadsClientService(params: LeadsListParams = {}): Promise<StandardPaginatedResponse<StandardLead>> {
  const { page = 1, pageSize = 10, start, owner_id, person_id, organization_id, filter_id } = params
  
  // Always use active leads endpoint
  const endpoint = '/api/pipedrive/leads'
  
  let url = `${endpoint}?limit=${pageSize}`
  if (start) {
    url += `&start=${start}`
  }
  if (owner_id) {
    url += `&owner_id=${owner_id}`
  }
  if (person_id) {
    url += `&person_id=${person_id}`
  }
  if (organization_id) {
    url += `&organization_id=${organization_id}`
  }
  if (filter_id) {
    url += `&filter_id=${filter_id}`
  }
  
  const res = await fetch(url)
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const apiResponse: PipedriveAPIResponse<PipedriveLeadListResponse> = await res.json()
  
  if (!apiResponse.ok || !apiResponse.payload) {
    throw new Error(apiResponse.error || 'Failed to fetch leads')
  }
  
  return mapPipedriveLeadsListResponse(apiResponse.payload, page, pageSize)
}

/**
 * Client-side service to get a single deal by ID
 */
export async function getDealClientService(id: number | string): Promise<StandardDeal> {
  const res = await fetch(`/api/pipedrive/deals/${id}`)
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const apiResponse = await res.json()
  
  if (!apiResponse.ok) {
    throw new Error(apiResponse.error || 'Failed to fetch deal')
  }
  
  // We would need to implement single deal mapping here
  throw new Error('Single deal fetching not implemented yet')
}

/**
 * Client-side service to get a single lead by ID
 */
export async function getLeadClientService(id: string): Promise<StandardLead> {
  const res = await fetch(`/api/pipedrive/leads/${id}`)
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const apiResponse = await res.json()
  
  if (!apiResponse.ok) {
    throw new Error(apiResponse.error || 'Failed to fetch lead')
  }
  
  // We would need to implement single lead mapping here
  throw new Error('Single lead fetching not implemented yet')
}

// Export the backward compatibility function for LeadData
export { mapStandardResponseToLeadData }