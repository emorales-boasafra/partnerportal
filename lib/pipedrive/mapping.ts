/**
 * Unified mapping functions to convert Pipedrive API responses to standardized formats
 * Handles both Deals and Leads
 */

import type { PipedriveDeal, PipedriveLead, PipedriveListResponse } from './types'
import type { LeadData } from '../mock-data'

// Unified standardized types that work for both deals and leads
export interface StandardItem {
  id: string
  title: string
  value: number
  formattedValue: string
  currency: string
  status: 'open' | 'won' | 'lost' | 'active' | 'archived' | 'converted'
  expectedCloseDate?: Date
  stage?: {
    id: number
    name: string
    orderNumber: number
  }
  dates: {
    created: Date
    updated: Date
    stageChanged?: Date
    closed?: Date
  }
  contact: {
    name: string
    email: string
    phone: string
  }
  organization: {
    name: string
    address?: string
  }
  owner: {
    name: string
    email: string
  }
  activities?: {
    total: number
    done: number
    pending: number
  }
  metadata: {
    isActive?: boolean
    isArchived: boolean
    wasSeen?: boolean
    source?: string
    origin: string
    channel?: string
    pipeline?: number
  }
}

// Type aliases for clarity
export type StandardDeal = StandardItem
export type StandardLead = StandardItem

export interface StandardPaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    pageSize: number
    nextPage?: number
    hasMore: boolean
    totalCount?: number // Optional for deals, estimated for leads
    // For load more pattern
    loadedItems: number
    nextStart?: number | string // Support both offset (v1) and cursor (v2)
    nextCursor?: string // Explicit cursor for v2 API
  }
}

/**
 * Get primary email from Pipedrive person email array
 */
function getPrimaryEmail(emails: Array<{ label: string; value: string; primary: boolean }> | undefined): string {
  if (!Array.isArray(emails)) return ''
  const primary = emails.find(e => e.primary)
  return primary?.value || emails[0]?.value || ''
}

/**
 * Get primary phone from Pipedrive person phone array
 */
function getPrimaryPhone(phones: Array<{ label: string; value: string; primary: boolean }> | undefined): string {
  if (!Array.isArray(phones)) return ''
  const primary = phones.find(p => p.primary)
  return primary?.value || phones[0]?.value || ''
}

/**
 * Map Pipedrive deal to StandardDeal
 */
export function mapPipedriveDealToStandard(deal: PipedriveDeal, stageInfo?: { id: number; name: string }): StandardDeal {
  // Use stage info if provided, otherwise create a fallback
  const stageName = stageInfo?.name || `Stage ${deal.stage_id}`
  
  return {
    id: String(deal.id),
    title: deal.title || 'Untitled Deal',
    value: deal.value || 0,
    formattedValue: deal.formatted_value || `${deal.currency || 'USD'} ${deal.value || 0}`,
    currency: deal.currency || 'USD',
    status: deal.status,
    expectedCloseDate: deal.expected_close_date ? new Date(deal.expected_close_date) : undefined,
    stage: {
      id: deal.stage_id,
      name: stageName,
      orderNumber: deal.stage_order_nr || 0,
    },
    dates: {
      created: new Date(deal.add_time),
      updated: new Date(deal.update_time),
      stageChanged: new Date(deal.stage_change_time),
      closed: deal.close_time ? new Date(deal.close_time) : undefined,
    },
    contact: {
      name: deal.person_name || 'Unknown Contact',
      email: getPrimaryEmail(deal.person_id?.email),
      phone: getPrimaryPhone(deal.person_id?.phone),
    },
    organization: {
      name: deal.org_name || 'Unknown Organization',
      address: deal.org_id?.address || undefined,
    },
    owner: {
      name: deal.owner_name || 'Unknown Owner',
      email: deal.user_id?.email || '',
    },
    activities: {
      total: deal.activities_count || 0,
      done: deal.done_activities_count || 0,
      pending: deal.undone_activities_count || 0,
    },
    metadata: {
      isActive: deal.active,
      isArchived: deal.is_archived,
      origin: deal.origin || 'Unknown',
      pipeline: deal.pipeline_id,
    },
  }
}

/**
 * Map Pipedrive lead to StandardLead
 */
