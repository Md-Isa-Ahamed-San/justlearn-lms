"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  BookOpen,
  Settings,
  Bell,
  CreditCard,
  BadgeIcon as Certificate,
  LogOut,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  {
    label: "Profile",
    href: "/account",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Enrolled Courses",
    href: "/account/enrolled-courses",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    label: "Certificates",
    href: "/account/certificates",
    icon: <Certificate className="h-4 w-4" />,
  },
  {
    label: "Notifications",
    href: "/account/notifications",
    icon: <Bell className="h-4 w-4" />,
    badge: "3",
  },
  {
    label: "Billing",
    href: "/account/billing",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]

function Menu() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {menuItems.map((item, index) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={index}
            href={item.href}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium
               group relative
             
            `}
          >
            <div className="flex items-center gap-3">
              <span >
                {item.icon}
              </span>
              {item.label}
            </div>

            {item.badge && (
              <span className=" text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                {item.badge}
              </span>
            )}

            {isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8  rounded-l-md" />}

            {!item.badge && !isActive && (
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
            )}
          </Link>
        )
      })}

      {/* Sign Out Button - Separated from navigation items */}
      <div className="pt-4 mt-4 border-t border-border">
        <Link
          href="/logout"
          className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Link>
      </div>
    </nav>
  )
}

export default Menu
