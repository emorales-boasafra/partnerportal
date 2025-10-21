"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Tabs } from "antd"
import { useState, useMemo } from "react"
import { DealsFilters } from "@/components/deals/deals-filters"
import { ActiveDealsTable } from "@/components/deals/active-deals-table"
import { CompletedDealsTable } from "@/components/deals/completed-deals-table"

export default function DealsPage() {
  // Shared filter state
  const [searchText, setSearchText] = useState("")
  const [yearFilter, setYearFilter] = useState("All years")
  const [stageFilter, setStageFilter] = useState("All")
  const [pageSize, setPageSize] = useState(10)

  // For now, we'll use mock stages - in a real app, this could come from the active deals
  const availableStages = useMemo(() => {
    // This could be populated from API data or made dynamic
    return [
      "Contact Form Submitted",
      "Request for Services Submitted", 
      "Agreement Sent",
      "Service Contract Under Review",
      "Soil Data Collection",
      "Analyst Team",
      "Report Complete/Not Paid",
      "Won"
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
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
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