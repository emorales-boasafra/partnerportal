"use client"

import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
import { type LeadData } from "@/lib/mock-data"

interface DealExpandedRowProps {
  record: LeadData
}

export function DealExpandedRow({ record }: DealExpandedRowProps) {
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
        {/* Segmented progress bar: completed = green, current = green, next = darker gray, future = light gray */}
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
                  : i === currentIndex
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
                {stage.completed || stage.current ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                    ✓
                  </div>
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