export function mapPipedriveLeadToStandard(lead: PipedriveLead): StandardLead {
  const leadValue = lead.value?.amount || 0
  const currency = lead.value?.currency || 'USD'
  
  return {
    id: lead.id,
    title: lead.title || 'Untitled Lead',
    value: leadValue,
    formattedValue: `${currency} ${leadValue.toLocaleString()}`,
    currency: currency,
    status: lead.is_archived ? 'archived' : 'active',
    expectedCloseDate: lead.expected_close_date ? new Date(lead.expected_close_date) : undefined,
    dates: {
      created: new Date(lead.add_time),
      updated: new Date(lead.update_time),
    },
    contact: {
      name: lead.person_name || lead.person?.name || 'Unknown Contact',
      email: getPrimaryEmail(lead.person?.email),
      phone: getPrimaryPhone(lead.person?.phone),
    },
    organization: {
      name: lead.org_name || lead.organization?.name || 'Unknown Organization',
      address: lead.organization?.address || undefined,
    },
    owner: {
      name: lead.owner_name || lead.owner?.name || 'Unknown Owner',
      email: lead.owner?.email || '',
    },
    metadata: {
      isArchived: lead.is_archived || false,
      wasSeen: lead.was_seen,
      source: lead.source_name || 'Unknown',
      origin: lead.origin || 'API',
      channel: lead.channel_id || undefined,
    },
  }
}

/**
 * Map StandardDeal to LeadData (for backward compatibility)
 */
export function mapStandardDealToLeadData(deal: StandardDeal): LeadData {
  // Create basic progress stages
  const allStages = [
    'Contact Form Submitted',
    'Request for Services Submitted', 
    'Agreement Sent',
    'Service Contract Under Review',
    'Soil Data Collection',
    'Analyst Team',
    'Report Complete/Not Paid',
    'Won'
  ]

  const currentStageIndex = Math.min(deal.stage?.orderNumber || 0, allStages.length - 1)
  
  const progress = {
    stages: allStages.map((stageName, index) => ({
      name: stageName,
      completed: index < currentStageIndex,
      current: index === currentStageIndex,
      date: index <= currentStageIndex ? deal.dates.created.toLocaleDateString() : undefined,
    }))
  }

  // Determine stage color based on status
  let stageColor = 'blue'
  if (deal.status === 'won') stageColor = 'green'
  else if (deal.status === 'lost') stageColor = 'red'
  else if ((deal.stage?.orderNumber || 0) > 3) stageColor = 'orange'
  else if ((deal.stage?.orderNumber || 0) > 1) stageColor = 'purple'

  return {
    key: deal.id,
    leadName: deal.title,
    acres: '-', // We'll map this from custom fields later
    submissionDate: deal.dates.created.toLocaleDateString(),
    stage: deal.stage?.name || 'Unknown Stage',
    stageColor,
    contact: deal.contact,
    progress,
  }
}

/**
 * Map Pipedrive deals list response to StandardPaginatedResponse
 */
export function mapPipedriveDealsListResponse(
  response: PipedriveListResponse<PipedriveDeal>,
  currentPage: number,
  pageSize: number
): StandardPaginatedResponse<StandardDeal> {
  // Extract stage information from related_objects
  const stagesMap = new Map<number, { id: number; name: string }>()
  if (response.related_objects?.stage) {
    Object.values(response.related_objects.stage).forEach(stage => {
      stagesMap.set(stage.id, { id: stage.id, name: stage.name })
    })
  }
  
  const deals = (response.data || []).map(deal => {
    const stageInfo = stagesMap.get(deal.stage_id)
    return mapPipedriveDealToStandard(deal, stageInfo)
  })
  
  const pagination = response.additional_data?.pagination
  const hasMore = pagination?.more_items_in_collection || false
  const nextCursor = response.additional_data?.next_cursor
  const nextStart = pagination?.next_start
  
  return {
    data: deals,
    pagination: {
      currentPage,
      pageSize,
      nextPage: hasMore ? currentPage + 1 : undefined,
      hasMore,
      totalCount: pagination?.total_items,
      loadedItems: deals.length,
      nextStart: nextCursor || nextStart, // Support both cursor and offset
      nextCursor: nextCursor || undefined, // Explicit cursor field
    },
  }
}

/**
 * Map Pipedrive leads list response to StandardPaginatedResponse
 */
export function mapPipedriveLeadsListResponse(
  response: PipedriveListResponse<PipedriveLead>,
  currentPage: number,
  pageSize: number
): StandardPaginatedResponse<StandardLead> {
  const leads = (response.data || []).map(lead => mapPipedriveLeadToStandard(lead))
  
  const pagination = response.additional_data?.pagination
  const hasMore = pagination?.more_items_in_collection || false
  const nextStart = pagination?.next_start
  
  return {
    data: leads,
    pagination: {
      currentPage,
      pageSize,
      nextPage: hasMore ? currentPage + 1 : undefined,
      hasMore,
      totalCount: hasMore ? leads.length * 10 : leads.length, // Estimate since API doesn't provide total
      loadedItems: leads.length,
      nextStart: nextStart, // Support offset-based pagination
    },
  }
}

/**
 * Map StandardPaginatedResponse to LeadData array (for backward compatibility)
 */
export function mapStandardResponseToLeadData(
  response: StandardPaginatedResponse<StandardDeal>
): LeadData[] {
  return response.data.map(mapStandardDealToLeadData)
}