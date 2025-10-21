"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeadsFiltersProps {
  searchText: string
  setSearchText: (value: string) => void
  yearFilter: string
  setYearFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

export function LeadsFilters({
  searchText,
  setSearchText,
  yearFilter,
  setYearFilter,
  statusFilter,
  setStatusFilter
}: LeadsFiltersProps) {
  const [localSearchText, setLocalSearchText] = useState(searchText)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchText(value)
    
    // Debounce search to avoid too many API calls
    setTimeout(() => {
      setSearchText(value)
    }, 300)
  }

  const clearFilters = () => {
    setLocalSearchText("")
    setSearchText("")
    setYearFilter("All years")
    setStatusFilter("All")
  }

  const hasActiveFilters = searchText !== "" || yearFilter !== "All years" || statusFilter !== "All"

  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Input
            placeholder="Search leads, contacts, or email..."
            value={localSearchText}
            onChange={handleSearchChange}
            className="w-full md:w-80"
          />
          
          <div className="flex gap-2">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All years">All years</SelectItem>
                <SelectItem value="This year">This year</SelectItem>
                <SelectItem value="Last year">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchText && (
            <Badge variant="secondary" className="text-xs">
              Search: "{searchText}"
            </Badge>
          )}
          {yearFilter !== "All years" && (
            <Badge variant="secondary" className="text-xs">
              Year: {yearFilter}
            </Badge>
          )}
          {statusFilter !== "All" && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}