'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Package, Truck, Home } from 'lucide-react'

export default function Header({ role }) {
  const pathname = usePathname()

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO AREA */}
        <div className="font-bold text-xl tracking-wide flex items-center gap-2">
          <Package className="text-blue-400" />
          <span>PORTAL<span className="text-blue-400">SYNC</span></span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          
          {/* VENDOR MENU */}
          {role === 'vendor' && (
            <>
              <Link href="/vendor/dashboard" className={pathname === '/vendor/dashboard' ? 'text-blue-400' : 'hover:text-blue-300'}>Dashboard</Link>
              <Link href="/vendor/check-in" className={pathname === '/vendor/check-in' ? 'text-blue-400' : 'hover:text-blue-300'}>Check-In</Link>
              <Link href="/vendor/shipments" className={pathname.includes('/vendor/shipments') ? 'text-blue-400' : 'hover:text-blue-300'}>History</Link>
            </>
          )}

          {/* ADMIN MENU */}
          {role === 'admin' && (
            <>
              <Link href="/admin/dashboard" className={pathname === '/admin/dashboard' ? 'text-purple-400' : 'hover:text-purple-300'}>Dashboard</Link>
              <Link href="/admin/shipments" className={pathname.includes('/admin/shipments') ? 'text-purple-400' : 'hover:text-purple-300'}>All Shipments</Link>
              <Link href="/admin/users" className={pathname === '/admin/users' ? 'text-purple-400' : 'hover:text-purple-300'}>Users</Link>
            </>
          )}

          {/* CUSTOMER MENU (THIS WAS MISSING) */}
          {role === 'customer' && (
            <>
              <Link href="/customer/dashboard" className={pathname === '/customer/dashboard' ? 'text-green-400' : 'hover:text-green-300'}>Dashboard</Link>
              <Link href="/customer/shipments" className={pathname.includes('/customer/shipments') ? 'text-green-400' : 'hover:text-green-300'}>My Shipments</Link>
            </>
          )}

        </nav>

        {/* LOGOUT BUTTON */}
        <form action="/logout" method="POST">
           <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
             <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
           </button>
        </form>

      </div>
    </header>
  )
}