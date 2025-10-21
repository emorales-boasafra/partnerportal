"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Tabs } from "antd"
import { useState, useMemo } from "react"
import { DealsFilters } from "@/components/deals/deals-filters"
import { ActiveDealsTable } from "@/components/deals/active-deals-table"
import { CompletedDealsTable } from "@/components/deals/completed-deals-table"
import { LostDealsTable } from "@/components/deals/lost-deals-table"

export default function DealsPage() {
  // Shared filter state
  const [searchText, setSearchText] = useState("")
  const [yearFilter, setYearFilter] = useState("All years")
  const [stageFilter, setStageFilter] = useState("All")
  const [activePageSize, setActivePageSize] = useState(10)
  const [completedPageSize, setCompletedPageSize] = useState(10)
  const [lostPageSize, setLostPageSize] = useState(10)

  // Actual stages from the Pipedrive API - can be expanded in the future
  const availableStages = useMemo(() => {
    return [
      "Inbound Calls",           // order_nr: 0
      "Contact Us Forms",        // order_nr: 1  
      "Invitation Email",        // order_nr: 2
      "RFS Submitted",           // order_nr: 3
      "DocuSign",                // order_nr: 4
      "Soil Team",               // order_nr: 5
      "Analyst Team",            // order_nr: 6
      "Report Complete",         // order_nr: 7
      "Report Review NOT PAID",  // order_nr: 8
      "Paid Accounts"            // order_nr: 9
    ]
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Deals Management</h1>
          <p className="text-gray-600">Track and manage your sales deals through their pipeline stages</p>
        </div>

        <DealsFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          yearFilter={yearFilter}
          onYearChange={setYearFilter}
          stageFilter={stageFilter}
          onStageChange={setStageFilter}
          availableStages={availableStages}
        />

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Active Deals",
              children: (
                <ActiveDealsTable
                  searchText={searchText}
                  yearFilter={yearFilter}
                  stageFilter={stageFilter}
                  pageSize={activePageSize}
                  onPageSizeChange={setActivePageSize}
                />
              ),
            },
            {
              key: "2",
              label: "Completed",
              children: (
                <CompletedDealsTable
                  searchText={searchText}
                  yearFilter={yearFilter}
                  stageFilter={stageFilter}
                  pageSize={completedPageSize}
                  onPageSizeChange={setCompletedPageSize}
                />
              ),
            },
            {
              key: "3",
              label: "Lost",
              children: (
                <LostDealsTable
                  searchText={searchText}
                  yearFilter={yearFilter}
                  stageFilter={stageFilter}
                  pageSize={lostPageSize}
                  onPageSizeChange={setLostPageSize}
                />
              ),
            },
          ]}
        />
      </main>
      <Footer />
    </div>
  )
}