/**
 * Unified TypeScript types for Pipedrive API responses
 * Includes both Deals and Leads with shared structures
 */

export interface PipedriveUser {
  id: number
  name: string
  email: string
  has_pic: number
  pic_hash: string | null
  active_flag: boolean
  value: number
}

export interface PipedriveEmailPhone {
  label: string
  value: string
  primary: boolean
}

export interface PipedrivePerson {
  active_flag: boolean
  name: string
  email: PipedriveEmailPhone[]
  phone: PipedriveEmailPhone[]
  owner_id: number
  company_id: number
  value: number
}

export interface PipedriveOrganization {
  name: string
  people_count: number
  owner_id: number
  address: string | null
  label_ids: number[]
  active_flag: boolean
  cc_email: string
  owner_name: string
  value: number
}

export interface PipedriveStage {
  id: number
  order_nr: number
  name: string
  active_flag: boolean
  deal_probability: number
  pipeline_id: number
  rotten_flag: boolean
  rotten_days: number | null
  add_time: string
  update_time: string | null
  pipeline_name: string
  pipeline_deal_probability: boolean
}

// Deals interface
export interface PipedriveDeal {
  id: number
  creator_user_id: PipedriveUser
  user_id: PipedriveUser
  person_id: PipedrivePerson
  org_id: PipedriveOrganization
  stage_id: number
  title: string
  value: number
  acv: number | null
  mrr: number | null
  arr: number | null
  currency: string
  add_time: string
  update_time: string
  stage_change_time: string
  active: boolean
  deleted: boolean
  status: 'open' | 'won' | 'lost'
  probability: number | null
  next_activity_date: string | null
  next_activity_time: string | null
  next_activity_id: number | null
  last_activity_id: number | null
  last_activity_date: string | null
  lost_reason: string | null
  visible_to: string
  close_time: string | null
  pipeline_id: number
  won_time: string | null
  first_won_time: string | null
  lost_time: string | null
  products_count: number
  files_count: number
  notes_count: number
  followers_count: number
  email_messages_count: number
  activities_count: number
  done_activities_count: number
  undone_activities_count: number
  participants_count: number
  expected_close_date: string | null
  last_incoming_mail_time: string | null
  last_outgoing_mail_time: string | null
  label: string | null
  local_won_date: string | null
  local_lost_date: string | null
  local_close_date: string | null
  origin: string
  origin_id: string | null
  channel: string | null
  channel_id: string | null
  is_archived: boolean
  archive_time: string | null
  sequence_enrollment: any | null
  stage_order_nr: number
  person_name: string
  org_name: string
  next_activity_subject: string | null
  next_activity_type: string | null
  next_activity_duration: string | null
  next_activity_note: string | null
  formatted_value: string
  weighted_value: number
  formatted_weighted_value: string
  weighted_value_currency: string
  rotten_time: string | null
  acv_currency: string | null
  mrr_currency: string | null
  arr_currency: string | null
  owner_name: string
  cc_email: string
  org_hidden: boolean
  person_hidden: boolean
  // Custom fields (these are the long hash keys in the response)
  [key: string]: any
}

// Leads interface (can use most of the same structure as deals)
export interface PipedriveLead {
  id: string  // UUID format for leads
  title: string
  owner_id: number
  creator_id: number
  label_ids?: number[]
  person_id?: number
  organization_id?: number
  value?: {
    amount: number
    currency: string
  }
  expected_close_date?: string
  visible_to?: string
  was_seen: boolean
  is_archived?: boolean
  source_name?: string
  origin?: string
  origin_id?: string
  channel?: number
  channel_id?: string
  add_time: string
  update_time: string
  // Person and organization details if included
  person_name?: string
  person?: {
    id: number
    name: string
    email: Array<{ label: string; value: string; primary: boolean }>
    phone: Array<{ label: string; value: string; primary: boolean }>
  }
  org_name?: string
  organization?: {
    id: number
    name: string
    address?: string
  }
  owner_name?: string
  owner?: {
    id: number
    name: string
    email: string
  }
}

// Shared pagination interfaces
export interface PipedrivePagination {
  start: number
  limit: number
  more_items_in_collection: boolean
  next_start?: number
  total_items?: number
}

export interface PipedriveCursorPagination {
  next_cursor: string | null
}

// Generic list response that works for both deals and leads
export interface PipedriveListResponse<T> {
  success: boolean
  data: T[]
  additional_data?: {
    pagination?: PipedrivePagination // v1 API
    next_cursor?: string | null      // v2 API
  }
  related_objects?: {
    user?: Record<string, PipedriveUser>
    organization?: Record<string, PipedriveOrganization>
    person?: Record<string, PipedrivePerson>
    stage?: Record<string, PipedriveStage>
  }
}

// Specific response types
export type PipedriveDealListResponse = PipedriveListResponse<PipedriveDeal>
export type PipedriveLeadListResponse = PipedriveListResponse<PipedriveLead>

export interface PipedriveDealResponse {
  success: boolean
  data: PipedriveDeal
}

export interface PipedriveLeadResponse {
  success: boolean
  data: PipedriveLead
}

// Generic API response wrapper
export interface PipedriveAPIResponse<T> {
  ok: boolean
  payload?: T
  error?: string
}