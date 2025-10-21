"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useState } from "react"
import { LeadsFilters } from "@/components/leads/leads-filters"
import { ActiveLeadsTable } from "@/components/leads/active-leads-table"

export default function LeadsPage() {
  // Shared filter state
  const [searchText, setSearchText] = useState("")
  const [yearFilter, setYearFilter] = useState("All years")
  const [statusFilter, setStatusFilter] = useState("All")

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Leads Management</h1>
          <p className="text-gray-600">Track and manage your sales leads through their lifecycle</p>
        </div>

        <LeadsFilters
          searchText={searchText}
          setSearchText={setSearchText}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <ActiveLeadsTable
          searchText={searchText}
          yearFilter={yearFilter}
          statusFilter={statusFilter}
        />
      </main>
      <Footer />
    </div>
  )
}
