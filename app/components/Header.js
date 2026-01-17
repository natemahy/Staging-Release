'use client'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Package, Truck, Shield } from 'lucide-react'

export default function Header({ role }) {
  const safeRole = role || 'vendor'; 

  return (
    <div className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
      <div className="font-bold text-xl flex items-center gap-2">
        <Package className="text-blue-400" /> 
        Receiving & Staging Portal 
        <span className={`text-xs px-2 py-1 rounded uppercase ${safeRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
          {safeRole}
        </span>
      </div>

      <nav className="hidden md:flex gap-6 text-sm font-medium">
        
        {/* ADMIN LINKS */}
        {safeRole === 'admin' && (
          <>
            <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-purple-300 transition-colors">
              <Shield size={16} /> Admin Control
            </Link>
            <Link href="/admin/users" className="flex items-center gap-1 hover:text-purple-300 transition-colors">
              <Shield size={16} /> Users
            </Link>
          </>
        )}

        {/* VENDOR/CUSTOMER LINKS */}
        {safeRole !== 'admin' && (
          <>
            <Link href={`/${safeRole}/dashboard`} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href={`/${safeRole}/shipments`} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
              <Package size={16} /> Shipments
            </Link>
          </>
        )}

        {/* VENDOR ONLY */}
        {safeRole === 'vendor' && (
          <Link href="/vendor/check-in" className="flex items-center gap-1 hover:text-blue-300 transition-colors">
            <Truck size={16} /> Check-In
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/login" className="flex items-center gap-1 text-slate-400 hover:text-white text-xs">
          <LogOut size={14} /> Sign Out
        </Link>
      </div>
    </div>
  )
}