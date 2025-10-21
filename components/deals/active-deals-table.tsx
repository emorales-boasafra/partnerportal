"use client"

import { Table } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { type LeadData } from "@/lib/mock-data"
import { useState, useMemo, useEffect } from "react"
import { getDealsClientService } from "@/lib/pipedrive/client-service"
import { mapStandardResponseToLeadData } from "@/lib/pipedrive/mapping"
import { TableSkeleton } from "@/components/ui/table-skeleton"

interface ActiveDealsTableProps {
  searchText: string
  yearFilter: string
  stageFilter: string
  pageSize: number
  onPageSizeChange: (value: number) => void
}

export function ActiveDealsTable({
  searchText,
  yearFilter,
  stageFilter,
  pageSize,
  onPageSizeChange
}: ActiveDealsTableProps) {
  // Load more pagination state
  const [nextStart, setNextStart] = useState<number | string>(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [allLoadedDeals, setAllLoadedDeals] = useState<LeadData[]>([])

  // Initial load for active deals
  useEffect(() => {
    let mounted = true
    async function loadInitialData() {
      setLoading(true)
      try {
        const standardResponse = await getDealsClientService({
          page: 1,
          pageSize,
          status: 'open'
        })
        
        if (!mounted) return
        
        const leadDataArray = mapStandardResponseToLeadData(standardResponse)
        setAllLoadedDeals(leadDataArray)
        setHasMore(standardResponse.pagination.hasMore)
        
        // Handle nextStart from response
        const responseNextStart = standardResponse.pagination.nextStart
        if (responseNextStart !== undefined) {
          setNextStart(responseNextStart)
        } else {
          setNextStart(pageSize)
        }
      } catch (e) {
        console.error('Service Error:', e)
        if (mounted) {
          setAllLoadedDeals([])
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
      const standardResponse = await getDealsClientService({
        page: currentPage,
        pageSize,
        start: nextStartNum,
        status: 'open'
      })
      
      const newLeadData = mapStandardResponseToLeadData(standardResponse)
      const updatedDeals = [...allLoadedDeals, ...newLeadData]
      
      setAllLoadedDeals(updatedDeals)
      setHasMore(standardResponse.pagination.hasMore)
      
      // Handle nextStart calculation
      const responseNextStart = standardResponse.pagination.nextStart
      if (responseNextStart !== undefined) {
        setNextStart(responseNextStart)
      } else {
        setNextStart(nextStartNum + pageSize)
      }
    } catch (e) {
      console.error('Load More Error:', e)
    } finally {
      setLoadingMore(false)
    }
  }

  // combine remote data with client-side filters
  const filteredData = useMemo(() => {
    const source = allLoadedDeals
    
    const filtered = source.filter((lead: LeadData) => {
      const matchesSearch =
        searchText === "" ||
        lead.leadName.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.contact.email.toLowerCase().includes(searchText.toLowerCase())

      // Fix date parsing
      let leadYear: number
      try {
        leadYear = new Date(lead.submissionDate).getFullYear()
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

      const matchesStage = stageFilter === "All" || lead.stage === stageFilter

      return matchesSearch && matchesYear && matchesStage
    })
    
    return filtered
  }, [searchText, yearFilter, stageFilter, allLoadedDeals])

  const expandedRowRender = (record: LeadData) => {
    if (!record.progress) return null

    const completedStages = record.progress.stages.filter((s) => s.completed).length
    const totalStages = record.progress.stages.length
    const currentIndex = record.progress.stages.findIndex((s) => s.current)
    const nextIndex = currentIndex >= 0 && currentIndex + 1 < totalStages ? currentIndex + 1 : -1

    return (
      <div className="px-8 py-6">
        <div className="mb-6 grid grid-cols-3 gap-8">
          <div className="flex items-start gap-2">
            <UserOutlined className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Contact</div>
              <div className="font-medium">{record.contact.name}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MailOutlined className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-medium">{record.contact.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <PhoneOutlined className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Phone</div>
              <div className="font-medium">{record.contact.phone}</div>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Segmented progress bar: completed = green, next = dark gray, future = light gray */}
          <div
            className="mb-4 grid h-2 w-full overflow-hidden rounded-full"
            style={{ gridTemplateColumns: `repeat(${totalStages}, minmax(0, 1fr))`, gap: 2 }}
          >
            {record.progress.stages.map((_, i) => (
              <div
                key={i}
                className={
                  i < completedStages
                    ? "bg-green-600"
                    : i === nextIndex
                      ? "bg-gray-400"
                      : "bg-gray-200"
                }
              />
            ))}
          </div>
          <div className="flex justify-between">
            {record.progress.stages.map((stage, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ width: `${100 / record.progress!.stages.length}%` }}
              >
                <div className="mb-2">
                  {stage.completed ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                      ✓
                    </div>
                  ) : stage.current ? (
                    <div className="h-5 w-5 rounded-full border-4 border-green-600 bg-white" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white" />
                  )}
                </div>
                <div className="text-center text-xs font-medium text-gray-700">{stage.name}</div>
                {stage.date && <div className="text-xs text-gray-500">{stage.date}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const columns: ColumnsType<LeadData> = [
    {
      title: "Lead Name",
      dataIndex: "leadName",
      key: "leadName",
      sorter: (a, b) => a.leadName.localeCompare(b.leadName),
    },
    {
      title: "Acres",
      dataIndex: "acres",
      key: "acres",
      sorter: (a, b) => {
        const aNum = Number.parseInt(a.acres.replace(/[^0-9]/g, ""))
        const bNum = Number.parseInt(b.acres.replace(/[^0-9]/g, ""))
        return aNum - bNum
      },
    },
    {
      title: "Submission Date",
      dataIndex: "submissionDate",
      key: "submissionDate",
      sorter: (a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime(),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (stage: string, record: LeadData) => {
        const colorClass =
          record.stageColor === "blue"
            ? "bg-blue-500"
            : record.stageColor === "purple"
              ? "bg-purple-600"
              : record.stageColor === "orange"
                ? "bg-amber-600"
                : "bg-gray-400"
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`} />
            <span className="text-gray-800">{stage}</span>
          </div>
        )
      },
      sorter: (a, b) => a.stage.localeCompare(b.stage),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {loading ? (
            "Loading deals..."
          ) : (
            <>
              Showing {filteredData.length} deals
              {allLoadedDeals.length > 0 && (
                <span> (loaded {allLoadedDeals.length} of all available)</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Items per load:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = Number(e.target.value)
              onPageSizeChange(newPageSize)
              // Reset data when page size changes
              setAllLoadedDeals([])
              setNextStart(0)
              setHasMore(true)
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {loading ? (
        <TableSkeleton rows={pageSize} columns={4} />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={false}
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: ["1"],
            }}
            pagination={false}
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
                  `Load ${pageSize} more deals`
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}