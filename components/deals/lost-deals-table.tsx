"use client"

import { Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { type LeadData } from "@/lib/mock-data"
import { useState, useMemo, useEffect } from "react"
import { getDealsClientService } from "@/lib/pipedrive/client-service"
import { mapStandardResponseToLeadData } from "@/lib/pipedrive/mapping"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { DealExpandedRow } from "./deal-expanded-row"

interface LostDealsTableProps {
  searchText: string
  yearFilter: string
  stageFilter: string
  pageSize: number
  onPageSizeChange: (value: number) => void
}

export function LostDealsTable({
  searchText,
  yearFilter,
  stageFilter,
  pageSize,
  onPageSizeChange
}: LostDealsTableProps) {
  // Lost deals state
  const [lostDeals, setLostDeals] = useState<LeadData[]>([])
  const [lostLoading, setLostLoading] = useState(false)
  const [lostLoadingMore, setLostLoadingMore] = useState(false)
  const [lostHasMore, setLostHasMore] = useState(true)
  const [lostNextStart, setLostNextStart] = useState<number | string>(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load lost deals when component mounts
  useEffect(() => {
    if (!isInitialized) {
      loadLostDeals()
      setIsInitialized(true)
    }
  }, [])

  // Reload when page size changes
  useEffect(() => {
    if (isInitialized) {
      setLostDeals([])
      setLostNextStart(0)
      setLostHasMore(true)
      loadLostDeals()
    }
  }, [pageSize])

  // Load lost deals - initial load
  const loadLostDeals = async () => {
    if (lostDeals.length > 0 && isInitialized) return // Already loaded
    
    setLostLoading(true)
    try {
      const response = await getDealsClientService({ 
        page: 1, 
        pageSize: pageSize, 
        status: 'lost'
      })
      
      const mappedDeals = mapStandardResponseToLeadData(response)
      setLostDeals(mappedDeals)
      setLostHasMore(response.pagination.hasMore)
      
      // Set next start position
      const nextStart = response.pagination.nextStart || pageSize
      setLostNextStart(nextStart)
      
    } catch (e) {
      console.error('Lost Deals Error:', e)
      setLostDeals([])
    } finally {
      setLostLoading(false)
    }
  }

  // Load more lost deals
  const loadMoreLostDeals = async () => {
    if (!lostHasMore || lostLoadingMore) return
    
    setLostLoadingMore(true)
    try {
      const nextStartNum = typeof lostNextStart === 'string' ? parseInt(lostNextStart) : lostNextStart
      const currentPage = Math.floor(nextStartNum / pageSize) + 1
      
      const response = await getDealsClientService({
        page: currentPage,
        pageSize: pageSize,
        start: nextStartNum,
        status: 'lost'
      })
      
      const newDealData = mapStandardResponseToLeadData(response)
      const updatedDeals = [...lostDeals, ...newDealData]
      
      setLostDeals(updatedDeals)
      setLostHasMore(response.pagination.hasMore)
      
      // Update next start position
      const responseNextStart = response.pagination.nextStart
      if (responseNextStart !== undefined) {
        setLostNextStart(responseNextStart)
      } else {
        setLostNextStart(nextStartNum + pageSize)
      }
      
    } catch (e) {
      console.error('Load More Lost Deals Error:', e)
    } finally {
      setLostLoadingMore(false)
    }
  }

  // combine remote data with client-side filters
  const filteredData = useMemo(() => {
    const source = lostDeals
    
    const filtered = source.filter((deal: LeadData) => {
      const matchesSearch =
        searchText === "" ||
        deal.leadName.toLowerCase().includes(searchText.toLowerCase()) ||
        deal.contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
        deal.contact.email.toLowerCase().includes(searchText.toLowerCase())

      // Fix date parsing
      let dealYear: number
      try {
        dealYear = new Date(deal.submissionDate).getFullYear()
      } catch {
        dealYear = new Date().getFullYear() // fallback to current year
      }
      
      const currentYear = new Date().getFullYear()
      const matchesYear =
        yearFilter === "This year"
          ? dealYear === currentYear
          : yearFilter === "Last year"
            ? dealYear === currentYear - 1
            : yearFilter === "All years"
              ? true
              : true

      const matchesStage = stageFilter === "All" || deal.stage === stageFilter

      return matchesSearch && matchesYear && matchesStage
    })
    
    return filtered
  }, [searchText, yearFilter, stageFilter, lostDeals])

  const expandedRowRender = (record: LeadData) => {
    return <DealExpandedRow record={record} />
  }

  const columns: ColumnsType<LeadData> = [
    {
      title: "Deal Name",
      dataIndex: "leadName",
      key: "leadName",
      sorter: (a, b) => a.leadName.localeCompare(b.leadName),
    },
    {
      title: "Contact",
      dataIndex: ["contact", "name"],
      key: "contact",
      sorter: (a, b) => a.contact.name.localeCompare(b.contact.name),
    },
    {
      title: "Acres",
      dataIndex: "acres",
      key: "acres",
      sorter: (a, b) => {
        const aNum = parseFloat(a.acres.replace(/[^\d.-]/g, '')) || 0
        const bNum = parseFloat(b.acres.replace(/[^\d.-]/g, '')) || 0
        return aNum - bNum
      },
    },
    {
      title: "Submission Date",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime(),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      render: (stage: string, record: LeadData) => (
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full bg-red-500`} />
          <span className="text-gray-800">{stage}</span>
        </div>
      ),
      sorter: (a, b) => a.stage.localeCompare(b.stage),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {lostLoading ? (
            "Loading lost deals..."
          ) : (
            <>
              Showing {filteredData.length} lost deals
              {lostDeals.length > 0 && (
                <span> (loaded {lostDeals.length} of all available)</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = Number(e.target.value)
              onPageSizeChange(newPageSize)
              // Reset data when page size changes
              setLostDeals([])
              setLostNextStart(0)
              setLostHasMore(true)
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
      {lostLoading ? (
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
            rowKey="key"
          />
          {lostHasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreLostDeals}
                disabled={lostLoadingMore}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lostLoadingMore ? (
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