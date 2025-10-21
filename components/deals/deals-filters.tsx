"use client"

import { Input, Select } from "antd"

interface DealsFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  yearFilter: string
  onYearChange: (value: string) => void
  stageFilter: string
  onStageChange: (value: string) => void
  availableStages: string[]
  pageSize?: number
  onPageSizeChange?: (value: number) => void
  showPageSizeSelector?: boolean
}

export function DealsFilters({
  searchText,
  onSearchChange,
  yearFilter,
  onYearChange,
  stageFilter,
  onStageChange,
  availableStages,
  pageSize,
  onPageSizeChange,
  showPageSizeSelector = false,
}: DealsFiltersProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
      <div className="flex gap-3">
        <Input
          placeholder="Search Lead Name..."
          style={{ width: 200 }}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
        <Select
          value={yearFilter}
          style={{ width: 120 }}
          onChange={onYearChange}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
        >
          <Select.Option value="This year">This year</Select.Option>
          <Select.Option value="Last year">Last year</Select.Option>
          <Select.Option value="All years">All years</Select.Option>
        </Select>
        <Select
          value={stageFilter}
          style={{ width: 180 }}
          onChange={onStageChange}
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
        >
          <Select.Option value="All">All Stages</Select.Option>
          {availableStages.map((stage: string) => (
            <Select.Option key={stage} value={stage}>
              {stage}
            </Select.Option>
          ))}
        </Select>
        {showPageSizeSelector && pageSize && onPageSizeChange && (
          <>
            <span className="text-sm text-gray-600 self-center">Items per load:</span>
            <Select
              value={pageSize}
              style={{ width: 80 }}
              onChange={onPageSizeChange}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            >
              <Select.Option value={5}>5</Select.Option>
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={20}>20</Select.Option>
              <Select.Option value={50}>50</Select.Option>
            </Select>
          </>
        )}
      </div>
    </div>
  )
}