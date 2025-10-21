"use client"

import { BarChart3, Users, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Drawer, Button, message, Divider } from "antd"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    message.success(`${label} copied to clipboard!`)
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-[#4a9d6f] p-1">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Kv0q55cARkvzD4tpBpzdOKq8ulAcue.png"
                alt="BoaSafra Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-[#2d5f4a]">Referral Partner Portal</span>
          </Link>

          <nav className="flex gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 border-b-2 pb-4 pt-5 text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "border-[#4a9d6f] text-[#2d5f4a]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/leads"
              className={`flex items-center gap-2 border-b-2 pb-4 pt-5 text-sm font-medium transition-colors ${
                pathname === "/leads"
                  ? "border-[#4a9d6f] text-[#2d5f4a]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="h-4 w-4" />
              Leads
            </Link>
            <Link
              href="/deals"
              className={`flex items-center gap-2 border-b-2 pb-4 pt-5 text-sm font-medium transition-colors ${
                pathname === "/deals"
                  ? "border-[#4a9d6f] text-[#2d5f4a]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Deals
            </Link>
          </nav>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a9d6f] text-white">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium">John Smith</span>
        </button>

        <Drawer
          title="User Profile"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={400}
        >
          <div className="flex h-full min-h-full flex-col">
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4a9d6f] text-white">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">john.smith@example.com</div>
                </div>
              </div>

              <Divider />

              {/* Referral Partner Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Referral Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Your URL</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm text-gray-700 truncate bg-gray-50 px-3 py-2 rounded">
                        https://soiltest.com/ref/johnsmith
                      </div>
                      <Button
                        size="small"
                        type="default"
                        onClick={() => copyToClipboard("https://soiltest.com/ref/johnsmith", "URL")}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Your Code</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded">
                        JSMITH2024
                      </div>
                      <Button size="small" type="default" onClick={() => copyToClipboard("JSMITH2024", "Code")}>
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Settings Menu */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Settings</h3>
                <div className="space-y-2">
                  <Button type="default" block className="text-left" style={{ textAlign: "left" }}>
                    Change Password
                  </Button>
                  <Button type="default" block className="text-left" style={{ textAlign: "left" }}>
                    Email Preferences
                  </Button>
                  <Button type="default" block className="text-left" style={{ textAlign: "left" }}>
                    Notification Settings
                  </Button>
                  <Button type="default" block className="text-left" style={{ textAlign: "left" }}>
                    Check for Updates
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom area with Logout */}
            <div className="mt-auto pt-4">
              <Divider />
              <Button type="default" danger block size="large">
                Logout
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    </header>
  )
}
