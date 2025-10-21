"use client"

import { Table } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, DollarOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useState, useMemo, useEffect } from "react"
import { getLeadsClientService } from "@/lib/pipedrive/client-service"
import type { StandardLead } from "@/lib/pipedrive/mapping"
import { TableSkeleton } from "@/components/ui/table-skeleton"

interface ActiveLeadsTableProps {
  searchText: string
  yearFilter: string
  statusFilter: string
}

export function ActiveLeadsTable({
  searchText,
  yearFilter,
  statusFilter
}: ActiveLeadsTableProps) {
  // Fixed page size for active leads
  const [pageSize] = useState(10)
  // Load more pagination state
  const [nextStart, setNextStart] = useState<number | string>(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [allLoadedLeads, setAllLoadedLeads] = useState<StandardLead[]>([])

  // Initial load for active leads
  useEffect(() => {
    let mounted = true
    async function loadInitialData() {
      setLoading(true)
      try {
        const standardResponse = await getLeadsClientService({
          page: 1,
          pageSize,
        })
        
        if (!mounted) return
        
        setAllLoadedLeads(standardResponse.data)
        setHasMore(standardResponse.pagination.hasMore)
        
        // Handle nextStart from response
        const responseNextStart = standardResponse.pagination.nextStart
        if (responseNextStart !== undefined) {
          setNextStart(responseNextStart)
        } else {
          setNextStart(pageSize)
        }
      } catch (e) {
        console.error('Leads Service Error:', e)
        if (mounted) {
          setAllLoadedLeads([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadInitialData()
    return () => {
      mounted = false
    }
  }, [pageSize]) // Reload when page size changes

  // Load more function
  const loadMoreData = async () => {
    if (!hasMore || loadingMore) return
    
    setLoadingMore(true)
    try {
      const nextStartNum = typeof nextStart === 'string' ? parseInt(nextStart) : nextStart
      const currentPage = Math.floor(nextStartNum / pageSize) + 1
      const standardResponse = await getLeadsClientService({
        page: currentPage,
        pageSize,
        start: nextStartNum,
      })
      
      const newLeadData = standardResponse.data
      const updatedLeads = [...allLoadedLeads, ...newLeadData]
      
      setAllLoadedLeads(updatedLeads)
      setHasMore(standardResponse.pagination.hasMore)
      
      // Handle nextStart calculation
      const responseNextStart = standardResponse.pagination.nextStart
      if (responseNextStart !== undefined) {
        setNextStart(responseNextStart)
      } else {
        setNextStart(nextStartNum + pageSize)
      }
    } catch (e) {
      console.error('Load More Leads Error:', e)
    } finally {
      setLoadingMore(false)
    }
  }

  // combine remote data with client-side filters
  const filteredData = useMemo(() => {
    const source = allLoadedLeads
    
    const filtered = source.filter((lead: StandardLead) => {
      const matchesSearch =
        searchText === "" ||
        lead.title.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.contact.email.toLowerCase().includes(searchText.toLowerCase())

      // Fix date parsing
      let leadYear: number
      try {
        leadYear = lead.dates.created.getFullYear()
      } catch {
        leadYear = new Date().getFullYear() // fallback to current year
      }
      
      const currentYear = new Date().getFullYear()
      const matchesYear =
        yearFilter === "This year"
          ? leadYear === currentYear
          : yearFilter === "Last year"
            ? leadYear === currentYear - 1
            : yearFilter === "All years"
              ? true
              : true

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter

      return matchesSearch && matchesYear && matchesStatus
    })
    
    return filtered
  }, [searchText, yearFilter, statusFilter, allLoadedLeads])

  const expandedRowRender = (record: StandardLead) => {
    return (
      <div className="px-8 py-6">
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <UserOutlined className="text-gray-400 mt-1" />
              <div>
                <div className="text-xs text-gray-500">Contact</div>
                <div className="font-medium">{record.contact.name}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MailOutlined className="text-gray-400 mt-1" />
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{record.contact.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <PhoneOutlined className="text-gray-400 mt-1" />
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium">{record.contact.phone}</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <DollarOutlined className="text-gray-400 mt-1" />
              <div>
                <div className="text-xs text-gray-500">Expected Value</div>
                <div className="font-medium">{record.formattedValue}</div>
              </div>
            </div>
            {record.expectedCloseDate && (
              <div className="flex items-start gap-2">
                <CalendarOutlined className="text-gray-400 mt-1" />
                <div>
                  <div className="text-xs text-gray-500">Expected Close Date</div>
                  <div className="font-medium">{record.expectedCloseDate.toLocaleDateString()}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="text-gray-400 mt-1">🏢</div>
              <div>
                <div className="text-xs text-gray-500">Organization</div>
                <div className="font-medium">{record.organization.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const columns: ColumnsType<StandardLead> = [
    {
      title: "Lead Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Value",
      dataIndex: "formattedValue",
      key: "value",
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: "Contact",
      dataIndex: ["contact", "name"],
      key: "contact",
      sorter: (a, b) => a.contact.name.localeCompare(b.contact.name),
    },
    {
      title: "Created Date",
      dataIndex: ["dates", "created"],
      key: "created",
      render: (date: Date) => date.toLocaleDateString(),
      sorter: (a, b) => a.dates.created.getTime() - b.dates.created.getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorClass = status === "active" ? "bg-blue-500" : "bg-gray-400"
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`} />
            <span className="text-gray-800 capitalize">{status}</span>
          </div>
        )
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {loading ? (
            "Loading leads..."
          ) : (
            <>
              Showing {filteredData.length} leads
              {allLoadedLeads.length > 0 && (
                <span> (loaded {allLoadedLeads.length} of all available)</span>
              )}
            </>
          )}
        </div>
      </div>
      {loading ? (
        <TableSkeleton rows={pageSize} columns={5} />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={false}
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
            }}
            pagination={false}
            rowKey="id"
          />
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreData}
                disabled={loadingMore}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading more...
                  </>
                ) : (
                  `Load ${pageSize} more leads`
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}